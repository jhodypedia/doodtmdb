const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Visit",
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      dayKey: { type: DataTypes.STRING(10), allowNull: false }, // YYYY-MM-DD
      path: { type: DataTypes.STRING(500), allowNull: false },
      ipHash: { type: DataTypes.STRING(128), allowNull: false },
      ua: { type: DataTypes.STRING(255), allowNull: true },
      ref: { type: DataTypes.STRING(500), allowNull: true },
      movieId: { type: DataTypes.INTEGER, allowNull: true }
    },
    { tableName: "visits", timestamps: true }
  );
};
