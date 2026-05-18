const { DataTypes } = require("sequelize");
const User=require('./userModel')
const  Reservation =require('./booking.js')
const db = require("../config/bd");
  const Notification = db.define('Notification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('info', 'warning', 'success', 'error'),
      defaultValue: 'info'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    relatedEntity: {
      type: DataTypes.STRING
    },
    relatedEntityId: {
      type: DataTypes.INTEGER
    }
  });

  
module.exports=Notification
