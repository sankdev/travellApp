const express = require("express");
const router = express.Router();
const { authenticate, checkPermission } = require("../middleware/authMiddleware");
const { assignUserToAgency, revokeUserFromAgency,removeUserFromAgency, getUserAgencies, getAgencyUsers } = require("../controllers/UserAgency");
//checkPermission("manage_user_agencies"),
// Assigner un utilisateur à une agence
router.post("/assign",  authenticate, assignUserToAgency);

// Révoquer un utilisateur d’une agence 
//checkPermission("manage_user_agencies"),
router.post("/revoke",  authenticate, revokeUserFromAgency);

// Récupérer toutes les agences d'un utilisateur
//checkPermission("view_agencies"),
router.get("/user/:userId",   getUserAgencies);

// Récupérer tous les utilisateurs d'une agence
router.get("/agency/:agencyId", authenticate, checkPermission("view_agency_users"), getAgencyUsers);
router.delete('/user-agencies/:userId/:agencyId', removeUserFromAgency);

module.exports = router;
