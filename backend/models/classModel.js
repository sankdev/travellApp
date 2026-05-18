const { DataTypes } = require("sequelize");
const db = require("../config/bd");
const Vol=require('./volModel')
const Class = db.define("Class", {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },volId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }, basePrice: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  priceMultiplier:{type:DataTypes.FLOAT},
//  volId:{type:DataTypes.INTEGER,allowNull:true},
  status: { 
    type: DataTypes.STRING, 
    defaultValue: "active" 
  },
  createdAt: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },
  createdBy: { 
    type: DataTypes.INTEGER, 
    allowNull: true 
  },
  updatedAt: { 
    type: DataTypes.DATE 
  },
  updatedBy: { 
    type: DataTypes.INTEGER, 
    allowNull: true 
  },
}, {
  timestamps: true,
  tableName: "classes", // Nom de la table dans la base de données
});
Class.belongsTo(Vol, { foreignKey: "volId", as: "Vol" }); // Une classe appartient à un vol
Vol.hasMany(Class, { foreignKey: "volId", as: "Classes" }); // Un vol peut avoir plusieurs classes
module.exports = Class;
