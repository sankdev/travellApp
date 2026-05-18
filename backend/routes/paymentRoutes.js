const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

// Protection de toutes les routes
//router.use(authMiddleware.protect);

// Routes accessibles aux clients
router.get('/payment-modes', paymentController.getPaymentModes);
router.post('/', authMiddleware.authenticate,authMiddleware.restrictTo('admin','agency'),paymentController.createPayment);
router.get('/my-payments', paymentController.getPayments);

// Routes protégées pour les administrateurs
router.get('/', authMiddleware.authenticate, paymentController.getPayments);
router.get('/:id', paymentController.getPayment);
router.get('/invoice/:id', paymentController.getPaymentsByInvoice);
router.put('/:id', paymentController.updatePayment);
router.put('/validate/:id', authMiddleware.authenticate, paymentController.validatePayment);
router.put("/payment/cancel/:id", paymentController.cancelPayment);
module.exports = router;
 

