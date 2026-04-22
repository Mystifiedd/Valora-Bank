const { logger } = require('../utils/logger');
const config = require('../config');

const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || err.status || 500;
  const errorCode = err.errorCode || err.code || 'internal_error';
  const details = err.details || undefined;
  const isServerError = statusCode >= 500;

  // Only expose actual message for client errors; hide internal details in prod
  const message =
    isServerError && config.isProd
      ? 'Internal Server Error'
      : err.message || 'Internal Server Error';

  logger.error(
    {
      err,
      requestId: req.id,
      statusCode
    },
    'Request failed'
  );

  res.status(statusCode).json({
    error: {
      message,
      code: errorCode,
      ...(config.isProd ? {} : { details })
    },
    requestId: req.id
  });
};

module.exports = errorHandler;
