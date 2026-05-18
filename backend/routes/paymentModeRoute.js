const express = require("express");
const router = express.Router();
const paymentModeController = require("../controllers/paymentMode");

router.post("/", paymentModeController.create);
router.get("/", paymentModeController.getAll);
router.get("/modes", paymentModeController.getPaymentModes);
router.post("/mode",paymentModeController.createPaymentMode)
router.get("/mode/get/:id",paymentModeController.getPaymentModesByAgency)
router.put("/mode/:id", paymentModeController.updatePaymentMode);
router.delete("/mode/:id", paymentModeController.deletePaymentMode);

module.exports = router;
