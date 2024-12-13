const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { createCompany, getCompanies } = require("../controllers/companyCtrl");

const router = express.Router();

router.post("/", authenticate, createCompany);
router.get("/", authenticate, getCompanies);

module.exports = router;
