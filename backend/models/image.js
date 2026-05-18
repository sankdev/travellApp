const { DataTypes } = require('sequelize');
const db=require('../config/bd')
const Campaign = require('./compaign');

const Image = db.define('Image', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'active'
  },
  campaignId: {
    type: DataTypes.INTEGER,
    allowNull: true, 
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  agencyId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  destinationId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
}, {
  timestamps: true,
});



module.exports = Image;
