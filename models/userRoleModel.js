const { Sequelize, DataTypes } = require("sequelize");
const User=require('./userModel')
const Role=require('./roleModel')
const bd = require("../config/bd");

const UserRole = bd.define("UserRole", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: Sequelize.INTEGER, allowNull: false },
  roleId: { type: Sequelize.INTEGER, allowNull: false },
  status: { type: Sequelize.STRING, defaultValue: "active" },
  createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  createdBy: { type: Sequelize.INTEGER, allowNull: true },
  updatedAt: { type: Sequelize.DATE },
  updatedBy: { type: Sequelize.INTEGER, allowNull: true },
});
// UserRole.BelonTo(User,{ForeignKeys:"userId"})
// UserRole.BelonTo(Role,{ForeignKeys:"roleId"})

module.exports = UserRole;
