// routes/volRoutes.js
const express = require("express");
const volController = require("../controllers/volCtrl");
const {authenticate} = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authenticate, volController.create);
router.get("/", volController.getAll);
router.get("/:id", volController.getOne);
router.put("/:id", authenticate, volController.update);
router.delete("/:id", authenticate, volController.delete);
router.get('/search', authenticate, volController.search);
router.get('/:id/seats', authenticate, volController.getAvailableSeats);
// router.get('/:id/details/:agencyId', authMiddleware, volController.getFlightDetails);

module.exports = router;