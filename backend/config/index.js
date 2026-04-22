const allowedIsolations = new Set([
  'READ UNCOMMITTED',
  'READ COMMITTED',
  'REPEATABLE READ',
  'SERIALIZABLE'
]);

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const splitList = (value) =>
  (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const env = process.env;
const nodeEnv = env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

const rawIsolation = (env.DB_TX_ISOLATION || 'READ COMMITTED').toUpperCase();
const txIsolation = allowedIsolations.has(rawIsolation)
  ? rawIsolation
  : 'READ COMMITTED';

const corsOrigins = splitList(env.CORS_ORIGINS || env.CORS_ORIGIN);

module.exports = {
  env: nodeEnv,
  isProd,
  port: toNumber(env.PORT, 3000),
  trustProxy: env.TRUST_PROXY ? toNumber(env.TRUST_PROXY, 1) : isProd ? 1 : 0,
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN || '1h'
  },
  cors: {
    origins:
      corsOrigins.length > 0
        ? corsOrigins
        : isProd
        ? []
        : ['http://localhost:5173'],
    credentials: env.CORS_CREDENTIALS === 'true'
  },
  rateLimit: {
    windowMs: toNumber(env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: toNumber(env.RATE_LIMIT_MAX, 200),
    authMax: toNumber(env.RATE_LIMIT_AUTH_MAX, 200)
  },
  db: {
    txIsolation
  },
  log: {
    level: env.LOG_LEVEL || (isProd ? 'info' : 'debug')
  }
};
