const { DataTypes } = require("sequelize");
const bd = require("../config/bd");
const Image = require('../models/image');

const Destination = bd.define("Destination", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: DataTypes.STRING,
  address: DataTypes.STRING,
  city: DataTypes.STRING,
  country: DataTypes.STRING,
  continent: DataTypes.STRING,
 status: { type: DataTypes.STRING, defaultValue: "active" }
,
  createdBy: DataTypes.INTEGER,
  updatedBy: DataTypes.INTEGER,
}, {
  timestamps: true,
});

// Define the relationship with the Image model
// Destination.hasMany(Image, {
//   foreignKey: "destinationId",
//   as: "images",
// });

// Image.belongsTo(Destination, {
//   foreignKey: "destinationId",
//   as: "destinationImages",
// });

module.exports = Destination;
