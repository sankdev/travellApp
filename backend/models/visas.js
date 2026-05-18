const { DataTypes,Sequelize } = require("sequelize");
const sequelize = require("../config/bd");
const dataTypes = require("sequelize/lib/data-types");
 
const Document=require('./Document')
const Visa = sequelize.define("Visa", {
  id: {
    type: Sequelize.INTEGER,primaryKey:true,autoIncrement:true,
    allowNull: false,
  },
  agencyId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  customerId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  typeVisa: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  startAt: { type: DataTypes.DATE, allowNull: false },
  endAt: { type: DataTypes.DATE, allowNull: false },
  typeDocument: DataTypes.STRING,
  numDocument: DataTypes.STRING,
  document: DataTypes.STRING, // Path to the uploaded document file
  status: dataTypes.STRING,
  createdBy: dataTypes.INTEGER,
  updatedBy: dataTypes.INTEGER,
}, {
  timestamps: true,
});

Visa.hasMany(Document, {
  foreignKey: "relatedEntityId",
  constraints: false,
  scope: { relatedEntity: "Visa" },
});
Document.belongsTo(Visa, {
  foreignKey: "relatedEntityId",
  constraints: false,
});


module.exports = Visa;
