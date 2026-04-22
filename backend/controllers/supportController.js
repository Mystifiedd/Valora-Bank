const asyncHandler = require('../utils/asyncHandler');
const supportService = require('../services/supportService');

const createTicket = asyncHandler(async (req, res) => {
  const { user_id, subject, description } = req.body;
  const payload = await supportService.createTicket({
    userId: user_id ? Number(user_id) : null,
    subject,
    description,
    actor: req.user,
    ipAddress: req.ip
  });

  return res.status(201).json(payload);
});

const assignTicket = asyncHandler(async (req, res) => {
  const { assigned_employee_id } = req.body;
  const payload = await supportService.assignTicket({
    ticketId: Number(req.params.id),
    employeeId: Number(assigned_employee_id),
    actor: req.user,
    ipAddress: req.ip
  });

  return res.json(payload);
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const payload = await supportService.updateTicketStatus({
    ticketId: Number(req.params.id),
    status,
    actor: req.user,
    ipAddress: req.ip
  });

  return res.json(payload);
});

const listTickets = asyncHandler(async (req, res) => {
  const userId = req.query.user_id ? Number(req.query.user_id) : null;
  const status = req.query.status || null;
  const page = req.query.page ? Number(req.query.page) : 1;
  const pageSize = req.query.page_size ? Number(req.query.page_size) : 20;

  const payload = await supportService.listTickets({
    userId,
    status,
    page,
    pageSize,
    actor: req.user
  });

  return res.json(payload);
});

module.exports = {
  createTicket,
  assignTicket,
  updateStatus,
  listTickets
};
