const { DataTypes } = require("sequelize");
const db = require("../config/bd");

const Image = db.define(
  "Image",
  {
    image_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageable_type: {
      type: DataTypes.STRING, // Nom du modèle (ex. "Company", "Campaign")
      allowNull: false,
    },
    imageable_id: {
      type: DataTypes.INTEGER, // ID du modèle associé
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "active",
    },
    createdBy: DataTypes.INTEGER,
    updatedBy: DataTypes.INTEGER,
  },
  {
    timestamps: true,
  }
);

module.exports = Image;
