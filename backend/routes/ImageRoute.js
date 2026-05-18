const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const imageController = require("../controllers/imageCtrl");
const {upload} = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/', imageController.createImage);

// Route pour uploader des images associées à une agence
router.post('/agency', authenticate, upload.array('images', 10), imageController.createImageForAgency);

// Route pour uploader des images associées à une entité
router.post('/entity', authenticate, upload.array('images', 10), imageController.createImageForEntity);

// READ - Récupérer une image par ID
router.get('/:id', imageController.getImageById);

// READ - Récupérer les images par entité (campaign, company, agency, destination)
router.get('/:entityType/:entityId', imageController.getImagesByEntity);

// UPDATE - Mettre à jour une image
router.put('/:id', imageController.updateImage);

// Route pour mettre à jour des images par entité
router.put('/images/:entityType/:entityId', authenticate, upload.array('images', 10), imageController.updateImagesByEntity);

// DELETE - Supprimer une image
router.delete('/:id', imageController.deleteImage);

module.exports = router;
