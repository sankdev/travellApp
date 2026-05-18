const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const {
  createVisa,
  getVisasByReservation,
  updateVisa,
  deleteVisa,
} = require("../controllers/visasCtrl");

const router = express.Router();

router.post("/", authenticate, createVisa);
router.get("/:reservationId", authenticate, getVisasByReservation);
router.put("/:id", authenticate, updateVisa);
router.delete("/:id", authenticate, deleteVisa);

module.exports = router;
