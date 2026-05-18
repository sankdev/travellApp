const { DataTypes } = require("sequelize");
const db = require("../config/bd");
const Agency = require("./agenceModel");
const Vol = require("./volModel");

const FlightAgency = db.define("FlightAgency", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  volId: { type: DataTypes.INTEGER, allowNull: false },
  //agencyId: { type: DataTypes.INTEGER, allowNull: false },
//  price: { type: DataTypes.DECIMAL(15,2), allowNull: false }, // Prix défini par l'agence pour ce vol
  departureTime: { 
    type: DataTypes.DATE, 
    allowNull: true
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  arrivalTime: { 
    type: DataTypes.DATE, 
    allowNull: true 
  },
  status: { type: DataTypes.STRING, defaultValue: "active" }
}, {
  timestamps: true,
  tableName: "flight_agencies"
});

// Relations
FlightAgency.belongsTo(Vol, { foreignKey: "volId", as: "flight" });
FlightAgency.belongsTo(Agency, { foreignKey: "agencyId", as: "agency" });
Vol.hasMany(FlightAgency, { foreignKey: "volId", as: "flightAgencies" });
Agency.hasMany(FlightAgency, { foreignKey: "agencyId", as: "agencyFlights" });

module.exports = FlightAgency;
