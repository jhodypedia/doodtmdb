const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "AdminUser",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      email: { type: DataTypes.STRING(190), unique: true, allowNull: false },
      passwordHash: { type: DataTypes.STRING(255), allowNull: false }
    },
    { tableName: "admin_users", timestamps: true }
  );
};
