const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const authMiddleware = require('../middleware/authMiddleware');
const {getAgencyAccess}=require('../middleware/authMiddleware')
// Protection de toutes les routes
//router.use(authMiddleware.protect); 

// Routes publiques pour les clients authentifiés
router.get('/my-invoices', authMiddleware.authenticate,invoiceController.getInvoices);
router.get('/download/:id', authMiddleware.authenticate,invoiceController.downloadInvoice);
router.get('/:id', invoiceController.getInvoice);
router.get('/userAgency/:userId', authMiddleware.authenticate,authMiddleware.checkAgencyAccess,invoiceController.getInvoicesForAgency)
router.get('/userCustomer/:userId', authMiddleware.authenticate,invoiceController.getInvoicesForCustomer)

// Routes protégées pour les administrateurs
//router.use(authMiddleware.restrictTo('customer', 'agency'));
router.post('/', invoiceController.createInvoice);
router.patch('/:id', invoiceController.updateInvoice);
router.delete('/:id', invoiceController.deleteInvoice);

module.exports = router;
