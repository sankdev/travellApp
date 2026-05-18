const { DataTypes, Sequelize } = require("sequelize");
const db = require("../config/bd");
const Payment=require("./payment")
const PaymentMode = db.define("PaymentMode", {
  id: {
    type: DataTypes.INTEGER, 
    autoIncrement: true, // Génère automatiquement un ID unique
    primaryKey: true,    // Définit cette colonne comme clé primaire
  },
 agencyId: {  // ✅ Lier à l'agence
    type: DataTypes.INTEGER,
    allowNull: true,},
  name: { type: DataTypes.STRING, allowNull: true },
  type: {  // ✅ Type de paiement
    type: DataTypes.ENUM('mobile_money', 'bank', 'cash', 'cheque'),
    allowNull: true
  },
  organization: {  // ✅ Organisation (Orange Money, BNDA, etc.)
    type: DataTypes.STRING,
    allowNull: true
  },
  accountNumber: {  // ✅ Numéro (téléphone, compte, chèque)
    type: DataTypes.STRING,
    allowNull: true
  },
  accountName: {  // ✅ Nom du titulaire (optionnel)
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {  // ✅ Description supplémentaire
    type: DataTypes.TEXT,
    allowNull: true
  },
  isDefault: {  // ✅ Moyen de paiement par défaut
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  status: { type: DataTypes.ENUM("active", "inactive"), defaultValue: "active" },
}, {
  tableName: "payment_modes",
  timestamps: true,
});

module.exports = PaymentMode;

