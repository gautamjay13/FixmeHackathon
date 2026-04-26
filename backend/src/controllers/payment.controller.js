const Payment = require('../models/Payment.model');
const Invoice = require('../models/Invoice.model');
const Booking = require('../models/Booking.model');
const razorpayInstance = require('../config/razorpay');
const crypto = require('crypto');
const { sendResponse, ApiError } = require('../utils/apiResponse');

exports.createOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    
    const invoice = await Invoice.findOne({ bookingId });
    if (!invoice) throw new ApiError(404, 'Invoice not found for this booking', 'NOT_FOUND');
    if (invoice.paymentStatus === 'paid') throw new ApiError(400, 'Invoice already paid', 'ALREADY_PAID');

    const amountInPaise = Math.round(invoice.grandTotal * 100);

    const options = {
      amount: amountInPaise,
      currency: invoice.currency || 'INR',
      receipt: invoice.invoiceNumber,
    };

    const order = await razorpayInstance.orders.create(options);

    await Payment.create({
      bookingId,
      userId: req.user.id,
      razorpayOrderId: order.id,
      amount: invoice.grandTotal,
      currency: order.currency,
      status: 'created'
    });

    sendResponse(res, 201, 'Order created', {
      orderId: order.id,
      amount: invoice.grandTotal,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } = req.body;

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      throw new ApiError(400, 'Invalid signature', 'PAYMENT_FAILED');
    }

    // Update Payment
    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      { razorpayPaymentId, razorpaySignature, status: 'captured' }
    );

    // Update Booking and Invoice
    await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'paid' });
    await Invoice.findOneAndUpdate({ bookingId }, { paymentStatus: 'paid' });

    sendResponse(res, 200, 'Payment verified successfully', null);
  } catch (error) {
    next(error);
  }
};

exports.getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.user.id }).sort({ createdAt: -1 });
    sendResponse(res, 200, 'Payment history fetched', payments);
  } catch (error) {
    next(error);
  }
};

exports.refundPayment = async (req, res, next) => {
  try {
    const { reason, amount } = req.body;
    const payment = await Payment.findOne({ bookingId: req.params.bookingId, status: 'captured' });
    
    if (!payment) throw new ApiError(404, 'Payment not found or not captured', 'NOT_FOUND');

    const refundOptions = {
      amount: amount ? Math.round(amount * 100) : Math.round(payment.amount * 100),
      notes: { reason }
    };

    const refund = await razorpayInstance.payments.refund(payment.razorpayPaymentId, refundOptions);

    payment.status = 'refunded';
    payment.refundId = refund.id;
    payment.refundAmount = amount || payment.amount;
    await payment.save();

    await Booking.findByIdAndUpdate(req.params.bookingId, { paymentStatus: 'refunded' });

    sendResponse(res, 200, 'Refund initiated', { refund });
  } catch (error) {
    next(error);
  }
};
