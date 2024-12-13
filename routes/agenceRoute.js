const express = require("express");
const router = express.Router();
const agencyController = require("../controllers/agenceCtrl");

router.get("/agencies", agencyController.getAllAgencies);
router.post("/agencies", agencyController.createAgency);

module.exports = router;
