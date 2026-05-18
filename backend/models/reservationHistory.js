const { DataTypes } = require("sequelize");
const User=require('./userModel')
const  Reservation =require('./booking.js')
const db = require("../config/bd");
// models/ReservationHistory.js
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
    type: DataTypes.STRING, // e.g., 'create', 'update', 'proposal', 'reject', 'accept'
    allowNull: false
  },
  changedBy: {
    type: DataTypes.INTEGER, // userId
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
  timestamps: true // Ajout de createdAt et updatedAt automatiquement
});

//ReservationHistory.belongsTo(Reservation, {
 // foreignKey: "reservationId",
 // as: "reservation"
//});

//ReservationHistory.belongsTo(User, {
  //foreignKey: "changedBy",
  //as: "actor"
//});


module.exports = ReservationHistory;

