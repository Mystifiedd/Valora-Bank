const pool = require('../config/db');
const { recordAudit } = require('./auditService');
const { createNotification } = require('./notificationService');
const createError = require('../utils/createError');
const { generateReference } = require('../utils/crypto');
const { normalisePagination, paginatedResponse } = require('../utils/pagination');

const ensureAccountAccess = async ({ accountId, actor, connection }) => {
  if (!actor) {
    throw createError(401, 'Authentication required');
  }

  const executor = connection || pool;
  const lockClause = connection ? ' FOR UPDATE' : '';
  const [rows] = await executor.execute(
    `SELECT id, user_id, balance, status FROM accounts WHERE id = ? LIMIT 1${lockClause}`,
    [accountId]
  );

  if (rows.length === 0) {
    throw createError(404, 'Account not found');
  }

  const account = rows[0];

  if (actor.role === 'Customer' && account.user_id !== actor.id) {
    throw createError(403, 'Forbidden');
  }

  if (account.status !== 'active') {
    throw createError(409, 'Account not active');
  }

  return account;
};

const deposit = async ({ accountId, amount, actor, ipAddress }) => {
  if (amount <= 0) {
    throw createError(400, 'Amount must be greater than zero');
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const account = await ensureAccountAccess({
      accountId,
      actor,
      connection
    });

    const newBalance = Number(account.balance) + Number(amount);

    await connection.execute(
      'UPDATE accounts SET balance = ? WHERE id = ? LIMIT 1',
      [newBalance, accountId]
    );

    const reference = generateReference('DEP');
    const [txnResult] = await connection.execute(
      'INSERT INTO transactions (account_id, type, amount, reference_number, description, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [accountId, 'credit', amount, reference, 'Deposit']
    );

    await createNotification({
      userId: account.user_id,
      title: 'Deposit received',
      message: `Deposit of ${amount} completed. Ref: ${reference}.`,
      connection
    });

    await recordAudit({
      userId: actor.id,
      action: 'DEPOSIT',
      tableName: 'transactions',
      recordId: txnResult.insertId,
      ipAddress,
      connection
    });

    await connection.commit();

    return {
      transaction_id: txnResult.insertId,
      account_id: accountId,
      balance: newBalance,
      reference
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const withdraw = async ({ accountId, amount, actor, ipAddress }) => {
  if (amount <= 0) {
    throw createError(400, 'Amount must be greater than zero');
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const account = await ensureAccountAccess({
      accountId,
      actor,
      connection
    });

    if (Number(account.balance) < Number(amount)) {
      throw createError(409, 'Insufficient balance');
    }

    const newBalance = Number(account.balance) - Number(amount);

    await connection.execute(
      'UPDATE accounts SET balance = ? WHERE id = ? LIMIT 1',
      [newBalance, accountId]
    );

    const reference = generateReference('WDR');
    const [txnResult] = await connection.execute(
      'INSERT INTO transactions (account_id, type, amount, reference_number, description, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [accountId, 'debit', amount, reference, 'Withdrawal']
    );

    await createNotification({
      userId: account.user_id,
      title: 'Withdrawal processed',
      message: `Withdrawal of ${amount} completed. Ref: ${reference}.`,
      connection
    });

    await recordAudit({
      userId: actor.id,
      action: 'WITHDRAW',
      tableName: 'transactions',
      recordId: txnResult.insertId,
      ipAddress,
      connection
    });

    await connection.commit();

    return {
      transaction_id: txnResult.insertId,
      account_id: accountId,
      balance: newBalance,
      reference
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const listTransactions = async ({
  accountId,
  type,
  startDate,
  endDate,
  page = 1,
  pageSize = 20,
  actor,
  ipAddress
}) => {
  if (!accountId) {
    throw createError(400, 'account_id is required');
  }

  if (!actor) {
    throw createError(401, 'Authentication required');
  }

  const [accountRows] = await pool.execute(
    'SELECT id, user_id FROM accounts WHERE id = ? LIMIT 1',
    [accountId]
  );

  if (accountRows.length === 0) {
    throw createError(404, 'Account not found');
  }

  const account = accountRows[0];
  if (actor.role === 'Customer' && account.user_id !== actor.id) {
    throw createError(403, 'Forbidden');
  }

  const filters = ['account_id = ?'];
  const params = [accountId];

  if (type) {
    filters.push('type = ?');
    params.push(type);
  }

  if (startDate) {
    filters.push('created_at >= ?');
    params.push(startDate);
  }

  if (endDate) {
    filters.push('created_at <= ?');
    params.push(endDate);
  }

  const pg = normalisePagination(page, pageSize);

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM transactions WHERE ${filters.join(' AND ')}`,
    params
  );

  const [rows] = await pool.execute(
    `SELECT id, account_id, type, amount, reference_number, description, created_at FROM transactions WHERE ${filters.join(' AND ')} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, pg.pageSize, pg.offset]
  );

  await recordAudit({
    userId: actor.id,
    action: 'VIEW_TRANSACTIONS',
    tableName: 'transactions',
    recordId: accountId,
    ipAddress
  });

  return paginatedResponse('transactions', rows, {
    page: pg.page,
    pageSize: pg.pageSize,
    total: countRows[0].total
  });
};

module.exports = {
  deposit,
  withdraw,
  listTransactions
};
