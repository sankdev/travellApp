const express = require('express');
const router = express.Router();
const reservationHistoryController = require('../controllers/reservationHistoryCtrl');
//const authMiddleware = require('../middlewares/authMiddleware');
//const authMiddleware = require('../middleware/authMiddleware');
// Routes protégées par authentification
//router.use(authMiddleware.protect);

// Routes pour l'historique des réservations
router.get('/reservations/:reservationId/history', reservationHistoryController.getReservationHistory);
router.get('/history/:id', reservationHistoryController.getHistoryEntry);
router.get('/user/history', reservationHistoryController.getUserHistory);

// Routes admin seulement
//router.use(authMiddleware.restrictTo('admin'));
router.delete('/history/:id', reservationHistoryController.deleteHistoryEntry);

module.exports = router;
