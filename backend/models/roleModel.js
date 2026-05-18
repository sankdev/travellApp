const { Sequelize, DataTypes } = require("sequelize");
const bd = require("../config/bd");
const Permission = require("./PermissionModel");
const RolePermission=require('./RolepermissionModel')
//const RolePermission = require("./RolePermissionModel");

const Role = bd.define("Role", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  createdBy: { type: DataTypes.INTEGER },
  updatedBy: { type: DataTypes.INTEGER },
});

Role.belongsToMany(Permission, { through: RolePermission, foreignKey: "roleId", as: "permissions" });

module.exports = Role;
