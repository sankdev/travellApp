const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const TypeDocument = sequelize.define("TypeDocument", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: DataTypes.STRING,
  createdBy: DataTypes.INTEGER,
  updatedBy: DataTypes.INTEGER,
}, {
  timestamps: true,
});

module.exports = TypeDocument;
