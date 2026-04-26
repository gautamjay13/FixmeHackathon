const mongoose = require('mongoose');
const Worker = require('./Worker.model');

const reviewSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, maxLength: 1000 },
  images: [String],
  tags: [String], // ['punctual', 'professional', 'clean_work']
  workerReply: { text: String, repliedAt: Date },
  isVerified: { type: Boolean, default: true },
}, { timestamps: true });

// Post-save hook: recalculate Worker.stats.avgRating automatically
reviewSchema.post('save', async function() {
  const workerId = this.workerId;
  const result = await mongoose.model('Review').aggregate([
    { $match: { workerId: workerId } },
    { $group: { _id: '$workerId', avgRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
  ]);
  
  if (result.length > 0) {
    await Worker.findByIdAndUpdate(workerId, {
      'stats.avgRating': Math.round(result[0].avgRating * 10) / 10,
      'stats.totalReviews': result[0].totalReviews
    });
  }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
