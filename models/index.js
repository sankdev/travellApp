const User = require("./userModel");
const Agency = require("./agenceModel");
const Destination = require("./destinationModel");
const Company = require("./Company");
const Vol = require("./volModel");
const Campaign = require("./compaign");
const Reservation = require("./booking");

User.hasMany(Reservation, { foreignKey: "userId", as: "reservations" });
Reservation.belongsTo(User, { foreignKey: "userId", as: "customer" });

// Agency.hasMany(Reservation, { foreignKey: "agencyId", as: "reservations" });
// Reservation.belongsTo(Agency, { foreignKey: "agencyId", as: "agency" });

Destination.hasMany(Reservation, { foreignKey: "destinationId", as: "reservations" });
Reservation.belongsTo(Destination, { foreignKey: "destinationId", as: "destination" });

Company.hasMany(Reservation, { foreignKey: "companyId", as: "reservations" });
// Reservation.belongsTo(Company, { foreignKey: "companyId", as: "company" });

Vol.hasMany(Reservation, { foreignKey: "volId", as: "reservations" });
Reservation.belongsTo(Vol, { foreignKey: "volId", as: "vol" });

Campaign.hasMany(Reservation, { foreignKey: "campaignId", as: "reservations" });
Reservation.belongsTo(Campaign, { foreignKey: "campaignId", as: "campaign" });

module.exports = {
  User,
  Agency,
  Destination,
  Company,
  Vol,
  Campaign,
  Reservation,
};
