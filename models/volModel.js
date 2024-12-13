const { DataTypes } = require("sequelize");
const db = require("../config/bd");
const Reservation=('./Booking.js')
const Vol = db.define("Vol", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  classId: { type: DataTypes.STRING, allowNull: false },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  destinationId: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  startAt: { type: DataTypes.DATE, allowNull: false },
  endAt: { type: DataTypes.DATE, allowNull: false },
  createdBy: { type: DataTypes.INTEGER },
  updatedBy: { type: DataTypes.INTEGER },
}, {
  timestamps: true,
});

module.exports = Vol;
