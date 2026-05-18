const { Sequelize, DataTypes } = require("sequelize");
const bd = require("../config/bd");
const User = require('./userModel');
const Role = require('./roleModel');

const UserRole = bd.define("UserRole", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  roleId: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  createdBy: { type: DataTypes.INTEGER, allowNull: true },
  updatedAt: { type: DataTypes.DATE },
  updatedBy: { type: DataTypes.INTEGER, allowNull: true },
}); 

// UserRole.belongsTo(User, { foreignKey: "userId", as: "user" });
// UserRole.belongsTo(Role, { foreignKey: "roleId", as: "role" });

module.exports = UserRole;
