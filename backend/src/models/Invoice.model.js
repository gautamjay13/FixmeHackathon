const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true }, // INV-2024-XXXXX
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  subtotal: Number,
  taxRate: { type: Number, default: 18 },
  taxAmount: Number,
  discount: { type: Number, default: 0 },
  grandTotal: Number,
  currency: { type: String, default: 'INR' },
  pdfUrl: String,
  pdfPublicId: String,
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
  issuedAt: { type: Date, default: Date.now },
  dueDate: Date
}, { timestamps: true });

// Pre-save hook: generate invoiceNumber
invoiceSchema.pre('save', function(next) {
  if (this.isNew && !this.invoiceNumber) {
    const year = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    this.invoiceNumber = `INV-${year}-${random}`;
  }
  next();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
