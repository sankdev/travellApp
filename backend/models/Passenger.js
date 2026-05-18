const { DataTypes } = require("sequelize");
const db = require("../config/bd");
const Document = require("./Document");

const Passenger = db.define("Passenger", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  reservationId: { type: DataTypes.INTEGER, allowNull: false },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  gender: { type: DataTypes.ENUM("feminin", "masculin", "autres"), allowNull: false },
  birthDate: { type: DataTypes.DATE, allowNull: false },
  birthPlace: { type: DataTypes.STRING },
  nationality: { type: DataTypes.STRING },
  profession: { type: DataTypes.STRING },
  address: { type: DataTypes.TEXT },
  typePassenger: { 
    type: DataTypes.ENUM("ADLT", "CHD", "INF"), 
    allowNull: true 
}, // Type du passager : Adulte, Enfant, Nourrisson
  documentType: { type: DataTypes.STRING },
  documentNumber: { type: DataTypes.STRING },
  document: { type: DataTypes.JSON,allowNull:true },
  status: { type: DataTypes.ENUM("active", "inactive"), defaultValue: "active" },
}, {
  tableName: "passengers",
  timestamps: true,
});

Passenger.hasMany(Document, {
  foreignKey: "relatedEntityId",
  constraints: false,
  scope: { relatedEntity: "Passenger" },
   as: 'documents'
});
Document.belongsTo(Passenger, {
  foreignKey: "relatedEntityId",
  constraints: false,
  as: 'passenger' 
});

module.exports = Passenger;
