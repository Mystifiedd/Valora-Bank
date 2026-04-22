const pool = require('../config/db');

const recordAudit = async ({
  userId,
  action,
  tableName,
  recordId,
  ipAddress,
  connection
}) => {
  const executor = connection || pool;
  await executor.execute(
    'INSERT INTO audit_logs (user_id, action, table_name, record_id, ip_address, timestamp) VALUES (?, ?, ?, ?, ?, NOW())',
    [userId, action, tableName, recordId, ipAddress || 'unknown']
  );
};

module.exports = {
  recordAudit
};
