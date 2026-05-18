const  {Sequelize,DataTypes } = require("sequelize");
const  db  = require("../config/bd.js");
const User = require("./userModel.js");
// const Customer =require('../models/customer.js')
const Agency = require("./agenceModel.js");
const Destination = require("./destinationModel");
//const Campany = require("./Company.js");
const Vol = require("./volModel.js");
const Campaign = require("./compaign.js");
const Customer=require('./customer.js')
const AgencyClass=require('./agencyClass.js')
const AgencyVol=require('./flightAgency.js')

const Reservation = db.define('Reservation', {
  customerId: { type: DataTypes.INTEGER, allowNull: false }, // User (Customer) qui fait la réservation
  agencyId: { type: DataTypes.INTEGER, allowNull: false },
   destinationId: { type: DataTypes.INTEGER, allowNull: true },
   companyId: { type: DataTypes.INTEGER,allowNull:true },
   volId: { type: DataTypes.INTEGER,allowNull:true },
  agencyVolId: { type: DataTypes.INTEGER,allowNull:true },
 agencyClassId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  campaignId: { type: DataTypes.INTEGER,allowNull:true },
  startAt: { type: DataTypes.DATE, allowNull: true },
  endAt: { type: DataTypes.DATE, allowNull: true,defaultValue: null },
  description: { type: DataTypes.TEXT },
  status: { type:DataTypes.STRING, defaultValue: "Pending" }, // Pending, Confirmed, Cancelled
  typeDocument: { type: DataTypes.STRING },
  numDocument: { type: DataTypes.STRING },
  classId:{type:DataTypes.INTEGER,allowNull:true},
  agencyClassId:{type:DataTypes.INTEGER,allowNull:true},

  tripType:{ type: DataTypes.STRING },
  returnVolId:{ type: DataTypes.INTEGER, allowNull: true ,defaultValue: null},
  startDestinationId: { type: DataTypes.INTEGER, allowNull: true}, // Départ
  endDestinationId: { type: DataTypes.INTEGER, allowNull: true }, // Arrivée
  totalPrice: { type: DataTypes.FLOAT, allowNull: true },
 // status: {
 // type: DataTypes.ENUM('pending', 'demand', 'counter_proposal', 'accepted', 'rejected', 'confirmed'),
  //allowNull: true,
//  defaultValue: 'pending'
//}

originalDemandId: {
  type: DataTypes.INTEGER, // Pour suivre la demande originale
  allowNull: true
},
rejectionReason: {
  type: DataTypes.TEXT,
  allowNull: true
},
proposalDetails: {
  type: DataTypes.JSON, // Stocker les détails de la contre-proposition
  allowNull: true
},
  document: { type: DataTypes.STRING },
  createdBy: { type: DataTypes.INTEGER },
  updatedBy: { type: DataTypes.INTEGER },
}, {
  timestamps: true,
});
// Ajoutez ce hook à votre modèle
Reservation.beforeCreate((reservation, options) => {
    // Si tripType n'est pas round-trip, forcez endAt à null
    if (reservation.tripType !== 'round-trip') {
        reservation.endAt = null;
    }
});

Reservation.beforeUpdate((reservation, options) => {
    // Même chose pour les updates
    if (reservation.tripType !== 'round-trip') {
        reservation.endAt = null;
    }
});
// Associations
// Reservation.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });
// Reservation.belongsTo(Agency, { foreignKey: "agencyId", as: "agency" });
// Reservation.belongsTo(Destination, { foreignKey: "destinationId", as: "destination" });

// Reservation.belongsTo(Vol, { foreignKey: "volId", as: "vol" });
// Reservation.belongsTo(Campaign, { foreignKey: "campaignId", as: "campaign" });

// User.hasMany(Reservation, { foreignKey: "userId", as: "reservations" });
AgencyVol.hasMany(Reservation,{foreignKey:'agencyVolId',as:'reservation'})
Reservation.belongsTo(AgencyVol, { foreignKey: "agencyVolId", as: "vols" });
Reservation.belongsTo(AgencyClass, { foreignKey: "agencyClassId", as: "class" });
Reservation.belongsTo(Destination, { as: 'startDestination', foreignKey: 'startDestinationId' });
Reservation.belongsTo(Destination, { as: 'endDestination', foreignKey: 'endDestinationId' });

module.exports = Reservation;
