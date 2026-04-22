const roleMiddleware = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    const error = new Error('Authentication required');
    error.statusCode = 401;
    error.errorCode = 'auth_required';
    return next(error);
  }

  if (!allowedRoles.includes(req.user.role)) {
    const error = new Error('Insufficient permissions');
    error.statusCode = 403;
    error.errorCode = 'forbidden';
    return next(error);
  }

  return next();
};

module.exports = roleMiddleware;
