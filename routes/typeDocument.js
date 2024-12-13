const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const  createTypeDocument  = require("../controllers/typeDocumentCtrl");

const router = express.Router();

router.post("/", authenticate, createTypeDocument);

module.exports = router;
