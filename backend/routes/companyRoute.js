const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { createCompany, getCompanies, getCompanyById, updateCompany, deleteCompany } = require("../controllers/companyCtrl");
const {upload }= require('../middleware/uploadMiddleware');

const router = express.Router();
 
router.post("/post", authenticate, 
    upload.fields([
        
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
        { name: 'image3', maxCount: 1 }
    ]),
    (req, res) => {
        createCompany(req, res).catch(err => {
            console.error(err);
            res.status(400).json({ error: err.message });
        });
    }
);

router.get("/",  getCompanies);
router.get("/:id",  getCompanyById); // Route for getting a specific company by ID

router.put("/:id", authenticate, 
    upload.fields([
        
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
        { name: 'image3', maxCount: 1 }
    ]),
    (req, res) => {
        updateCompany(req, res).catch(err => {
            console.error(err);
            res.status(400).json({ error: err.message });
        });
    }
);

router.delete("/:id", authenticate, deleteCompany); // Route for deleting a company

module.exports = router;
