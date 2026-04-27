const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minLength: 2 },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, default: 'customer' },
  avatar: { url: String, publicId: String },
  address: { 
    street: String, 
    city: String, 
    state: String, 
    pincode: String, 
    fullAddress: String 
  },
  coordinates: { lat: Number, lng: Number },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isOnline: { type: Boolean, default: true },
  weeklyGoal: {
    jobTarget: { type: Number, default: 25 },
    earningsTarget: { type: Number, default: 15000 }
  },
  refreshToken: { type: String, select: false },
  otp: {
    code: { type: String, select: false },
    expiresAt: { type: Date, select: false }
  },
  lastLogin: Date,
}, { timestamps: true });

// Pre-save hook: hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method: comparePassword
userSchema.methods.comparePassword = async function(plainText) {
  return await bcrypt.compare(plainText, this.password);
};

// Method: generateOTP
userSchema.methods.generateOTP = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = {
    code,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  };
  return code;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
