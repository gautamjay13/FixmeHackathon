const { ApiError } = require('../utils/apiResponse');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    const errorDetails = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    next(new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', errorDetails));
  }
};

module.exports = validate;
