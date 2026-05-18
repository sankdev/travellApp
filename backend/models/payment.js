const { DataTypes, Sequelize } = require("sequelize");
const db = require("../config/bd");
const PaymentMode=require("./paymentMode.js")
const Payment = db.define("Payment", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  modePaymentId: { type: DataTypes.INTEGER, allowNull: false },
  invoiceId: { type: DataTypes.INTEGER, allowNull: false },

  reference: { type: DataTypes.STRING, allowNull: false, unique: true },
  paymentDate: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.NOW }, // 🟢 Date auto
  amount: { type: DataTypes.FLOAT, allowNull: false },
  description: { type: DataTypes.TEXT },
  status: { 
    type: DataTypes.ENUM("completed", "pending", "failed"), 
    defaultValue: "pending" 
  },
  createdBy: { type: DataTypes.INTEGER },
  updatedBy: { type: DataTypes.INTEGER },
}, {
  tableName: "payments",
  timestamps: true, 
});

// Générer une référence unique avant la création
Payment.beforeCreate((payment) => {
  if (!payment.reference) {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    payment.reference = `PAY-${Date.now()}-${randomId}`;
  }

  if (!payment.paymentDate) {
    payment.paymentDate = new Date(); // Générer automatiquement la date de paiement
  }
});


module.exports = Payment;
