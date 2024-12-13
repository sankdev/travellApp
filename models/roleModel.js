const { Sequelize, DataTypes } = require("sequelize");
const bd = require("../config/bd");

const Role = bd.define("Role", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: Sequelize.STRING, allowNull: false },
  description: { type: Sequelize.TEXT },
  status: { type: Sequelize.STRING, defaultValue: "active" },
  createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  createdBy: { type: Sequelize.INTEGER, allowNull: true },
  updatedAt: { type: Sequelize.DATE },
  updatedBy: { type: Sequelize.INTEGER, allowNull: true },
});

module.exports = Role;
