const { randomUUID } = require('crypto');

const requestId = (req, res, next) => {
  const incoming = req.headers['x-request-id'];
  req.id = incoming || randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
};

module.exports = requestId;
