const express = require("express");
const router = express.Router();
const PassengerController = require("../controllers/PassengerCtrl");
const {upload}=require('../middleware/uploadMiddleware');
const { authenticate } = require("../middleware/authMiddleware");
// Routes Passenger
router.post("/", authenticate, upload.array('document',10), PassengerController.create); // Créer un passager
router.get("/", PassengerController.getAll); // Récupérer tous les passagers
router.get("/:id", PassengerController.getById); // Récupérer un passager par ID
router.put("/:id", PassengerController.update); // Mettre à jour un passager
router.delete("/:id", PassengerController.delete); // Supprimer un passager
router.get("/reservation/:reservationId", PassengerController.getByReservation); // Récupérer les passagers d'une réservation

module.exports = router;
