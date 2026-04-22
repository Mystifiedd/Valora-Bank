const pool = require('../config/db');
const { recordAudit } = require('./auditService');
const { createNotification } = require('./notificationService');
const accountService = require('./accountService');
const createError = require('../utils/createError');
const { normalisePagination, paginatedResponse } = require('../utils/pagination');

/**
 * Customer submits a new account request.
 */
const submitRequest = async ({ userId, branchId, accountType, ipAddress }) => {
  // Validate branch
  const [branchRows] = await pool.execute(
    'SELECT id, name FROM branches WHERE id = ? AND is_active = 1 LIMIT 1',
    [branchId]
  );
  if (branchRows.length === 0) throw createError(404, 'Branch not found');

  // Check for duplicate pending request
  const [dup] = await pool.execute(
    "SELECT id FROM account_requests WHERE user_id = ? AND branch_id = ? AND account_type = ? AND status = 'pending' LIMIT 1",
    [userId, branchId, accountType]
  );
  if (dup.length > 0) throw createError(409, 'You already have a pending request for this account type at this branch');

  const [result] = await pool.execute(
    'INSERT INTO account_requests (user_id, branch_id, account_type, status, created_at) VALUES (?, ?, ?, ?, NOW())',
    [userId, branchId, accountType, 'pending']
  );

  return {
    id: result.insertId,
    user_id: userId,
    branch_id: branchId,
    branch_name: branchRows[0].name,
    account_type: accountType,
    status: 'pending'
  };
};

/**
 * List account requests (customer sees own, employee/admin sees all or by branch).
 */
const listRequests = async ({ actor, status, page = 1, pageSize = 20 }) => {
  const filters = [];
  const params = [];

  if (actor.role === 'Customer') {
    filters.push('ar.user_id = ?');
    params.push(actor.id);
  } else if (actor.role === 'Employee' && actor.branch_id) {
    // Employees see requests for their branch
    filters.push('ar.branch_id = ?');
    params.push(actor.branch_id);
  }
  // Admin sees all

  if (status) {
    filters.push('ar.status = ?');
    params.push(status);
  }

  if (filters.length === 0) filters.push('1=1');

  const pg = normalisePagination(page, pageSize);

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM account_requests ar WHERE ${filters.join(' AND ')}`,
    params
  );

  const [rows] = await pool.execute(
    `SELECT ar.id, ar.user_id, ar.branch_id, ar.account_type, ar.status, ar.created_at, ar.reviewed_by, ar.reviewed_at,
            u.first_name, u.last_name, u.email,
            b.name AS branch_name, b.city AS branch_city,
            acc.account_number
     FROM account_requests ar
     JOIN users u ON ar.user_id = u.id
     JOIN branches b ON ar.branch_id = b.id
     LEFT JOIN accounts acc ON (ar.user_id = acc.user_id AND ar.branch_id = acc.branch_id AND ar.account_type = acc.account_type AND ar.status = 'approved')
     WHERE ${filters.join(' AND ')}
     ORDER BY ar.created_at DESC LIMIT ? OFFSET ?`,
    [...params, pg.pageSize, pg.offset]
  );

  return paginatedResponse('requests', rows, {
    page: pg.page,
    pageSize: pg.pageSize,
    total: countRows[0].total
  });
};

/**
 * Employee/Admin approves or rejects an account request.
 * On approval, creates the actual account immediately.
 */
const reviewRequest = async ({ requestId, decision, actor, ipAddress }) => {
  if (!actor || !['Admin', 'Employee'].includes(actor.role)) {
    throw createError(403, 'Only Admin or Employee can review account requests');
  }

  const [reqRows] = await pool.execute(
    'SELECT id, user_id, branch_id, account_type, status FROM account_requests WHERE id = ? LIMIT 1',
    [requestId]
  );
  if (reqRows.length === 0) throw createError(404, 'Account request not found');

  const request = reqRows[0];
  if (request.status !== 'pending') {
    throw createError(409, `Request already ${request.status}`);
  }

  // Update request status
  await pool.execute(
    'UPDATE account_requests SET status = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ? LIMIT 1',
    [decision, actor.id, requestId]
  );

  let account = null;

  if (decision === 'approved') {
    // Create the actual account immediately
    account = await accountService.createAccount({
      userId: request.user_id,
      branchId: request.branch_id,
      accountType: request.account_type,
      actor,
      ipAddress
    });

    await createNotification({
      userId: request.user_id,
      title: 'Account Request Approved',
      message: `Your ${request.account_type} account has been approved and created! Account #: ${account.account_number}`
    });
  } else {
    await createNotification({
      userId: request.user_id,
      title: 'Account Request Rejected',
      message: `Your ${request.account_type} account request has been rejected.`
    });
  }

  await recordAudit({
    userId: actor.id,
    action: decision === 'approved' ? 'APPROVE_ACCOUNT_REQUEST' : 'REJECT_ACCOUNT_REQUEST',
    tableName: 'account_requests',
    recordId: requestId,
    ipAddress
  });

  return { id: requestId, status: decision, account };
};

/**
 * List all active branches (public for dropdown).
 */
const listBranches = async () => {
  const [rows] = await pool.execute(
    'SELECT id, name, city, state, IFSC_code FROM branches WHERE is_active = 1 ORDER BY name ASC'
  );
  return rows;
};

module.exports = {
  submitRequest,
  listRequests,
  reviewRequest,
  listBranches
};
