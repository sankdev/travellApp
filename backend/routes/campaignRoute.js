const express = require("express");
const { authenticate, checkPermission } = require("../middleware/authMiddleware");
const { createCampaign, getActiveCampaigns,getCampaigns,getCampaignsByUser, getCampaignById, updateCampaign, deleteCampaign } = require("../controllers/campaign");
const {upload }= require('../middleware/uploadMiddleware');


const router = express.Router();

router.post("/post", 
  authenticate, // Ensure user is authenticated
  
  upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 }
  ]),
  (req, res) => {
    createCampaign(req, res).catch(err => {
      console.error(err);
      res.status(400).json({ error: err.message });
    });
  }
);

router.get("/",  getCampaigns);
router.get("/user", authenticate,checkPermission('view_agencies',true), getCampaignsByUser);
router.get("/:id",  getCampaignById);
router.get("/all/active",  getActiveCampaigns );
router.put("/:id", 
  authenticate,
  upload.fields([
    { name: 'image1', maxCount: 1 }, 
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 }
  ]),
  (req, res) => {
    updateCampaign(req, res).catch(err => {
      console.error(err);
      res.status(400).json({ error: err.message });
    });
  }
);

router.delete("/:id", authenticate, deleteCampaign);




module.exports = router;
