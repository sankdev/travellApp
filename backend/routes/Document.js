const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const  documentController  = require("../controllers/documentCtrl");
const {uploads}=require('../middleware/uploadMiddleware')

const router = express.Router();
router.post("/", uploads.any(),authenticate,documentController.createDocument);
router.get("/documents/:relatedEntity/:relatedEntityId ", documentController.getDocuments);
router.get("/:id", documentController.getDocumentById);
router.put("/:id", documentController.updateDocument);
router.delete("/:id", documentController.deleteDocument);

module.exports = router;
