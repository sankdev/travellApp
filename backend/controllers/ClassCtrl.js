const Class = require("../models/classModel");
const Vol=require('../models/volModel')
// Créer une nouvelle classe
const createClass = async (req, res) => {
  try {
    const { name, status ,priceMultiplier,volId} = req.body;
 console.log('req.body',req.body)
    // Utilisation de l'utilisateur authentifié (req.user)
    const createdBy = req.user ? req.user.id : null;

    const newClass = await Class.create({
      name:req.body.name,
      status,
      priceMultiplier:req.body.priceMultiplier,volId:req.body.volId,
      createdBy:req.user.id,
    });

    return res.status(201).json(newClass);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Récupérer toutes les classes
const getClasses = async (req, res) => {
  try {
    const classes = await Class.findAll({include:{model:Vol,as:'Vol'}});
    return res.status(200).json(classes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Récupérer une classe par ID
const getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const classData = await Class.findByPk(id);

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    return res.status(200).json(classData);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Mettre à jour une classe
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    // Utilisation de l'utilisateur authentifié (req.user)
    const updatedBy = req.user ? req.user.id : null;

    const classData = await Class.findByPk(id);

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    await classData.update({
      name,
      status,
      updatedBy,
    });

    return res.status(200).json(classData);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Supprimer une classe
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const classData = await Class.findByPk(id);
    console.log('deleteClass',classData)
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    await classData.destroy();
    return res.status(204).send(); // Pas de contenu à renvoyer
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
};
