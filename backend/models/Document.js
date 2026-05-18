const { DataTypes } = require("sequelize");
const db = require("../config/bd");

const Document = db.define(
  "Document",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    relatedEntity: {
      type: DataTypes.STRING, // e.g., "Customer", "Passenger", "Visa"
      allowNull: false,
    },
    relatedEntityId: {
      type: DataTypes.INTEGER, // ID de l'entité associée
      allowNull: false,
    },
    typeDocument: {
      type: DataTypes.STRING, // e.g., "passport", "identity card"
      allowNull: true,
    },
    fileType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    documentNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    documentPath: {
      type: DataTypes.STRING, // Chemin vers le fichier document
      allowNull: true,
    },
    issueDate: {
      type: DataTypes.DATE, // Date de délivrance du document
      allowNull: true,
    },
    expirationDate: {
      type: DataTypes.DATE, // Date d'expiration du document
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "active", // e.g., "pending", "verified", "rejected"
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "documents",
  }
);

module.exports = Document;
