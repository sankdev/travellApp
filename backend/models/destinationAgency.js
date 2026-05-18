const { DataTypes } = require("sequelize");
const db = require("../config/bd");
const Agency = require("./agenceModel");
const Destination = require("./destinationModel");

const DestinationAgency = db.define("DestinationAgency", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  destinationId: { type: DataTypes.INTEGER, allowNull: false },
  agencyId: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: "active" }
}, {
  timestamps: true,
  tableName: "destination_agencies"
});

// Relations
DestinationAgency.belongsTo(Destination, { foreignKey: "destinationId", as: "destination" });
DestinationAgency.belongsTo(Agency, { foreignKey: "agencyId", as: "agency" });
Destination.hasMany(DestinationAgency, { foreignKey: "destinationId", as: "destinationAgencies" });
Agency.hasMany(DestinationAgency, { foreignKey: "agencyId", as: "agencyDestinations" });

module.exports = DestinationAgency;
