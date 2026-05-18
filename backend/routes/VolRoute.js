// routes/volRoutes.js
const express = require("express");
const volController = require("../controllers/volCtrl");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/post", authMiddleware.authenticate, volController.create);
router.get("/", volController.getAll);
router.get("/all",authMiddleware.authenticate, volController.getAllByAgency);

router.get("/:id", volController.getOne);
router.put("/:id", authMiddleware.authenticate, volController.update);
router.delete("/:id", authMiddleware.authenticate, volController.delete);
// router.get('/search', authenticate, volController.search);
router.get('/:id/seats', authMiddleware.authenticate, volController.getAvailableSeats);
// router.get('/:id/details/:agencyId', authMiddleware, volController.getFlightDetails);

module.exports = router;