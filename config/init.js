const bcrypt = require("bcryptjs");
const { AdminUser, Setting } = require("../models");

async function upsertSetting(key, value) {
  const s = await Setting.findByPk(key);
  if (!s) await Setting.create({ key, value });
}

module.exports.initApp = async () => {
  // default settings
  await upsertSetting("site_name", process.env.SITE_NAME || "PansaDood");
  await upsertSetting("site_desc", process.env.SITE_DESC || "Streaming Film & Series");

  // Embed template:
  // Gunakan {ID} sebagai placeholder. Jika admin isi embedIdOrUrl full URL, sistem tetap akan coba pakai url itu.
  await upsertSetting("embed_template", "https://doodstream.com/e/{ID}");
  await upsertSetting("ad_banner_top", "");    // HTML Adsterra
  await upsertSetting("ad_banner_middle", ""); // HTML Adsterra
  await upsertSetting("ad_banner_bottom", ""); // HTML Adsterra

  // admin bootstrap
  const count = await AdminUser.count();
  if (count === 0) {
    const email = process.env.ADMIN_EMAIL || "admin@local.dev";
    const pass = process.env.ADMIN_PASSWORD || "admin12345";
    const passwordHash = await bcrypt.hash(pass, 12);
    await AdminUser.create({ email, passwordHash });
    console.log("[INIT] Admin created:", email);
  }
};
