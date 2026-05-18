const { Sequelize, DataTypes } = require("sequelize");
const bd = require("../config/bd");

const RolePermission = bd.define("RolePermission", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  roleId: { type: DataTypes.INTEGER, allowNull: true },
  permissionId: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  createdBy: { type: DataTypes.INTEGER },
  updatedBy: { type: DataTypes.INTEGER },
}, { timestamps: true });

module.exports = RolePermission;
