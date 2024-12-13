const { Sequelize, DataTypes } = require("sequelize");
const db = require("../config/bd.js");

const User = db.define("User", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: Sequelize.STRING, allowNull: false },
  email: { type: Sequelize.STRING, unique: true, allowNull: false },
  password: { type: Sequelize.STRING, allowNull: false },
 
  status: { type: Sequelize.STRING, defaultValue: "active" },
  passwordChangedAt: {
    type: Sequelize.DATE,
  },
  passwordResetToken: {
    type: Sequelize.STRING,
  },
  passwordResetExpire: {
    type: Sequelize.DATE,
  },
  createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  createdBy: { type: Sequelize.INTEGER, allowNull: true },
  updatedAt: { type: Sequelize.DATE },
  updatedBy: { type: Sequelize.INTEGER, allowNull: true },
});

module.exports = User;
