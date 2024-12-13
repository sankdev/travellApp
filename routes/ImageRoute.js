const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { uploadImage, getImagesForEntity } = require("../controllers/imageCtrl");

const router = express.Router();

// Route pour uploader une image
router.post("/", authenticate, uploadImage);

// Route pour récupérer les images d'une entité spécifique
router.get("/:imageable_type/:imageable_id", authenticate, getImagesForEntity);

module.exports = router;
