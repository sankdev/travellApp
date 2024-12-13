const { Sequelize } = require("sequelize");
const bd = require("../config/bd");
const User = require("./userModel");
const Customer = bd.define("Customer", {
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  gender: Sequelize.STRING,
  birthDate: Sequelize.DATE,
  birthPlace: Sequelize.STRING,
  nationality: Sequelize.STRING,
  profession: Sequelize.STRING,
  status: Sequelize.STRING,
  typeDocument: Sequelize.STRING,
  numDocument: Sequelize.STRING,
  document: Sequelize.STRING,
  createdBy: Sequelize.INTEGER,
  updatedBy: Sequelize.INTEGER,
}, {
  timestamps: true,
});
Customer.belongsTo(User, { foreignKey: "userId", as: "User" });
User.hasMany(Customer, { foreignKey: "userId", as: "customer" });
module.exports = Customer;
