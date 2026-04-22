const pool = require('../config/db');
const { recordAudit } = require('./auditService');
const { createNotification } = require('./notificationService');
const createError = require('../utils/createError');
const { normalisePagination, paginatedResponse } = require('../utils/pagination');

const createTicket = async ({ userId, subject, description, actor, ipAddress }) => {
  if (!actor) {
    throw createError(401, 'Authentication required');
  }

  const resolvedUserId = userId || actor.id;
  if (actor.role === 'Customer' && resolvedUserId !== actor.id) {
    throw createError(403, 'Forbidden');
  }

  const [result] = await pool.execute(
    'INSERT INTO support_tickets (user_id, subject, description, status, assigned_employee_id, created_at) VALUES (?, ?, ?, ?, NULL, NOW())',
    [resolvedUserId, subject, description, 'open']
  );

  await recordAudit({
    userId: actor.id,
    action: 'CREATE_TICKET',
    tableName: 'support_tickets',
    recordId: result.insertId,
    ipAddress
  });

  return {
    id: result.insertId,
    user_id: resolvedUserId,
    subject,
    description,
    status: 'open'
  };
};

const assignTicket = async ({ ticketId, employeeId, actor, ipAddress }) => {
  if (!actor || !['Admin', 'Employee'].includes(actor.role)) {
    throw createError(403, 'Only Admin or Employee can assign tickets');
  }

  const [ticketRows] = await pool.execute(
    'SELECT id, user_id FROM support_tickets WHERE id = ? LIMIT 1',
    [ticketId]
  );

  if (ticketRows.length === 0) {
    throw createError(404, 'Ticket not found');
  }

  const [employeeRows] = await pool.execute(
    'SELECT users.id FROM users JOIN roles ON users.role_id = roles.id WHERE users.id = ? AND roles.name = ? LIMIT 1',
    [employeeId, 'Employee']
  );

  if (employeeRows.length === 0) {
    throw createError(404, 'Employee not found');
  }

  await pool.execute(
    'UPDATE support_tickets SET assigned_employee_id = ? WHERE id = ? LIMIT 1',
    [employeeId, ticketId]
  );

  await recordAudit({
    userId: actor.id,
    action: 'ASSIGN_TICKET',
    tableName: 'support_tickets',
    recordId: ticketId,
    ipAddress
  });

  await createNotification({
    userId: ticketRows[0].user_id,
    title: 'Support ticket assigned',
    message: `Your ticket #${ticketId} has been assigned to an employee.`
  });

  return { id: ticketId, assigned_employee_id: employeeId };
};

const updateTicketStatus = async ({ ticketId, status, actor, ipAddress }) => {
  if (!actor) {
    throw createError(401, 'Authentication required');
  }

  const [ticketRows] = await pool.execute(
    'SELECT id, user_id, status FROM support_tickets WHERE id = ? LIMIT 1',
    [ticketId]
  );

  if (ticketRows.length === 0) {
    throw createError(404, 'Ticket not found');
  }

  const ticket = ticketRows[0];
  if (actor.role === 'Customer' && ticket.user_id !== actor.id) {
    throw createError(403, 'Forbidden');
  }

  await pool.execute(
    'UPDATE support_tickets SET status = ? WHERE id = ? LIMIT 1',
    [status, ticketId]
  );

  await recordAudit({
    userId: actor.id,
    action: 'UPDATE_TICKET_STATUS',
    tableName: 'support_tickets',
    recordId: ticketId,
    ipAddress
  });

  await createNotification({
    userId: ticket.user_id,
    title: 'Support ticket updated',
    message: `Your ticket #${ticketId} status is now ${status}.`
  });

  return { id: ticketId, status };
};

const listTickets = async ({
  userId,
  status,
  page = 1,
  pageSize = 20,
  actor
}) => {
  if (!actor) {
    throw createError(401, 'Authentication required');
  }

  const resolvedUserId = userId || actor.id;
  if (actor.role === 'Customer' && resolvedUserId !== actor.id) {
    throw createError(403, 'Forbidden');
  }

  const filters = [];
  const params = [];

  if (actor.role === 'Customer') {
    filters.push('user_id = ?');
    params.push(actor.id);
  } else if (userId) {
    filters.push('user_id = ?');
    params.push(userId);
  }

  if (status) {
    filters.push('status = ?');
    params.push(status);
  }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

  const pg = normalisePagination(page, pageSize);

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM support_tickets ${whereClause}`,
    params
  );

  const [rows] = await pool.execute(
    `SELECT id, user_id, subject, description, status, assigned_employee_id, created_at FROM support_tickets ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, pg.pageSize, pg.offset]
  );

  return paginatedResponse('tickets', rows, {
    page: pg.page,
    pageSize: pg.pageSize,
    total: countRows[0].total
  });
};

module.exports = {
  createTicket,
  assignTicket,
  updateTicketStatus,
  listTickets
};
