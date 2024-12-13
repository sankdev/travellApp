const { DataTypes } = require("sequelize");
const Image=require('./image')
const db = require("../config/bd");

const Company = db.define("Company", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image1: DataTypes.STRING,
  image2: DataTypes.STRING,
  image3: DataTypes.STRING,
  status: DataTypes.STRING,
  createdBy: DataTypes.INTEGER,
  updatedBy: DataTypes.INTEGER,
}, {
  timestamps: true,
});
Company.hasMany(Image, {
    foreignKey: "imageable_id",
    constraints: false,
    scope: {
      imageable_type: "Company",
    },
  });
  
  Image.belongsTo(Company, {
    foreignKey: "imageable_id",
    constraints: false,
  });
  
module.exports = Company;
