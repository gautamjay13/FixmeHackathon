const { verifyToken } = require('../utils/generateTokens');
const User = require('../models/User.model');
const { ApiError } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Not authorized, no token provided', 'UNAUTHORIZED');
    }

    const decoded = verifyToken(token, process.env.JWT_ACCESS_SECRET);
    
    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser || !currentUser.isActive) {
      throw new ApiError(401, 'The user belonging to this token does no longer exist or is inactive.', 'USER_NOT_FOUND');
    }

    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Token expired. Please refresh.', 'TOKEN_EXPIRED'));
    } else {
      next(new ApiError(401, 'Not authorized, invalid token', 'INVALID_TOKEN'));
    }
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action', 'FORBIDDEN'));
    }
    next();
  };
};

module.exports = { protect, restrictTo };
