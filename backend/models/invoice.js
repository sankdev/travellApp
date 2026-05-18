const { DataTypes, Sequelize} = require("sequelize");
const db = require("../config/bd");

const Invoice = db.define("Invoice", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true, // Génère automatiquement un ID unique
        primaryKey: true,    // Définit cette colonne comme clé primaire
      },
      reservationId:{type:DataTypes.INTEGER,allowNull:false},
      customerId:{type:DataTypes.INTEGER,allowNull:true},
      passengerId:{type:DataTypes.INTEGER,allowNull:true},
      agencyId:{type:DataTypes.INTEGER,allowNull:true},



  reference: { type: DataTypes.STRING, allowNull: false, unique: true },
  emissionAt: { type: DataTypes.DATE, allowNull: false },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  tva: { type: DataTypes.FLOAT, allowNull: true },
  totalWithTax: { type: DataTypes.FLOAT, allowNull: true },
  balance: { type: DataTypes.FLOAT, defaultValue: 0 },
  status: { type: DataTypes.ENUM("paid", "unpaid","partial"), defaultValue: "unpaid" }, createdBy: { type: DataTypes.INTEGER },
  updatedBy: { type: DataTypes.INTEGER },
}, {
  tableName: "invoices",
  timestamps: true,
});
Invoice.beforeCreate(async (invoice) => {
  const randomId = Math.floor(1000 + Math.random() * 9000);
  invoice.reference = `INV-${Date.now()}-${randomId}`;
//  invoice.balance = invoice.amount; // Fusion des deux hooks en un seul
});

module.exports = Invoice;
