const { DataTypes } = require("sequelize");
const db = require("../config/bd");
const Agency = require("./agenceModel");
const Class = require("./classModel");

const ClassAgency = db.define("ClassAgency", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  classId: { type: DataTypes.INTEGER, allowNull: false },
  agencyVolId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
   price: {
    type: DataTypes.DECIMAL(15,2),
    allowNull: true
  },
  agencyId: { type: DataTypes.INTEGER, allowNull: true },
  priceMultiplier:{type:DataTypes.FLOAT}, // Prix défini par l'agence pour cette classe
  status: { type: DataTypes.STRING, defaultValue: "active" }
}, {
  timestamps: true,
  tableName: "class_agencies"
});

// Relations
//ClassAgency.belongsTo(Class, { foreignKey: "classId", as: "class" });
//ClassAgency.belongsTo(Agency, { foreignKey: "agencyId", as: "agency" });
//Class.hasMany(ClassAgency, { foreignKey: "classId", as: "classAgencies" });
//Agency.hasMany(ClassAgency, { foreignKey: "agencyId", as: "agencyClasses" });

module.exports = ClassAgency;
