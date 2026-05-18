const express = require("express");
const {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
} = require("../controllers/ClassCtrl");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// Routes CRUD
router.post("/post",authenticate, createClass); // Créer une nouvelle classe
router.get("/", getClasses); // Récupérer toutes les classes
router.get("/:id", getClassById); // Récupérer une classe par ID
router.put("/:id", updateClass); // Mettre à jour une classe par ID
router.delete("/:id", deleteClass); // Supprimer une classe par ID

module.exports = router;
