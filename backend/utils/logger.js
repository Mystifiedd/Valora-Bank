const pino = require('pino');
const pinoHttp = require('pino-http');
const { randomUUID } = require('crypto');
const config = require('../config');

const logger = pino({
  level: config.log.level,
  base: null,
  redact: ['req.headers.authorization', 'req.headers.cookie']
});

const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => req.id || randomUUID(),
  customProps: (req) => ({ requestId: req.id })
});

module.exports = {
  logger,
  httpLogger
};
