const { DataTypes } = require('sequelize');
const db = require('../config/bd');
const Image = require('./image');
const User = require('./userModel');
//const { requireRole } = require('../middleware/authMiddleware');
const Campaign = require('./compaign');

const Agency = db.define('Agency', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.TEXT },
  logo: { type: DataTypes.STRING },
  location: { type: DataTypes.STRING },
  photo1: { type: DataTypes.STRING },
  photo2: { type: DataTypes.STRING },
 phone1:{type:DataTypes.STRING},
   phone2:{type:DataTypes.STRING},  
  rating: { type: DataTypes.FLOAT },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  address: { type: DataTypes.STRING },
  manager: { type: DataTypes.STRING },
  secretary: { type: DataTypes.STRING },
  createdBy: { type: DataTypes.INTEGER },
  updatedBy: { type: DataTypes.INTEGER },deletedAt: { type: DataTypes.INTEGER },
}, {
  timestamps: true,
});

Agency.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Agency, { foreignKey: 'userId', as: 'agencies' });

module.exports = Agency;
