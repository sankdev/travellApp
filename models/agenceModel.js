const { Sequelize} = require("sequelize");
const Image=require('../models/image')
// const User=require('./userRoleModel')
const db= require("../config/bd");


const Agency = db.define("Agency", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: Sequelize.STRING, allowNull: false },
  userId: { type: Sequelize.INTEGER, allowNull: false },
  description: { type: Sequelize.TEXT },
  logo: { type: Sequelize.STRING },
  location: { type: Sequelize.STRING },
  rating: { type: Sequelize.FLOAT },
  status: { type: Sequelize.STRING },
  address: { type: Sequelize.STRING },
  phone1: { type: Sequelize.STRING },
  phone2: { type: Sequelize.STRING },
  phone3: { type: Sequelize.STRING },
  manager: { type: Sequelize.STRING },
  secretary: { type: Sequelize.STRING },
  image1: { type: Sequelize.STRING },
  image2: { type: Sequelize.STRING },
  image3: { type: Sequelize.STRING },
  createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  createdBy: { type: Sequelize.INTEGER },
  updatedAt: { type: Sequelize.DATE },
  updatedBy: { type: Sequelize.INTEGER },
});
// Agency.belongsTo(User, { foreignKey: 'userId' });
// User.hasMany(Agency, { foreignKey: 'userId' });
Agency.hasMany(Image, {
  foreignKey: "imageable_id",
  constraints: false,
  scope: {
    imageable_type: "Agency",
  },
});

Image.belongsTo(Agency, {
  foreignKey: "imageable_id",
  constraints: false,
});
module.exports = { Agency };
