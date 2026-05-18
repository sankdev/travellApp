const { Sequelize, DataTypes } = require("sequelize");
const bd = require("../config/bd");
const Role = require("./roleModel");
//const RolePermission = require("./RolePermissionModel");

const Permission = bd.define("Permission", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  createdBy: { type: DataTypes.INTEGER },
  updatedBy: { type: DataTypes.INTEGER },
});

//Permission.belongsToMany(Role, { through: RolePermission, foreignKey: "permissionId", as: "roles" });

module.exports = Permission;
