const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/my-invoices', restrictTo('user'), invoiceController.getMyInvoices);
router.get('/booking/:bookingId', invoiceController.getInvoiceByBooking);
router.get('/booking/:bookingId/pdf', invoiceController.generatePDF);

module.exports = router;
