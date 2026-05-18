const express = require("express");
const router = express.Router();
const agencyAssociationsController = require("../controllers/agencyAssociationCtrl");
const { authenticate ,checkPermission} = require("../middleware/authMiddleware");

// 🌍 DestinationAgency
// router.post("/destination-agencies", agencyAssociationsController.createDestinationAgency);
// router.get("/destination-agencies", agencyAssociationsController.getAllDestinationAgencies);
// router.put("/destination-agencies/:id", agencyAssociationsController.updateDestinationAgency);
// router.delete("/destination-agencies/:id", agencyAssociationsController.deleteDestinationAgency);

// ✈️ FlightAgency
router.post("/flight-agencies", agencyAssociationsController.createFlightAgency);
router.get("/flight-agencies", agencyAssociationsController.getAllFlightAgencies);
router.put("/flight-agencies/:id", agencyAssociationsController.updateFlightAgency);
router.delete("/flight-agencies/:id", agencyAssociationsController.deleteFlightAgency);
router.get("/flightUser-agencies", authenticate,agencyAssociationsController.getUserFlightAgencies);
router.get("/flight-agencies/:agencyId/flights", agencyAssociationsController.getFlightsByAgency);

// 🏛 ClassAgency
router.post("/class-agencies", agencyAssociationsController.createClassAgency);
router.get("/class-agencies", agencyAssociationsController.getAllClassAgencies);
router.put("/class-agencies/:id", agencyAssociationsController.updateClassAgency);
router.delete("/class-agencies/:id", agencyAssociationsController.deleteClassAgency);
router.get("/classUser-agencies",authenticate, agencyAssociationsController.getUserClassAgencies);
router.get('/agencies/:agencyId/classes', agencyAssociationsController.getClassesByAgencyId);

router.get('/by-flight', agencyAssociationsController.getClassAgenciesByFlight);
router.get('/by-flight-and-class', agencyAssociationsController.getClassAgencyByFlightAndClass);
router.get('/flight-agencie/:id', agencyAssociationsController.getClassAgencyById);


module.exports = router;
