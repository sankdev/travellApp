const { DataTypes, Sequelize } = require("sequelize");
const bd = require("../config/bd");
const User = require("./userModel");
const Document = require('./Document');

const Customer = bd.define("Customer", {
  userId: { type: DataTypes.INTEGER },
  firstName: { type: DataTypes.STRING },
  lastName: { type: DataTypes.STRING },
  gender: { type: DataTypes.STRING },
  birthDate: { type: DataTypes.DATE },
  birthPlace: { type: DataTypes.STRING },
  nationality: { type: DataTypes.STRING },
  profession: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  address: { type: DataTypes.STRING }, // Ajout du champ address
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
//  typeDocument: { type: DataTypes.STRING },
  //numDocument: { type: DataTypes.STRING },
 // documents: { type: DataTypes.JSON }, // Change this line to store multiple documents
  createdBy: { type: DataTypes.INTEGER },
  updatedBy: DataTypes.INTEGER,
}, {
  timestamps: true,
});

Customer.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Customer, { foreignKey: "userId", as: "customer" });
Customer.hasMany(Document, {
  foreignKey: "relatedEntityId",
  constraints: false,
  scope: { relatedEntity: "Customer" }, // Filtre pour les documents liés aux customers
});
Document.belongsTo(Customer, {
  foreignKey: "relatedEntityId",
  constraints: false,
});

module.exports = Customer;
