const { Sequelize, DataTypes } = require("sequelize");
const bd = require("../config/bd");

const RolePermission = bd.define("RolePermission", {
    roleId: Sequelize.INTEGER,
    permissionId: Sequelize.INTEGER,
    status: Sequelize.STRING,
  }, { timestamps: true });
  

  module.exports={RolePermission}