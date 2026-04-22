const pool = require('../config/db');
const { recordAudit } = require('./auditService');
const { createNotification } = require('./notificationService');
const createError = require('../utils/createError');
const { normalisePagination, paginatedResponse } = require('../utils/pagination');

const listBranchUsers = async ({
  branchId,
  role,
  isActive,
  page = 1,
  pageSize = 20,
  actor
}) => {
  if (!actor || !['Employee', 'Admin'].includes(actor.role)) {
    throw createError(403, 'Only Employee or Admin can view branch users');
  }

  const resolvedBranchId = actor.role === 'Employee' ? actor.branch_id : branchId;
  if (!resolvedBranchId) {
    throw createError(400, 'branch_id is required');
  }

  const filters = ['users.branch_id = ?'];
  const params = [resolvedBranchId];

  if (role) {
    filters.push('roles.name = ?');
    params.push(role);
  }

  if (isActive !== null && isActive !== undefined) {
    filters.push('users.is_active = ?');
    params.push(isActive ? 1 : 0);
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

  return {
    ...paginatedResponse('users', rows, {
      page: pg.page,
      pageSize: pg.pageSize,
      total: countRows[0].total
    }),
    branch_id: resolvedBranchId
  };
};

const listAssignedTickets = async ({
  actor,
  status,
  includeUnassigned,
  page = 1,
  pageSize = 20
}) => {
  if (!actor || !['Employee', 'Admin'].includes(actor.role)) {
    throw createError(403, 'Only Employee or Admin can view assigned tickets');
  }

  const filters = [];
  const params = [];

  if (actor.role === 'Employee') {
    // Employees see all tickets (assigned to them, unassigned, or all)
    if (!includeUnassigned) {
      // default: show assigned to self + unassigned
      filters.push('(assigned_employee_id = ? OR assigned_employee_id IS NULL)');
      params.push(actor.id);
    }
    // if includeUnassigned is true, show everything (no filter)
  } else if (includeUnassigned) {
    filters.push('assigned_employee_id IS NULL');
  }

  if (status) {
    filters.push('status = ?');
    params.push(status);
  }

  if (filters.length === 0) {
    filters.push('1=1');
  }

  const pg = normalisePagination(page, pageSize);

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM support_tickets WHERE ${filters.join(' AND ')}`,
    params
  );

  const [rows] = await pool.execute(
    `SELECT id, user_id, subject, description, status, assigned_employee_id, created_at FROM support_tickets WHERE ${filters.join(' AND ')} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, pg.pageSize, pg.offset]
  );

  return paginatedResponse('tickets', rows, {
    page: pg.page,
    pageSize: pg.pageSize,
    total: countRows[0].total
  });
};

const assignTicketToSelf = async ({ ticketId, actor, ipAddress }) => {
  if (!actor || !['Employee', 'Admin'].includes(actor.role)) {
    throw createError(403, 'Only Employee or Admin can assign tickets');
  }

  const [ticketRows] = await pool.execute(
    'SELECT id, user_id, assigned_employee_id FROM support_tickets WHERE id = ? LIMIT 1',
    [ticketId]
  );

  if (ticketRows.length === 0) {
    throw createError(404, 'Ticket not found');
  }

  const ticket = ticketRows[0];
  if (ticket.assigned_employee_id && ticket.assigned_employee_id !== actor.id) {
    throw createError(409, 'Ticket already assigned');
  }

  await pool.execute(
    'UPDATE support_tickets SET assigned_employee_id = ? WHERE id = ? LIMIT 1',
    [actor.id, ticketId]
  );

  await recordAudit({
    userId: actor.id,
    action: 'ASSIGN_TICKET_SELF',
    tableName: 'support_tickets',
    recordId: ticketId,
    ipAddress
  });

  await createNotification({
    userId: ticket.user_id,
    title: 'Support ticket assigned',
    message: `Your ticket #${ticketId} has been assigned to an employee.`
  });

  return { id: ticketId, assigned_employee_id: actor.id };
};

/**
 * Branch-scoped dashboard stats for Employee.
 */
const getBranchDashboardStats = async ({ actor }) => {
  if (!actor || !['Employee', 'Admin'].includes(actor.role)) {
    throw createError(403, 'Only Employee or Admin can view branch stats');
  }

  const branchId = actor.branch_id;
  if (!branchId) throw createError(400, 'Employee has no assigned branch');

  // Current week boundaries (Mon–Sun)
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = (day + 6) % 7;
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - diffToMonday);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const weekStartStr = weekStart.toISOString().slice(0, 19).replace('T', ' ');
  const weekEndStr = weekEnd.toISOString().slice(0, 19).replace('T', ' ');

  const [
    [[branchUsersRow]],
    [[pendingKycRow]],
    [[openTicketsRow]],
    [[totalTicketsRow]],
    [[pendingRequestsRow]],
    [[pendingLoansRow]],
    [weeklyTxns],
  ] = await Promise.all([
    pool.execute(
      'SELECT COUNT(*) AS total FROM users WHERE branch_id = ? AND is_active = 1',
      [branchId]
    ),
    pool.execute(
      "SELECT COUNT(*) AS total FROM kyc WHERE status = 'pending'"
    ),
    pool.execute(
      "SELECT COUNT(*) AS total FROM support_tickets WHERE status IN ('open','in_progress')"
    ),
    pool.execute(
      'SELECT COUNT(*) AS total FROM support_tickets'
    ),
    pool.execute(
      "SELECT COUNT(*) AS total FROM account_requests WHERE branch_id = ? AND status = 'pending'",
      [branchId]
    ),
    pool.execute(
      "SELECT COUNT(*) AS total FROM loans WHERE status = 'pending'"
    ),
    pool.execute(
      `SELECT DATE(t.created_at) AS txn_date, COUNT(*) AS cnt
       FROM transactions t
       JOIN accounts a ON t.account_id = a.id
       WHERE a.branch_id = ? AND t.created_at >= ? AND t.created_at < ?
       GROUP BY DATE(t.created_at)
       ORDER BY txn_date`,
      [branchId, weekStartStr, weekEndStr]
    ),
  ]);

  // Build weekly activity array (Mon-Sun)
  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekActivity = weekLabels.map((label, idx) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + idx);
    const dateStr = d.toISOString().slice(0, 10);
    const match = weeklyTxns.find((r) => {
      const rd = new Date(r.txn_date);
      return rd.toISOString().slice(0, 10) === dateStr;
    });
    return { label, value: match ? Number(match.cnt) : 0 };
  });

  return {
    branch_users: Number(branchUsersRow.total),
    pending_kyc: Number(pendingKycRow.total),
    open_tickets: Number(openTicketsRow.total),
    total_tickets: Number(totalTicketsRow.total),
    pending_requests: Number(pendingRequestsRow.total),
    pending_loans: Number(pendingLoansRow.total),
    weekly_activity: weekActivity,
  };
};

module.exports = {
  listBranchUsers,
  listAssignedTickets,
  assignTicketToSelf,
  getBranchDashboardStats
};
