const crypto = require("crypto");
const { Visit, Movie } = require("../models");

function dayKeyNow() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function ipToHash(ip, secret) {
  return crypto.createHmac("sha256", secret).update(String(ip || "")).digest("hex");
}

module.exports.visitorTracker = () => {
  return async (req, res, next) => {
    try {
      if (req.path.startsWith("/public")) return next();
      if (req.path.startsWith("/api")) return next();
      if (req.path.startsWith("/admin")) return next();

      const ip =
        (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
        req.socket?.remoteAddress ||
        "0.0.0.0";

      const ua = (req.headers["user-agent"] || "").slice(0, 255);
      const ref = (req.headers["referer"] || "").slice(0, 500);

      const secret = process.env.SESSION_SECRET || "secret";
      const ipHash = ipToHash(ip, secret);
      const dayKey = dayKeyNow();

      let movieId = null;
      // pattern watch: /watch/:slug
      const m = req.path.match(/^\/watch\/([^\/]+)/);
      if (m && m[1]) {
        const slug = decodeURIComponent(m[1]);
        const movie = await Movie.findOne({ where: { slug } });
        if (movie) movieId = movie.id;
      }

      await Visit.create({
        dayKey,
        path: req.path.slice(0, 500),
        ipHash,
        ua,
        ref,
        movieId
      });

      next();
    } catch (e) {
      next();
    }
  };
};
