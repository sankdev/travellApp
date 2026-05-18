const { DataTypes } = require("sequelize");
const db = require("../config/bd");
const Agency = require("./agenceModel");
const Destination = require("./destinationModel");

const Vol = db.define("Vol", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  // classId: { type: DataTypes.STRING, allowNull: false },
//  agencyId: { type: DataTypes.INTEGER, allowNull: true},

  companyId: { type: DataTypes.INTEGER, allowNull: false },
  destinationId: { type: DataTypes.INTEGER, allowNull: false },// Référence vers la destination finale
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: "active" },
//  startAt: { type: DataTypes.DATE, allowNull: true },
  //endAt: { type: DataTypes.DATE, allowNull: true},
  //prix:{type:DataTypes.FLOAT} ,
  originId: {type:DataTypes.INTEGER}, // Référence vers la destination d’origine
  
  createdBy: { type: DataTypes.INTEGER },
  updatedBy: { type: DataTypes.INTEGER },
}, {
  timestamps: true,
});

// Vol.belongsTo(Company, {
//   foreignKey: "companyId",
//   as: "volCompany",
// });

// Vol.belongsTo(Agency, {
//   foreignKey: "agencyId",
//   as: "VolAgency",
// });
// Vol.belongsTo(Agency, {
//   foreignKey: "agencyId",
//   as: "volAgency",
// });

// Agency.hasMany(Vol, {
//   foreignKey: "agencyId",
//   as: "vols",
// });

module.exports = Vol;
