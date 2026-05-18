const { DataTypes } = require("sequelize");
const db = require("../config/bd");
const Vol = require("./volModel");
const Agency = require("./agenceModel");
const Image = require("./image");

const Campaign = db.define("Campaign", {
  agencyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: DataTypes.STRING,
  description: DataTypes.STRING,
  condition: DataTypes.STRING,
  startAt: DataTypes.DATE,
  endAt: DataTypes.DATE,
  price: DataTypes.FLOAT,
  volId:{type: DataTypes.INTEGER,
allowNull:true},
  status: DataTypes.STRING,
  createdBy: DataTypes.INTEGER,
  updatedBy: DataTypes.INTEGER,
}, {
  tableName: "Campaigns", // Ensure the table name is correct
  timestamps: true,
});

Campaign.belongsTo(Vol, {
  foreignKey: "volId",
  as: "vol",
});

// Campaign.belongsTo(Agency, {
//   foreignKey: "agencyId",
//   as: "associatedAgency",
// });



module.exports = Campaign;
