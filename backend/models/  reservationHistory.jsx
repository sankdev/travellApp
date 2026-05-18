const { DataTypes } = require("sequelize");
const  Reservation =require('./booking.js')
const db = require("../config/bd");
// models/Rese
const ReservationHistory = db.define("ReservationHistory", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reservationId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  changedBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  previousData: {
    type: DataTypes.JSON,
    allowNull: true
  },
  newData: {
    type: DataTypes.JSON,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = ReservationHistory;
