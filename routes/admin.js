const express = require("express");
const bcrypt = require("bcryptjs");
const { nanoid } = require("nanoid");
const router = express.Router();
const { requireAdmin } = require("../middlewares/auth");
const { AdminUser, Setting, Movie, Visit, sequelize } = require("../models");

async function getSettingsMap() {
  const rows = await Setting.findAll();
  const map = {};
  for (const r of rows) map[r.key] = r.value;
  return map;
}

router.get("/login", async (req, res) => {
  const settings = await getSettingsMap();
  res.render("admin/login", { layout: "layout", settings, meta: { title: "Admin Login" } });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const admin = await AdminUser.findOne({ where: { email } });
  if (!admin) return res.redirect("/admin/login?err=1");
  const ok = await bcrypt.compare(String(password || ""), admin.passwordHash);
  if (!ok) return res.redirect("/admin/login?err=1");

  req.session.adminId = admin.id;
  res.redirect("/admin");
});

router.post("/logout", requireAdmin, async (req, res) => {
  req.session.destroy(() => res.redirect("/admin/login"));
});

router.get("/", requireAdmin, async (req, res) => {
  const settings = await getSettingsMap();

  const totalVisits = await Visit.count();
  const totalMovies = await Movie.count();
  const totalViews = (await Movie.sum("views")) || 0;

  // visits by day (last 14 days)
  const [rows] = await sequelize.query(`
    SELECT dayKey, COUNT(*) as c
    FROM visits
    GROUP BY dayKey
    ORDER BY dayKey DESC
    LIMIT 14
  `);

  const chart = rows.reverse();

  res.render("admin/dashboard", {
    layout: "layout",
    settings,
    meta: { title: "Admin Dashboard" },
    stats: { totalVisits, totalMovies, totalViews },
    chart
  });
});

router.get("/settings", requireAdmin, async (req, res) => {
  const settings = await getSettingsMap();
  res.render("admin/settings", { layout: "layout", settings, meta: { title: "Settings" } });
});

router.post("/settings", requireAdmin, async (req, res) => {
  const keys = ["site_name", "site_desc", "embed_template", "ad_banner_top", "ad_banner_middle", "ad_banner_bottom"];
  for (const k of keys) {
    const val = String(req.body[k] ?? "");
    await Setting.upsert({ key: k, value: val });
  }
  res.redirect("/admin/settings?saved=1");
});

router.get("/movies", requireAdmin, async (req, res) => {
  const settings = await getSettingsMap();
  const movies = await Movie.findAll({ order: [["createdAt", "DESC"]], limit: 200 });
  res.render("admin/movies", { layout: "layout", settings, meta: { title: "Movies" }, movies });
});

router.post("/movies/create", requireAdmin, async (req, res) => {
  const title = String(req.body.title || "").trim();
  if (!title) return res.redirect("/admin/movies?err=1");
  const slug =
    String(req.body.slug || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${nanoid(6)}`;

  await Movie.create({
    slug,
    title,
    year: String(req.body.year || "").trim() || null,
    genre: String(req.body.genre || "").trim() || null,
    posterUrl: String(req.body.posterUrl || "").trim() || null,
    backdropUrl: String(req.body.backdropUrl || "").trim() || null,
    description: String(req.body.description || "").trim() || null,
    embedIdOrUrl: String(req.body.embedIdOrUrl || "").trim(),
    isPublished: req.body.isPublished === "on"
  });

  res.redirect("/admin/movies?ok=1");
});

router.post("/movies/:id/update", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await Movie.update(
    {
      title: String(req.body.title || "").trim(),
      year: String(req.body.year || "").trim() || null,
      genre: String(req.body.genre || "").trim() || null,
      posterUrl: String(req.body.posterUrl || "").trim() || null,
      backdropUrl: String(req.body.backdropUrl || "").trim() || null,
      description: String(req.body.description || "").trim() || null,
      embedIdOrUrl: String(req.body.embedIdOrUrl || "").trim(),
      isPublished: req.body.isPublished === "on"
    },
    { where: { id } }
  );
  res.redirect("/admin/movies?updated=1");
});

router.post("/movies/:id/delete", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await Movie.destroy({ where: { id } });
  res.redirect("/admin/movies?deleted=1");
});

module.exports = router;
