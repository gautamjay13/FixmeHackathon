const rateLimit = require('express-rate-limit');
const { ApiError } = require('../utils/apiResponse');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 15, // Limit each IP to 15 requests per `window`
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many requests from this IP, please try again after 15 minutes', 'RATE_LIMIT_EXCEEDED'));
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many requests from this IP, please try again later', 'RATE_LIMIT_EXCEEDED'));
  }
});

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10, // Limit each IP to 10 AI requests per `window`
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, 'AI request limit reached, please try again after 1 hour', 'RATE_LIMIT_EXCEEDED'));
  }
});

module.exports = { authLimiter, apiLimiter, aiLimiter };
