const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Movie",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      slug: { type: DataTypes.STRING(220), unique: true, allowNull: false },
      title: { type: DataTypes.STRING(220), allowNull: false },
      year: { type: DataTypes.STRING(8), allowNull: true },
      genre: { type: DataTypes.STRING(120), allowNull: true },
      posterUrl: { type: DataTypes.TEXT, allowNull: true },
      backdropUrl: { type: DataTypes.TEXT, allowNull: true },
      description: { type: DataTypes.TEXT("long"), allowNull: true },
      // ini yang diisi admin: misal "abcd1234" atau full url. nanti dirakit via settings embed template
      embedIdOrUrl: { type: DataTypes.TEXT, allowNull: false },
      views: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      isPublished: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
    },
    { tableName: "movies", timestamps: true, indexes: [{ fields: ["slug"] }] }
  );
};
