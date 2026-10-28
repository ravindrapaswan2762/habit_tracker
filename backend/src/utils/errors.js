function createError(code, message, details = {}) {
  const err = new Error(message);
  err.code = code;
  err.details = details;
  return err;
}

function errorHandler(err, req, res, next) {
  const statusMap = {
    VALIDATION_ERROR: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409
  };

  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const status = statusMap[code] || err.status || 500;

  return res.status(status).json({
    error: {
      code,
      message: err.message || 'An unexpected error occurred',
      details: err.details || {}
    }
  });
}

module.exports = {
  createError,
  errorHandler
};

