require('dotenv').config();
const app = require('./app');
const config = require('./config');
const pool = require('./config/db');
const { logger } = require('./utils/logger');

if (!config.jwt.secret) {
  throw new Error('JWT_SECRET is required');
}

const server = app.listen(config.port, () => {
  logger.info({ port: config.port }, 'Valora Bank API running');
});

// Graceful shutdown
const shutdown = async (signal) => {
  logger.info({ signal }, 'Shutdown signal received');
  server.close(async () => {
    try {
      await pool.end();
      logger.info('Database pool closed');
    } catch (err) {
      logger.error({ err }, 'Error closing database pool');
    }
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
