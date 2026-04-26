const Review = require('../models/Review.model');
const Booking = require('../models/Booking.model');
const { sendResponse, ApiError } = require('../utils/apiResponse');

exports.createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment, tags, images } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new ApiError(404, 'Booking not found', 'NOT_FOUND');
    if (booking.status !== 'completed') throw new ApiError(400, 'Can only review completed bookings', 'INVALID_STATE');
    if (booking.userId.toString() !== req.user.id) throw new ApiError(403, 'Not authorized', 'FORBIDDEN');

    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) throw new ApiError(400, 'Review already exists for this booking', 'REVIEW_EXISTS');

    const review = await Review.create({
      bookingId,
      userId: req.user.id,
      workerId: booking.workerId,
      rating,
      comment,
      tags,
      images
    });

    sendResponse(res, 201, 'Review submitted successfully', { review });
  } catch (error) {
    next(error);
  }
};

exports.getWorkerReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = 'recent' } = req.query;
    const { workerId } = req.params;

    const skip = (page - 1) * limit;
    const sortConfig = sort === 'rating' ? { rating: -1 } : { createdAt: -1 };

    const reviews = await Review.find({ workerId, isVerified: true })
      .populate('userId', 'name avatar')
      .sort(sortConfig)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ workerId, isVerified: true });

    // Aggregate rating breakdown
    const breakdown = await Review.aggregate([
      { $match: { workerId: require('mongoose').Types.ObjectId(workerId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } }
    ]);

    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    breakdown.forEach(b => ratingBreakdown[b._id] = b.count);

    sendResponse(res, 200, 'Reviews fetched', {
      reviews,
      ratingBreakdown,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

exports.getBookingReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({ bookingId: req.params.bookingId });
    if (!review) throw new ApiError(404, 'Review not found', 'NOT_FOUND');
    sendResponse(res, 200, 'Review fetched', { review });
  } catch (error) {
    next(error);
  }
};

exports.replyToReview = async (req, res, next) => {
  try {
    const { reply } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) throw new ApiError(404, 'Review not found', 'NOT_FOUND');

    const Worker = require('../models/Worker.model');
    const worker = await Worker.findOne({ userId: req.user.id });
    if (!worker || worker._id.toString() !== review.workerId.toString()) {
      throw new ApiError(403, 'Not authorized to reply to this review', 'FORBIDDEN');
    }

    review.workerReply = { text: reply, repliedAt: new Date() };
    await review.save();

    sendResponse(res, 200, 'Reply added', { review });
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) throw new ApiError(404, 'Review not found', 'NOT_FOUND');

    if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new ApiError(403, 'Not authorized to delete this review', 'FORBIDDEN');
    }

    await Review.findByIdAndDelete(req.params.id);
    sendResponse(res, 200, 'Review deleted', null);
  } catch (error) {
    next(error);
  }
};
