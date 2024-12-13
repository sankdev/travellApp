const express = require("express");
const router = express.Router();
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerCtrl.js");

const { authenticate } = require("../middleware/authMiddleware.js");



router.get("/all", authenticate, getAllCustomers);
router.get("/:id", authenticate, getCustomerById);
router.post("/", authenticate, createCustomer);
router.put("/:id", authenticate, updateCustomer);
router.delete("/:id", authenticate, deleteCustomer);

module.exports = router;
