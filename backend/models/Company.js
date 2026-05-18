const { DataTypes } = require("sequelize");
const db = require("../config/bd");
const Image = require("./image");

const Company = db.define("Company", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  createdBy: { type: DataTypes.INTEGER },
  updatedBy: { type: DataTypes.INTEGER },
}, {
  timestamps: true,
});

// Company.hasMany(Image, {
//   foreignKey: "companyId",
//   as: "companyImages",
// });

// Image.belongsTo(Company, {
//   foreignKey: "companyId",
//   as: "company",
// });

module.exports = Company;
