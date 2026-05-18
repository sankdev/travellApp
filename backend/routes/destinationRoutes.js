const express = require('express');
const router = express.Router();
const destinationController = require('../controllers/destinationController');
const authMiddleware = require('../middleware/authMiddleware');
const {upload} = require('../middleware/uploadMiddleware');

// Routes publiques
router.get('/recherche', destinationController.getDestinationsRecherche);
router.get('/', destinationController.getDestinations);

router.get('/:id', destinationController.getDestination);
router.get('/:id/stats', destinationController.getDestinationStats);

// Routes protégées pour les administrateurs
router.post('/post', authMiddleware.authenticate, 
    upload.fields([
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
        { name: 'image3', maxCount: 1 }
    ]),
    (req, res) => {
        destinationController.createDestination(req, res).catch(err => {
            console.error(err);
            res.status(400).json({ error: err.message });
        });
    }
);

router.put('/:id', authMiddleware.authenticate,
    upload.fields([
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
        { name: 'image3', maxCount: 1 }
    ]),
    (req, res) => {
        destinationController.updateDestination(req, res).catch(err => {
            console.error(err);
            res.status(400).json({ error: err.message });
        });
    }
);

router.delete('/:id', authMiddleware.authenticate, destinationController.deleteDestination);

module.exports = router;
