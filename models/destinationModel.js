const { DataTypes ,Sequelize} = require("sequelize");
const bd = require("../config/bd");
const Image=require('../models/image')

const Destination = bd.define("Destination", {
  id:{type:Sequelize.INTEGER,primaryKey:true},
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  location: Sequelize.STRING,
  address: Sequelize.STRING,
  city: Sequelize.STRING,
  country: Sequelize.STRING,
  continent: Sequelize.STRING,
  status: Sequelize.STRING,
  image1: Sequelize.STRING,
  image2: Sequelize.STRING,
  image3: Sequelize.STRING,
  createdBy: Sequelize.INTEGER,
  updatedBy: Sequelize.INTEGER,
}, {
  timestamps: true,
});
Destination.hasMany(Image, {
  foreignKey: "imageable_id",
  constraints: false,

});

Image.belongsTo(Destination, {
  foreignKey: "imageable_id",
  constraints: false,
});
module.exports = Destination;
