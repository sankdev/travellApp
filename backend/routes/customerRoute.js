const express = require("express");
const router = express.Router();
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,getAllCustomersWithoutRestriction,getCustomerInvoices
} = require("../controllers/customerCtrl.js");

const { authenticate } = require("../middleware/authMiddleware.js");
//const {upload}=require('../middleware/uploadMiddleware.js')

router.get("/customers/all", authenticate, getAllCustomers);
router.get("/customers/profile", authenticate, getAllCustomers);
router.get('/customers/without', authenticate, getAllCustomersWithoutRestriction);
router.get('/customers/invoices', authenticate, getCustomerInvoices);

router.get("/customers/profile/:id", authenticate, getCustomerById);
router.post("/customers", authenticate,   createCustomer);
router.put("/customers/profile", authenticate, updateCustomer); // Updated route
router.delete("/:id", authenticate, deleteCustomer);

module.exports = router;
