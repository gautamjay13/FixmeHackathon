const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const validate = require('../middleware/validate.middleware');
const { createReviewSchema, replyReviewSchema } = require('../validators/review.validator');
const { protect, restrictTo } = require('../middleware/auth.middleware');

router.get('/worker/:workerId', reviewController.getWorkerReviews);
router.get('/booking/:bookingId', reviewController.getBookingReview);

router.use(protect);

router.post('/', restrictTo('user'), validate(createReviewSchema), reviewController.createReview);
router.post('/:id/reply', restrictTo('worker'), validate(replyReviewSchema), reviewController.replyToReview);
router.delete('/:id', restrictTo('user', 'admin'), reviewController.deleteReview);

module.exports = router;
