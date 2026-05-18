const express = require('express');
const router = express.Router();
const { searchFlightsWithAgencies, getFlightDetails } = require('../services/flight.service');
const { authenticate } = require('../middleware/authMiddleware');

// Route pour rechercher des vols avec des agences
router.post('/search',  async (req, res) => {
  try {
    const searchParams = req.body;
    const result = await searchFlightsWithAgencies(searchParams);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour obtenir les détails d'un vol
router.get('/:volId/:agencyId',  async (req, res) => {
  try {
    const { volId, agencyId } = req.params;  
    const result = await getFlightDetails(volId, agencyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
