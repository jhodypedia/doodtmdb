const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Setting",
    {
      key: { type: DataTypes.STRING(120), primaryKey: true },
      value: { type: DataTypes.TEXT("long"), allowNull: false }
    },
    { tableName: "settings", timestamps: true }
  );
};
