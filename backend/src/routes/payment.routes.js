const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/create-order', restrictTo('user'), paymentController.createOrder);
router.post('/verify', restrictTo('user'), paymentController.verifyPayment);
router.get('/history', restrictTo('user'), paymentController.getPaymentHistory);
router.post('/refund/:bookingId', restrictTo('admin'), paymentController.refundPayment);

module.exports = router;
