const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true }, // auto-gen: FN-2024-XXXXX
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
  serviceType: { 
    type: String, 
    enum: ['plumber', 'electrician', 'carpenter', 'painter', 'cleaner', 'ac_repair', 'appliance_repair', 'pest_control'] 
  },
  problemTitle: String,
  problemDescription: String,
  images: [{ url: String, publicId: String }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'workerAssigned', 'inProgress', 'completed', 'cancelled', 'disputed'],
    default: 'pending'
  },
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
    updatedBy: mongoose.Schema.Types.ObjectId
  }],
  address: { fullAddress: String, street: String, city: String, pincode: String },
  coordinates: { lat: Number, lng: Number },
  scheduledAt: Date,
  startedAt: Date,
  completedAt: Date,
  estimatedCost: { min: Number, max: Number },
  finalCost: Number,
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  cancelReason: String,
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isEmergency: { type: Boolean, default: false },
  aiAnalysis: Object,
}, { timestamps: true });

// Pre-save hook: generate bookingId
bookingSchema.pre('save', function(next) {
  if (this.isNew && !this.bookingId) {
    const year = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    this.bookingId = `FN-${year}-${random}`;
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
