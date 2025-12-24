const express = require("express");
const router = express.Router();
const { Movie, Setting } = require("../models");

async function getSettingsMap() {
  const rows = await Setting.findAll();
  const map = {};
  for (const r of rows) map[r.key] = r.value;
  return map;
}

router.get("/", async (req, res) => {
  const settings = await getSettingsMap();
  res.render("pages/home", {
    layout: "layout",
    meta: {
      title: settings.site_name,
      desc: settings.site_desc
    },
    settings
  });
});

router.get("/watch/:slug", async (req, res) => {
  const settings = await getSettingsMap();
  const movie = await Movie.findOne({ where: { slug: req.params.slug, isPublished: true } });
  if (!movie) return res.status(404).render("pages/notfound", { layout: "layout", settings });

  // increment views
  await Movie.update({ views: movie.views + 1 }, { where: { id: movie.id } });
  movie.views += 1;

  res.render("pages/watch", {
    layout: "layout",
    movie,
    settings,
    meta: {
      title: `${movie.title} - ${settings.site_name}`,
      desc: movie.description ? movie.description.slice(0, 160) : settings.site_desc
    }
  });
});

module.exports = router;
