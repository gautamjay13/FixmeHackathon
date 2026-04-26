class ApiResponse {
  constructor(statusCode, data, message = 'Success', meta = null) {
    this.success = statusCode < 400;
    this.message = message;
    
    if (data) this.data = data;
    if (meta) this.meta = meta;
  }
}

class ApiError extends Error {
  constructor(statusCode, message = 'Something went wrong', code = 'INTERNAL_ERROR', details = []) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.code = code;
    this.details = details;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

const sendResponse = (res, statusCode, message, data, meta = null) => {
  const response = new ApiResponse(statusCode, data, message, meta);
  return res.status(statusCode).json(response);
};

module.exports = { ApiResponse, ApiError, sendResponse };
