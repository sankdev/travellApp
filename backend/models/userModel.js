const { Sequelize, DataTypes } = require("sequelize");
const db = require("../config/bd.js");
const UserRole = require("./userRoleModel");

const User = db.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  passwordChangedAt: {
    type: DataTypes.DATE,
  },
  passwordResetToken: {
    type: DataTypes.STRING,
  },
  passwordResetExpire: {
    type: DataTypes.DATE,
  },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  createdBy: { type: DataTypes.INTEGER, allowNull: true },
  updatedAt: { type: DataTypes.DATE },
  updatedBy: { type: DataTypes.INTEGER, allowNull: true },
});

// User.hasMany(UserRole, { foreignKey: 'userId', as: 'userRoles' });

module.exports = User;
