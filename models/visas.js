const { DataTypes,Sequelize } = require("sequelize");
const sequelize = require("../config/bd");

const Visa = sequelize.define("Visa", {
  reservationId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  typeDocument: Sequelize.STRING,
  numDocument: Sequelize.STRING,
  document: Sequelize.STRING, // Path to the uploaded document file
  status: Sequelize.STRING,
  createdBy: Sequelize.INTEGER,
  updatedBy: Sequelize.INTEGER,
}, {
  timestamps: true,
});

module.exports = Visa;
