const express = require('express');
const router = express.Router();
const {
    createAgency,
    getAgencies,
    getAgency,
    updateAgency,getStatusHistory,
    deleteAgency,getUserAgencies,getAgenciesProfile,
    searchAgencies,getAgencyStats,updateAgencyStatus, updateAgencyStatusWithReason,bulkUpdateAgencyStatus}
 = require('../controllers/agencyController');
const { upload} = require('../middleware/uploadMiddleware');
const {authenticate,checkPermission,checkAgencyAccess,restrictTo} = require("../middleware/authMiddleware");
//const agencyController = require('../controllers/agencyController');
// console.log(agencyController);
//console.log("getUserAgencies:", getUserAgencies);
 

// Routes publiques 
// router.get('/userAgency', authenticate, checkPermission('view_agencies'), getUserAgencies);
// Route publique pour récupérer les agences d'un utilisateur spécifique
router.get('/userAgency/:userId', authenticate, checkAgencyAccess, getUserAgencies);


router.get('/',  getAgencies);
router.get('/profile', authenticate, getAgenciesProfile);
router.get('/:id',  getAgency);
 router.get('/stats', getAgencyStats);
router.delete('/:id', authenticate, deleteAgency);
router.get('/search/:query',searchAgencies)
// Routes protégées (nécessitent une authentification)
router.post('/', authenticate, 
    upload.fields([ 
        { name: 'logo', maxCount: 1 },
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 }, 
        { name: 'image3', maxCount: 1 }
    ]),
    (req, res) => {
        createAgency(req, res).catch(err => {
            console.error(err);
            res.status(400).json({ error: err.message });
        });
    }
);

router.put('/:id', authenticate,
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
        { name: 'image3', maxCount: 1 }
    ]),
    (req, res) => { 
        updateAgency(req, res).catch(err => {
            console.error(err);
            res.status(400).json({ error: err.message });
        });
    }
);
router.put(
  '/agencies/:agencyId/status', 
  authenticate, 
  updateAgencyStatus
);

// Route pour mettre à jour le statut avec raison
router.put(
  '/agencies/:agencyId/status-with-reason', 
   authenticate, 
  updateAgencyStatusWithReason
);
// Route pour la mise à jour en lot des statuts
router.post(
  '/agencies/bulk-status-update',
  authenticate,
  bulkUpdateAgencyStatus
);

// Route pour récupérer l'historique des statuts d'une agence
router.get(
  '/agencies/:agencyId/status-history',
  authenticate,
  getStatusHistory
);
// Export du router
module.exports = router;
