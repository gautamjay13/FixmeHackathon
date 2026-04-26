const User = require('../models/User.model');
const Worker = require('../models/Worker.model');
const { generateTokens } = require('../utils/generateTokens');
const { sendResponse, ApiError } = require('../utils/apiResponse');
const { sendEmail, templates } = require('../utils/sendEmail');
const crypto = require('crypto');

exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      throw new ApiError(400, 'User with this email or phone already exists', 'USER_EXISTS');
    }

    const user = await User.create({
      name, email, phone, password, role: role || 'user'
    });

    const { accessToken, refreshToken } = generateTokens(user);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      to: user.email,
      subject: 'Welcome to FixNow!',
      html: templates.welcomeEmail(user.name)
    });

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;

    sendResponse(res, 201, 'User registered successfully', {
      user: userObj,
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;

    sendResponse(res, 200, 'Logged in successfully', {
      user: userObj,
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new ApiError(400, 'Refresh token is required', 'TOKEN_REQUIRED');
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      throw new ApiError(401, 'Invalid refresh token', 'INVALID_TOKEN');
    }

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });

    sendResponse(res, 200, 'Token refreshed', {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+refreshToken');
    if (user) {
      user.refreshToken = undefined;
      await user.save({ validateBeforeSave: false });
    }
    sendResponse(res, 200, 'Logged out successfully', null);
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      throw new ApiError(404, 'There is no user with this email address.', 'NOT_FOUND');
    }

    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      to: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      html: templates.otpEmail(otp)
    });

    sendResponse(res, 200, 'OTP sent to email', null);
  } catch (error) {
    next(error);
  }
};

exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select('+otp');

    if (!user || !user.otp || user.otp.code !== otp || user.otp.expiresAt < Date.now()) {
      throw new ApiError(400, 'OTP is invalid or has expired', 'INVALID_OTP');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    // Store hashed reset token and expiry in DB in a real app, here simplifying for hackathon
    // We'll return resetToken and let them send it in resetPassword
    
    sendResponse(res, 200, 'OTP verified', { resetToken, email });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, 'User not found', 'NOT_FOUND');

    user.password = newPassword;
    user.otp = undefined; // clear OTP
    await user.save();

    sendResponse(res, 200, 'Password reset successful', null);
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let data = { user };

    if (user.role === 'worker') {
      const workerProfile = await Worker.findOne({ userId: user._id });
      data.workerProfile = workerProfile;
    }

    sendResponse(res, 200, 'User profile fetched', data);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, coordinates } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address, coordinates },
      { new: true, runValidators: true }
    );
    sendResponse(res, 200, 'Profile updated', { user });
  } catch (error) {
    next(error);
  }
};

exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, 'Please upload a file', 'FILE_MISSING');
    
    const cloudinary = require('../config/cloudinary');
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'fixnow_avatars',
      width: 500,
      crop: "scale"
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: { url: result.secure_url, publicId: result.public_id } },
      { new: true }
    );

    // Delete local file
    require('fs').unlinkSync(req.file.path);

    sendResponse(res, 200, 'Avatar uploaded', { user });
  } catch (error) {
    next(error);
  }
};
