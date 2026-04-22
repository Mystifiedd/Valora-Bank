const jwt = require('jsonwebtoken');
const config = require('../config');

const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret);
    req.user = {
      id: payload.sub,
      role: payload.role,
      branch_id: payload.branch_id
    };
    return next();
  } catch (err) {
    const error = new Error('Invalid or expired token');
    error.statusCode = 401;
    error.errorCode = 'invalid_token';
    return next(error);
  }
};

module.exports = optionalAuthMiddleware;
