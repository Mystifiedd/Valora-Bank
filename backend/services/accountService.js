const pool = require('../config/db');
const { recordAudit } = require('./auditService');
const createError = require('../utils/createError');
const { secureRandomDigits } = require('../utils/crypto');
const { normalisePagination, paginatedResponse } = require('../utils/pagination');

const generateAccountNumber = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const accountNumber = secureRandomDigits(12);

    const [rows] = await pool.execute(
      'SELECT id FROM accounts WHERE account_number = ? LIMIT 1',
      [accountNumber]
    );

    if (rows.length === 0) {
      return accountNumber;
    }
  }

  throw createError(500, 'Unable to generate account number');
};

const createAccount = async ({ userId, branchId, accountType, actor, ipAddress }) => {
  if (!actor || !['Admin', 'Employee'].includes(actor.role)) {
    throw createError(403, 'Only Admin or Employee can create accounts');
  }

  const [userRows] = await pool.execute(
    'SELECT id FROM users WHERE id = ? AND is_active = 1 LIMIT 1',
    [userId]
  );

  if (userRows.length === 0) {
    throw createError(404, 'User not found');
  }

  const [branchRows] = await pool.execute(
    'SELECT id FROM branches WHERE id = ? AND is_active = 1 LIMIT 1',
    [branchId]
  );

  if (branchRows.length === 0) {
    throw createError(404, 'Branch not found');
  }

  const accountNumber = await generateAccountNumber();

  const [result] = await pool.execute(
    'INSERT INTO accounts (account_number, user_id, branch_id, account_type, balance, status, created_at) VALUES (?, ?, ?, ?, 0.00, ?, NOW())',
    [accountNumber, userId, branchId, accountType, 'active']
  );

  await recordAudit({
    userId: actor.id,
    action: 'CREATE_ACCOUNT',
    tableName: 'accounts',
    recordId: result.insertId,
    ipAddress
  });

  return {
    id: result.insertId,
    account_number: accountNumber,
    user_id: userId,
    branch_id: branchId,
    account_type: accountType,
    balance: 0.0,
    status: 'active'
  };
};

const getAccounts = async ({
  userId,
  actor,
  status,
  accountType,
  page = 1,
  pageSize = 20,
  ipAddress
}) => {
  if (!actor) {
    throw createError(401, 'Authentication required');
  }

  // For customers, always resolve to their own id
  let resolvedUserId;
  if (actor.role === 'Customer') {
    if (userId && Number(userId) !== actor.id) {
      throw createError(403, 'Forbidden');
    }
    resolvedUserId = actor.id;
  } else {
    // Admin/Employee must specify a user_id, or see all accounts
    resolvedUserId = userId || null;
  }

  const filters = [];
  const params = [];

  if (resolvedUserId) {
    filters.push('user_id = ?');
    params.push(resolvedUserId);
  }

  if (status) {
    filters.push('status = ?');
    params.push(status);
  }

  if (accountType) {
    filters.push('account_type = ?');
    params.push(accountType);
  }

  const pg = normalisePagination(page, pageSize);

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM accounts ${whereClause}`,
    params
  );

  const [rows] = await pool.execute(
    `SELECT id, account_number, user_id, branch_id, account_type, balance, status, created_at FROM accounts ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, pg.pageSize, pg.offset]
  );

  await recordAudit({
    userId: actor.id,
    action: 'VIEW_ACCOUNTS',
    tableName: 'accounts',
    recordId: resolvedUserId || actor.id,
    ipAddress
  });

  return paginatedResponse('accounts', rows, {
    page: pg.page,
    pageSize: pg.pageSize,
    total: countRows[0].total
  });
};

const updateAccountStatus = async ({ accountId, status, actor, ipAddress }) => {
  if (!actor || !['Admin', 'Employee'].includes(actor.role)) {
    throw createError(403, 'Only Admin or Employee can update account status');
  }

  const [existingRows] = await pool.execute(
    'SELECT id, status FROM accounts WHERE id = ? LIMIT 1',
    [accountId]
  );

  if (existingRows.length === 0) {
    throw createError(404, 'Account not found');
  }

  if (existingRows[0].status === 'closed') {
    throw createError(409, 'Account already closed');
  }

  await pool.execute(
    'UPDATE accounts SET status = ? WHERE id = ? LIMIT 1',
    [status, accountId]
  );

  await recordAudit({
    userId: actor.id,
    action: status === 'frozen' ? 'FREEZE_ACCOUNT' : 'CLOSE_ACCOUNT',
    tableName: 'accounts',
    recordId: accountId,
    ipAddress
  });

  return { id: accountId, status };
};

module.exports = {
  createAccount,
  getAccounts,
  updateAccountStatus
};
