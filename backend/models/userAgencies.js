const db = require('../config/bd');
const { DataTypes } = require('sequelize');
const User = require('./userModel');
const Agency = require('./agenceModel');

const UserAgency = db.define("UserAgency", {
  userId: {
    type: DataTypes.INTEGER,
    //references: { model: User, key: "id" },
  },
  agencyId: {
    type: DataTypes.INTEGER,
    //  references: { model: Agency, key: "id" },
  },
}, {
  tableName: "UserAgency", // Vérifie bien le nom dans ta BDD
  timestamps: false,
});


module.exports = UserAgency;
