const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');

// Search flights with filters
router.get('/search', flightController.searchFlights);

// Search places (airports/cities)
router.get('/places', flightController.searchPlaces);

// Get flight details
router.get('/:id', flightController.getFlightDetails);
//router.get('/class/:classId/flight/:flightId', flightController.getFlightDetails);
module.exports = router;
