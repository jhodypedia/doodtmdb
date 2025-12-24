const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { Movie, Setting } = require("../models");

function buildEmbedUrl(embedTemplate, embedIdOrUrl) {
  const raw = String(embedIdOrUrl || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return String(embedTemplate || "").replace("{ID}", encodeURIComponent(raw));
}

router.get("/movies", async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(24, Math.max(6, Number(req.query.limit || 12)));
  const q = String(req.query.q || "").trim();

  const where = { isPublished: true };
  if (q) where.title = { [Op.like]: `%${q}%` };

  const offset = (page - 1) * limit;

  const [rows, settingsRows] = await Promise.all([
    Movie.findAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset
    }),
    Setting.findAll()
  ]);

  const settings = {};
  for (const r of settingsRows) settings[r.key] = r.value;

  const embedTemplate = settings.embed_template || "https://doodstream.com/e/{ID}";

  res.json({
    page,
    limit,
    items: rows.map((m) => ({
      id: m.id,
      slug: m.slug,
      title: m.title,
      year: m.year,
      genre: m.genre,
      posterUrl: m.posterUrl,
      description: m.description,
      views: m.views,
      embedUrl: buildEmbedUrl(embedTemplate, m.embedIdOrUrl)
    }))
  });
});

module.exports = router;
