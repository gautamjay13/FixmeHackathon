const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const { sendResponse, ApiError } = require('../utils/apiResponse');
const { protect } = require('../middleware/auth.middleware');

// GET /api/v1/user/me — get current user + online status
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, 'User not found', 'NOT_FOUND');
    sendResponse(res, 200, 'User fetched', { user });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/user/status — toggle isOnline
router.patch('/status', protect, async (req, res, next) => {
  try {
    const { isOnline } = req.body;
    if (typeof isOnline !== 'boolean') {
      throw new ApiError(400, '`isOnline` must be a boolean', 'INVALID_INPUT');
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { isOnline },
      { new: true }
    );
    sendResponse(res, 200, `You are now ${isOnline ? 'online' : 'offline'}`, {
      isOnline: user.isOnline,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
