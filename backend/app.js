const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { httpLogger } = require('./utils/logger');
const requestId = require('./middlewares/requestId');
const sanitizeInput = require('./middlewares/sanitizeInput');
const authMiddleware = require('./middlewares/authMiddleware');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const transferRoutes = require('./routes/transferRoutes');
const loanRoutes = require('./routes/loanRoutes');
const kycRoutes = require('./routes/kycRoutes');
const supportRoutes = require('./routes/supportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const accountRequestRoutes = require('./routes/accountRequestRoutes');

const app = express();

app.set('trust proxy', config.trustProxy);

app.use(requestId);
app.use(httpLogger);
app.use(helmet());

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (config.cors.origins.length === 0) {
      const err = new Error('CORS origin denied');
      err.statusCode = 403;
      return callback(err);
    }
    if (config.cors.origins.includes(origin)) {
      return callback(null, true);
    }
    const err = new Error('CORS origin denied');
    err.statusCode = 403;
    return callback(err);
  },
  credentials: config.cors.credentials
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(sanitizeInput);

const rateLimitHandler = (message) => (req, res, next) => {
  const error = new Error(message);
  error.statusCode = 429;
  error.errorCode = 'rate_limited';
  next(error);
};

const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many requests')
});

const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many login attempts')
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter, authRoutes);

app.use('/api', authMiddleware);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/account-requests', accountRequestRoutes);

app.use(errorHandler);

module.exports = app;
