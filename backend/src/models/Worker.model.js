const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  skills: [{ 
    type: String, 
    enum: ['plumber', 'electrician', 'carpenter', 'painter', 'cleaner', 'ac_repair', 'appliance_repair', 'pest_control'] 
  }],
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [longitude, latitude] — GeoJSON format
  },
  serviceRadius: { type: Number, default: 10 }, // km
  availability: { type: Boolean, default: false },
  isOnline: { type: Boolean, default: false },
  lastSeen: Date,
  experience: { type: Number, min: 0, max: 50 },
  bio: { type: String, maxLength: 500 },
  pricing: [{
    serviceType: String,
    visitCharge: Number,
    perHourRate: Number,
    currency: { type: String, default: 'INR' }
  }],
  documents: [{
    type: String, // aadhaar, pan, certificate
    url: String,
    isVerified: { type: Boolean, default: false }
  }],
  stats: {
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalJobs: { type: Number, default: 0 },
    completionRate: Number
  },
  isApproved: { type: Boolean, default: false },
}, { timestamps: true });

// 2dsphere index on location field (REQUIRED for geo queries)
workerSchema.index({ location: '2dsphere' });

const Worker = mongoose.model('Worker', workerSchema);
module.exports = Worker;
