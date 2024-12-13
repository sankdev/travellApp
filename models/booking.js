const  {Sequelize } = require("sequelize");
const  db  = require("../config/bd.js");
const User = require("./userModel.js");
// const Customer =require('../models/customer.js')
const Agency = require("./agenceModel.js");
const Destination = require("./destinationModel");
const Campany = require("./Company.js");
const Vol = require("./volModel.js");
const Campaign = require("./compaign.js");
const Customer=require('./customer.js')
const Reservation = db.define('Reservation', {
  customerId: { type: Sequelize.INTEGER, allowNull: false }, // User (Customer) qui fait la réservation
  agencyId: { type: Sequelize.INTEGER, allowNull: false },
  destinationId: { type: Sequelize.INTEGER, allowNull: false },
  companyId: { type: Sequelize.INTEGER },
  volId: { type: Sequelize.INTEGER },
  campaignId: { type: Sequelize.INTEGER,allowNull:true },
  startAt: { type: Sequelize.DATE, allowNull: false },
  endAt: { type: Sequelize.DATE, allowNull: false },
  description: { type: Sequelize.TEXT },
  status: { type: Sequelize.STRING, defaultValue: "Pending" }, // Pending, Confirmed, Cancelled
  typeDocument: { type: Sequelize.STRING },
  numDocument: { type: Sequelize.STRING },
  document: { type: Sequelize.STRING },
  createdBy: { type: Sequelize.INTEGER },
  updatedBy: { type: Sequelize.INTEGER },
}, {
  timestamps: true,
});

// Associations
// Reservation.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });
// Reservation.belongsTo(Agency, { foreignKey: "agencyId", as: "agency" });
// Reservation.belongsTo(Destination, { foreignKey: "destinationId", as: "destination" });
Reservation.belongsTo(Campany, { foreignKey: "companyId", as: "company" });
// Reservation.belongsTo(Vol, { foreignKey: "volId", as: "vol" });
// Reservation.belongsTo(Campaign, { foreignKey: "campaignId", as: "campaign" });

// User.hasMany(Reservation, { foreignKey: "userId", as: "reservations" });

module.exports = Reservation;