const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  amount: Number,
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['created', 'captured', 'failed', 'refunded'] },
  method: String, // upi, card, netbanking
  refundId: String,
  refundAmount: Number,
  metadata: Object,
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
