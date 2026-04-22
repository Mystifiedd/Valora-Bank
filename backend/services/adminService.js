const pool = require('../config/db');
const bcrypt = require('bcrypt');
const { recordAudit } = require('./auditService');
const loanService = require('./loanService');
const createError = require('../utils/createError');
const { normalisePagination, paginatedResponse } = require('../utils/pagination');

const SALT_ROUNDS = 12;

const parseMonthRange = (month) => {
  const [year, monthValue] = month.split('-').map((part) => Number(part));
  const startDate = new Date(Date.UTC(year, monthValue - 1, 1));
  const endDate = new Date(Date.UTC(year, monthValue, 1));
  return {
    start: startDate.toISOString().slice(0, 10),
    end: endDate.toISOString().slice(0, 10)
  };
};

const listUsers = async ({ role, isActive, branchId, page = 1, pageSize = 20 }) => {
  const filters = ['1=1'];
  const params = [];

  if (role) {
    filters.push('roles.name = ?');
    params.push(role);
  }

  if (isActive !== null && isActive !== undefined) {
    filters.push('users.is_active = ?');
    params.push(isActive ? 1 : 0);
  }

  if (branchId) {
    filters.push('users.branch_id = ?');
    params.push(branchId);
  }

  const pg = normalisePagination(page, pageSize);

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM users JOIN roles ON users.role_id = roles.id LEFT JOIN branches ON users.branch_id = branches.id WHERE ${filters.join(' AND ')}`,
    params
  );

  const [rows] = await pool.execute(
    `SELECT users.id, users.first_name, users.last_name, users.email, users.phone, users.branch_id, branches.name AS branch_name, users.is_active, users.created_at, roles.name AS role FROM users JOIN roles ON users.role_id = roles.id LEFT JOIN branches ON users.branch_id = branches.id WHERE ${filters.join(' AND ')} ORDER BY users.created_at DESC LIMIT ? OFFSET ?`,
    [...params, pg.pageSize, pg.offset]
  );

  return paginatedResponse('users', rows, {
    page: pg.page,
    pageSize: pg.pageSize,
    total: countRows[0].total
  });
};

const setUserStatus = async ({ userId, isActive, actor, ipAddress }) => {
  if (!actor || actor.role !== 'Admin') {
    throw createError(403, 'Only Admin can update user status');
  }

  const [rows] = await pool.execute(
    'SELECT id, is_active FROM users WHERE id = ? LIMIT 1',
    [userId]
  );

  if (rows.length === 0) {
    throw createError(404, 'User not found');
  }

  await pool.execute(
    'UPDATE users SET is_active = ? WHERE id = ? LIMIT 1',
    [isActive ? 1 : 0, userId]
  );

  await recordAudit({
    userId: actor.id,
    action: isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
    tableName: 'users',
    recordId: userId,
    ipAddress
  });

  return { id: userId, is_active: isActive ? 1 : 0 };
};

const listAccounts = async ({
  userId,
  branchId,
  status,
  accountType,
  page = 1,
  pageSize = 20
}) => {
  const filters = ['1=1'];
  const params = [];

  if (userId) {
    filters.push('accounts.user_id = ?');
    params.push(userId);
  }

  if (branchId) {
    filters.push('accounts.branch_id = ?');
    params.push(branchId);
  }

  if (status) {
    filters.push('accounts.status = ?');
    params.push(status);
  }

  if (accountType) {
    filters.push('accounts.account_type = ?');
    params.push(accountType);
  }

  const pg = normalisePagination(page, pageSize);

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM accounts WHERE ${filters.join(' AND ')}`,
    params
  );

  const [rows] = await pool.execute(
    `SELECT accounts.id, accounts.account_number, accounts.user_id, accounts.branch_id, accounts.account_type, accounts.balance, accounts.status, accounts.created_at FROM accounts WHERE ${filters.join(' AND ')} ORDER BY accounts.created_at DESC LIMIT ? OFFSET ?`,
    [...params, pg.pageSize, pg.offset]
  );

  return paginatedResponse('accounts', rows, {
    page: pg.page,
    pageSize: pg.pageSize,
    total: countRows[0].total
  });
};

const listEmployees = async ({ isActive, branchId, page = 1, pageSize = 20 }) => {
  const filters = ['roles.name = ?'];
  const params = ['Employee'];

  if (isActive !== null && isActive !== undefined) {
    filters.push('users.is_active = ?');
    params.push(isActive ? 1 : 0);
  }

  if (branchId) {
    filters.push('users.branch_id = ?');
    params.push(branchId);
  }

  const pg = normalisePagination(page, pageSize);

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM users JOIN roles ON users.role_id = roles.id WHERE ${filters.join(' AND ')}`,
    params
  );

  const [rows] = await pool.execute(
    `SELECT users.id, users.first_name, users.last_name, users.email, users.phone, users.branch_id, users.is_active, users.created_at FROM users JOIN roles ON users.role_id = roles.id WHERE ${filters.join(' AND ')} ORDER BY users.created_at DESC LIMIT ? OFFSET ?`,
    [...params, pg.pageSize, pg.offset]
  );

  return paginatedResponse('employees', rows, {
    page: pg.page,
    pageSize: pg.pageSize,
    total: countRows[0].total
  });
};

const updateEmployee = async ({ employeeId, isActive, branchId, actor, ipAddress }) => {
  if (!actor || actor.role !== 'Admin') {
    throw createError(403, 'Only Admin can manage employees');
  }

  const updates = [];
  const params = [];

  if (isActive !== null && isActive !== undefined) {
    updates.push('is_active = ?');
    params.push(isActive ? 1 : 0);
  }

  if (branchId) {
    updates.push('branch_id = ?');
    params.push(branchId);
  }

  if (updates.length === 0) {
    throw createError(400, 'No updates provided');
  }

  const [employeeRows] = await pool.execute(
    'SELECT users.id FROM users JOIN roles ON users.role_id = roles.id WHERE users.id = ? AND roles.name = ? LIMIT 1',
    [employeeId, 'Employee']
  );

  if (employeeRows.length === 0) {
    throw createError(404, 'Employee not found');
  }

  await pool.execute(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ? LIMIT 1`,
    [...params, employeeId]
  );

  if (isActive !== null && isActive !== undefined) {
    await recordAudit({
      userId: actor.id,
      action: isActive ? 'ACTIVATE_EMPLOYEE' : 'DEACTIVATE_EMPLOYEE',
      tableName: 'users',
      recordId: employeeId,
      ipAddress
    });
  }

  if (branchId) {
    await recordAudit({
      userId: actor.id,
      action: 'UPDATE_EMPLOYEE_BRANCH',
      tableName: 'users',
      recordId: employeeId,
      ipAddress
    });
  }

  return { id: employeeId, is_active: isActive, branch_id: branchId };
};

const listAuditLogs = async ({
  userId,
  action,
  tableName,
  startDate,
  endDate,
  page = 1,
  pageSize = 20
}) => {
  const filters = ['1=1'];
  const params = [];
  const transactionActions = ['TRANSFER', 'VIEW_TRANSACTIONS'];
  const monetaryActions = ['DEPOSIT', 'WITHDRAW'];
  const excludedForOthers = [...transactionActions, ...monetaryActions];

  if (userId) {
    filters.push('user_id = ?');
    params.push(userId);
  }

  if (action) {
    const normalised = action.toUpperCase();

    if (normalised === 'TRANSACTIONS') {
      const placeholders = transactionActions.map(() => '?').join(',');
      filters.push(`action IN (${placeholders})`);
      params.push(...transactionActions);
    } else if (normalised === 'OTHERS') {
      if (excludedForOthers.length > 0) {
        const placeholders = excludedForOthers.map(() => '?').join(',');
        filters.push(`action NOT IN (${placeholders})`);
        params.push(...excludedForOthers);
      }
    } else {
      filters.push('action = ?');
      params.push(normalised);
    }
  }

  if (tableName) {
    filters.push('table_name = ?');
    params.push(tableName);
  }

  if (startDate) {
    filters.push('timestamp >= ?');
    params.push(startDate);
  }

  if (endDate) {
    filters.push('timestamp <= ?');
    params.push(endDate);
  }

  const pg = normalisePagination(page, pageSize);

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM audit_logs WHERE ${filters.join(' AND ')}`,
    params
  );

  const [rows] = await pool.execute(
    `SELECT id, user_id, action, table_name, record_id, timestamp FROM audit_logs WHERE ${filters.join(' AND ')} ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
    [...params, pg.pageSize, pg.offset]
  );

  if (rows.length > 0) {
    const transactionIds = rows
      .filter((row) => row.table_name === 'transactions')
      .map((row) => row.record_id);
    const transferIds = rows
      .filter((row) => row.table_name === 'transfers')
      .map((row) => row.record_id);

    const amountLookups = [];

    if (transactionIds.length > 0) {
      const placeholders = transactionIds.map(() => '?').join(',');
      amountLookups.push(
        pool.execute(
          `SELECT id, amount FROM transactions WHERE id IN (${placeholders})`,
          transactionIds
        )
      );
    } else {
      amountLookups.push(Promise.resolve([[]]));
    }

    if (transferIds.length > 0) {
      const placeholders = transferIds.map(() => '?').join(',');
      amountLookups.push(
        pool.execute(
          `SELECT id, amount FROM transfers WHERE id IN (${placeholders})`,
          transferIds
        )
      );
    } else {
      amountLookups.push(Promise.resolve([[]]));
    }

    const [[transactionRows], [transferRows]] = await Promise.all(amountLookups);

    const transactionAmountMap = new Map(transactionRows.map((r) => [r.id, Number(r.amount)]));
    const transferAmountMap = new Map(transferRows.map((r) => [r.id, Number(r.amount)]));

    rows.forEach((row) => {
      if (row.table_name === 'transactions') {
        row.amount = transactionAmountMap.get(row.record_id) ?? null;
      } else if (row.table_name === 'transfers') {
        row.amount = transferAmountMap.get(row.record_id) ?? null;
      } else {
        row.amount = null;
      }
    });
  }

  return paginatedResponse('audit_logs', rows, {
    page: pg.page,
    pageSize: pg.pageSize,
    total: countRows[0].total
  });
};

const getBranchReports = async ({ startDate, endDate, page = 1, pageSize = 20 }) => {
  const pg = normalisePagination(page, pageSize);

  const [countRows] = await pool.execute(
    'SELECT COUNT(*) AS total FROM branches WHERE is_active = 1'
  );

  const [branches] = await pool.execute(
    'SELECT id, name, city, state, country FROM branches WHERE is_active = 1 ORDER BY name ASC LIMIT ? OFFSET ?',
    [pg.pageSize, pg.offset]
  );

  if (branches.length === 0) {
    return paginatedResponse('reports', [], {
      page: pg.page,
      pageSize: pg.pageSize,
      total: countRows[0].total
    });
  }

  const branchIds = branches.map((b) => b.id);
  const placeholders = branchIds.map(() => '?').join(',');

  // Batch queries instead of N+1 per-branch loop
  const dateParams = [];
  let loanDateFilter = '';
  let txnDateFilter = '';

  if (startDate) {
    loanDateFilter += ' AND loans.created_at >= ?';
    txnDateFilter += ' AND transactions.created_at >= ?';
    dateParams.push(startDate);
  }
  if (endDate) {
    loanDateFilter += ' AND loans.created_at <= ?';
    txnDateFilter += ' AND transactions.created_at <= ?';
    dateParams.push(endDate);
  }

  const [accountRows, userRows, loanRows, txnRows] = await Promise.all([
    pool.execute(
      `SELECT branch_id, COUNT(*) AS total_accounts FROM accounts WHERE branch_id IN (${placeholders}) GROUP BY branch_id`,
      branchIds
    ),
    pool.execute(
      `SELECT branch_id, COUNT(*) AS total_users FROM users WHERE branch_id IN (${placeholders}) GROUP BY branch_id`,
      branchIds
    ),
    pool.execute(
      `SELECT users.branch_id, COUNT(*) AS total_loans FROM loans JOIN users ON loans.user_id = users.id WHERE users.branch_id IN (${placeholders})${loanDateFilter} GROUP BY users.branch_id`,
      [...branchIds, ...dateParams]
    ),
    pool.execute(
      `SELECT accounts.branch_id, COUNT(*) AS total_transactions, COALESCE(SUM(transactions.amount), 0) AS volume FROM transactions JOIN accounts ON transactions.account_id = accounts.id WHERE accounts.branch_id IN (${placeholders})${txnDateFilter} GROUP BY accounts.branch_id`,
      [...branchIds, ...dateParams]
    )
  ]);

  const accountMap = Object.fromEntries(accountRows[0].map((r) => [r.branch_id, Number(r.total_accounts)]));
  const userMap = Object.fromEntries(userRows[0].map((r) => [r.branch_id, Number(r.total_users)]));
  const loanMap = Object.fromEntries(loanRows[0].map((r) => [r.branch_id, Number(r.total_loans)]));
  const txnMap = Object.fromEntries(txnRows[0].map((r) => [r.branch_id, { count: Number(r.total_transactions), volume: Number(r.volume) }]));

  const reports = branches.map((branch) => ({
    branch,
    total_users: userMap[branch.id] || 0,
    total_accounts: accountMap[branch.id] || 0,
    total_loans: loanMap[branch.id] || 0,
    total_transactions: txnMap[branch.id]?.count || 0,
    volume: txnMap[branch.id]?.volume || 0
  }));

  return paginatedResponse('reports', reports, {
    page: pg.page,
    pageSize: pg.pageSize,
    total: countRows[0].total
  });
};

const getDashboardStats = async ({ month }) => {
  const monthValue = month || new Date().toISOString().slice(0, 7);
  const { start, end } = parseMonthRange(monthValue);

  // Parallelize independent queries
  const [
    [[userRow]],
    [[accountRow]],
    [[loanRow]],
    [[txnRow]],
    [[volumeRow]]
  ] = await Promise.all([
    pool.execute('SELECT COUNT(*) AS total FROM users'),
    pool.execute('SELECT COUNT(*) AS total FROM accounts'),
    pool.execute('SELECT COUNT(*) AS total FROM loans'),
    pool.execute('SELECT COUNT(*) AS total FROM transactions'),
    pool.execute(
      'SELECT COALESCE(SUM(amount), 0) AS volume FROM transactions WHERE created_at >= ? AND created_at < ?',
      [start, end]
    )
  ]);

  return {
    month: monthValue,
    total_users: Number(userRow.total),
    total_accounts: Number(accountRow.total),
    total_loans: Number(loanRow.total),
    total_transactions: Number(txnRow.total),
    monthly_volume: Number(volumeRow.volume)
  };
};

const addEmployee = async ({ first_name, last_name, email, phone, password, branchId, actor, ipAddress }) => {
  if (!actor || actor.role !== 'Admin') {
    throw createError(403, 'Only Admin can add employees');
  }

  const [existing] = await pool.execute(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  if (existing.length > 0) {
    throw createError(409, 'Email already registered');
  }

  // Verify branch exists if provided
  if (branchId) {
    const [branchRows] = await pool.execute('SELECT id FROM branches WHERE id = ? AND is_active = 1 LIMIT 1', [branchId]);
    if (branchRows.length === 0) throw createError(404, 'Branch not found');
  }

  const [roleRows] = await pool.execute("SELECT id FROM roles WHERE name = 'Employee' LIMIT 1");
  if (roleRows.length === 0) throw createError(500, 'Employee role not configured');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [result] = await pool.execute(
    'INSERT INTO users (first_name, last_name, email, phone, password_hash, role_id, branch_id, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())',
    [first_name, last_name, email, phone, passwordHash, roleRows[0].id, branchId || null]
  );

  await recordAudit({
    userId: actor.id,
    action: 'ADD_EMPLOYEE',
    tableName: 'users',
    recordId: result.insertId,
    ipAddress
  });

  return { id: result.insertId, first_name, last_name, email, phone, branch_id: branchId || null, is_active: 1 };
};

const removeEmployee = async ({ employeeId, actor, ipAddress }) => {
  if (!actor || actor.role !== 'Admin') {
    throw createError(403, 'Only Admin can remove employees');
  }

  const [empRows] = await pool.execute(
    "SELECT users.id, users.email FROM users JOIN roles ON users.role_id = roles.id WHERE users.id = ? AND roles.name = 'Employee' LIMIT 1",
    [employeeId]
  );
  if (empRows.length === 0) throw createError(404, 'Employee not found');

  // Soft-delete: deactivate and unassign from branch
  await pool.execute(
    'UPDATE users SET is_active = 0, branch_id = NULL WHERE id = ? LIMIT 1',
    [employeeId]
  );

  // Unassign any open tickets
  await pool.execute(
    "UPDATE support_tickets SET assigned_employee_id = NULL WHERE assigned_employee_id = ? AND status != 'closed'",
    [employeeId]
  );

  await recordAudit({
    userId: actor.id,
    action: 'REMOVE_EMPLOYEE',
    tableName: 'users',
    recordId: employeeId,
    ipAddress
  });

  return { id: employeeId, removed: true };
};

const updateEmployeeRole = async ({ employeeId, roleId, actor, ipAddress }) => {
  if (!actor || actor.role !== 'Admin') {
    throw createError(403, 'Only Admin can change roles');
  }

  const [empRows] = await pool.execute('SELECT id FROM users WHERE id = ? LIMIT 1', [employeeId]);
  if (empRows.length === 0) throw createError(404, 'User not found');

  const [roleRows] = await pool.execute('SELECT id, name FROM roles WHERE id = ? LIMIT 1', [roleId]);
  if (roleRows.length === 0) throw createError(404, 'Role not found');

  await pool.execute('UPDATE users SET role_id = ? WHERE id = ? LIMIT 1', [roleId, employeeId]);

  await recordAudit({
    userId: actor.id,
    action: 'UPDATE_EMPLOYEE_ROLE',
    tableName: 'users',
    recordId: employeeId,
    ipAddress
  });

  return { id: employeeId, role_id: roleId, role: roleRows[0].name };
};

const approveLoan = async ({ loanId, status, actor, ipAddress }) => {
  return loanService.decideLoan({ loanId, status, actor, ipAddress });
};

module.exports = {
  listUsers,
  setUserStatus,
  listAccounts,
  listEmployees,
  updateEmployee,
  addEmployee,
  removeEmployee,
  updateEmployeeRole,
  listAuditLogs,
  getBranchReports,
  getDashboardStats,
  approveLoan
};
