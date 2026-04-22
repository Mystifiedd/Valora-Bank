const mysql = require('mysql2/promise');
const config = require('./index');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_SIZE || 10),
  queueLimit: 0,
  connectTimeout: 10_000,
  idleTimeout: 60_000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 30_000
});

pool.on('connection', (connection) => {
  connection.query(
    `SET SESSION TRANSACTION ISOLATION LEVEL ${config.db.txIsolation}`
  );
});

module.exports = pool;
