// models/AgencyStatusHistory.js
const { DataTypes } = require('sequelize');
const db = require('../config/bd');
const User = require('./userModel');
const Agency = require('./agenceModel');

const AgencyStatusHistory = db.define('AgencyStatusHistory', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  agencyId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: Agency,
      key: 'id'
    }
  },
  oldStatus: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  newStatus: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  reason: { 
    type: DataTypes.TEXT,
    allowNull: true 
  },
  changedBy: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  changedAt: { 
    type: DataTypes.DATE, 
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'agency_status_history',
  timestamps: false
});

// Associations
AgencyStatusHistory.belongsTo(Agency, { 
  foreignKey: 'agencyId', 
  as: 'agency' 
});

AgencyStatusHistory.belongsTo(User, { 
  foreignKey: 'changedBy', 
  as: 'changedByUser' 
});

Agency.hasMany(AgencyStatusHistory, { 
  foreignKey: 'agencyId', 
  as: 'statusHistory' 
});

User.hasMany(AgencyStatusHistory, { 
  foreignKey: 'changedBy', 
  as: 'statusChanges' 
});

module.exports = AgencyStatusHistory;
