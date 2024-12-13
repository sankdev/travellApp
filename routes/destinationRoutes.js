const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const {
  createDestination,
  getAllDestinations,
  updateDestination,
  deleteDestination,
} = require("../controllers/destinationCtrl");

const router = express.Router();

router.post("/", authenticate, createDestination);
router.get("/", authenticate, getAllDestinations);
router.put("/:id", authenticate, updateDestination);
router.delete("/:id", authenticate, deleteDestination);

module.exports = router;
