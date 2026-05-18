const { DataTypes } = require("sequelize");
const db = require("../config/bd");
const Agency = require("./agenceModel");
const Company = require("./Company");
const AgencyVol = require("./flightAgency");
const AgencyClass = require("./agencyClass");

const PricingRule = db.define("PricingRule", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//  agencyId: { type: DataTypes.INTEGER, allowNull: false }, // L'agence qui définit les prix
//   companyId: { type: DataTypes.INTEGER, allowNull: true }, // Optionnel : Si c'est défini par la compagnie
  //agencyVolId: { type: DataTypes.INTEGER, allowNull: false }, // Le vol concerné
  agencyClassId: { type: DataTypes.INTEGER, allowNull: false }, // La classe concernée
  typePassenger: { type: DataTypes.ENUM("ADL", "CHD", "INF"), allowNull: false }, // Adulte, Enfant, Nourrisson
  price: { type: DataTypes.FLOAT, allowNull: false }, // Prix défini
}, {
  timestamps: true,
  tableName: "pricing_rules",

});
PricingRule.belongsTo(AgencyClass, {
  foreignKey: "agencyClassId",
  as: "agencyClass"
});

AgencyClass.hasMany(PricingRule, {
  foreignKey: "agencyClassId",
  as: "pricingRules"
});
// Associations
//PricingRule.belongsTo(Agency, { foreignKey: "agencyId", as: "agency" });
//PricingRule.belongsTo(Company, { foreignKey: "companyId", as: "company" });
//PricingRule.belongsTo(AgencyVol, { foreignKey: "agencyVolId", as: "vol" });
//PricingRule.belongsTo(AgencyClass, { foreignKey: "agencyClassId", as: "class" });

module.exports = PricingRule;
