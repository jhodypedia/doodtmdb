const sequelize = require("../config/db");

const AdminUser = require("./AdminUser")(sequelize);
const Setting = require("./Setting")(sequelize);
const Movie = require("./Movie")(sequelize);
const Visit = require("./Visit")(sequelize);

Movie.hasMany(Visit, { foreignKey: "movieId" });
Visit.belongsTo(Movie, { foreignKey: "movieId" });

module.exports = { sequelize, AdminUser, Setting, Movie, Visit };
