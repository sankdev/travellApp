const express = require("express");
const router = express.Router();
const pricingRuleController = require("../controllers/pricingRuleCtrl");
const { authenticate } = require("../middleware/authMiddleware");

router.post("/", authenticate,pricingRuleController.createPricingRule); // Ajouter une règle tarifaire
router.get("/", pricingRuleController.getAllPricingRules); 
router.get("/user", authenticate,pricingRuleController.getUserPricingRules); // Obtenir toutes les règles tarifaires
// Obtenir toutes les règles tarifaires
router.get("/:id", pricingRuleController.getPricingRuleById); // Obtenir une règle tarifaire spécifique
router.put("/:id", pricingRuleController.updatePricingRule); // Mettre à jour une règle tarifaire
router.delete("/:id", pricingRuleController.deletePricingRule); // Supprimer une règle tarifaire

module.exports = router;
