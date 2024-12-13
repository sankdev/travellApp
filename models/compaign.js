const { DataTypes } = require("sequelize");
const Image=require('../models/image')
const db = require("../config/bd");

const Campaign = db.define("Campaign", {
  agency: DataTypes.INTEGER,
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: DataTypes.STRING,
  description: DataTypes.STRING,
  condition: DataTypes.STRING,
  startAt: DataTypes.DATE,
  endAt: DataTypes.DATE,
  price: DataTypes.FLOAT,
  company: DataTypes.INTEGER,
  vol: DataTypes.INTEGER,
  destination: DataTypes.INTEGER,
  image1: DataTypes.STRING,
  image2: DataTypes.STRING,
  image3: DataTypes.STRING,
  status: DataTypes.STRING,
  createdBy: DataTypes.INTEGER,
  updatedBy: DataTypes.INTEGER,
}, {
  timestamps: true,
});

Campaign.hasMany(Image, {
    foreignKey: "imageable_id",
    constraints: false,
    scope: {
      imageable_type: "Compaign",
    },
  });
  
  Image.belongsTo(Campaign, {
    foreignKey: "imageable_id",
    constraints: false,
  });
  
module.exports = Campaign;
