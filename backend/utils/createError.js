/**
 * Create an Error with a statusCode property for the error handler.
 * @param {number} statusCode - HTTP status code (e.g. 400, 404, 409)
 * @param {string} message    - Human-readable error message
 * @param {string} [errorCode] - Machine-readable error code (e.g. 'validation_error')
 * @returns {Error}
 */
const createError = (statusCode, message, errorCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (errorCode) {
    error.errorCode = errorCode;
  }
  return error;
};

module.exports = createError;
