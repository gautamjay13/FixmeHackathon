const Razorpay = require('razorpay');

let razorpayInstance = null;

try {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_your_key',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_secret',
  });
} catch (error) {
  console.warn('Razorpay configuration error:', error.message);
}

module.exports = razorpayInstance;
