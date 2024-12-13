const { DataTypes } = require("sequelize");
const db = require("../config/bd");

const Class = db.define("Class", {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
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

module.exports = Class;
