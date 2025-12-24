require("dotenv").config();
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const rateLimit = require("express-rate-limit");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const expressLayouts = require("express-ejs-layouts");

const { sequelize } = require("./models");
const { initApp } = require("./config/init");
const { visitorTracker } = require("./middlewares/visitor");

const pagesRouter = require("./routes/pages");
const apiRouter = require("./routes/api");
const adminRouter = require("./routes/admin");

const app = express();

app.set("trust proxy", 1);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout");

app.use(helmet({
  contentSecurityPolicy: false // karena kita pakai CDN & iframe dood. (bisa diperketat nanti)
}));
app.use(compression());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(path.join(__dirname, "public"), { maxAge: "7d" }));

app.use(rateLimit({ windowMs: 60 * 1000, limit: 180 }));

const store = new SequelizeStore({ db: sequelize });
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    store,
    cookie: { httpOnly: true, sameSite: "lax" }
  })
);

app.use(visitorTracker());

// routes
app.use("/", pagesRouter);
app.use("/api", apiRouter);
app.use("/admin", adminRouter);

// 404
app.use(async (req, res) => {
  res.status(404).render("pages/notfound", {
    layout: "layout",
    settings: { site_name: process.env.SITE_NAME || "PansaDood" },
    meta: { title: "404 Not Found" }
  });
});

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await store.sync();
    await initApp();

    const port = Number(process.env.PORT || 3000);
    app.listen(port, () => console.log(`✅ Running: http://localhost:${port}`));
  } catch (e) {
    console.error("BOOT ERROR:", e);
    process.exit(1);
  }
})();
