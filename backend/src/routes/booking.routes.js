const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const validate = require('../middleware/validate.middleware');
const { createBookingSchema, updateStatusSchema, completeBookingSchema } = require('../validators/booking.validator');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.use(protect);

router.post('/', restrictTo('user'), validate(createBookingSchema), bookingController.createBooking);
router.get('/', restrictTo('user'), bookingController.getUserBookings);
router.get('/active', restrictTo('user'), bookingController.getActiveBooking);
router.get('/:id', bookingController.getBookingById);

router.patch('/:id/status', restrictTo('worker', 'admin'), validate(updateStatusSchema), bookingController.updateStatus);
router.patch('/:id/cancel', restrictTo('user'), bookingController.cancelBooking);
router.post('/:id/images', restrictTo('user'), upload.array('images', 5), bookingController.uploadImages);
router.post('/:id/complete', restrictTo('worker'), validate(completeBookingSchema), bookingController.completeBooking);

module.exports = router;
