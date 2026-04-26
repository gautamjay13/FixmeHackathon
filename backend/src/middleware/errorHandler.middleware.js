const { ApiError } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.code = err.code || 'INTERNAL_ERROR';

  // Log to console for dev
  console.log(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ApiError(404, message, 'NOT_FOUND');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ApiError(400, message, 'DUPLICATE_ERROR');
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ApiError(400, message, 'VALIDATION_ERROR');
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message || 'Server Error',
    error: {
      code: error.code,
      details: err.details || []
    }
  });
};

module.exports = errorHandler;
