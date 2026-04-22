const asyncHandler = require('../utils/asyncHandler');
const employeeService = require('../services/employeeService');
const kycService = require('../services/kycService');
const loanService = require('../services/loanService');
const supportService = require('../services/supportService');
const parseBoolean = require('../utils/parseBoolean');

const listBranchUsers = asyncHandler(async (req, res) => {
  const branchId = req.query.branch_id ? Number(req.query.branch_id) : null;
  const role = req.query.role || 'Customer';
  const isActive = parseBoolean(req.query.is_active);
  const page = req.query.page ? Number(req.query.page) : 1;
  const pageSize = req.query.page_size ? Number(req.query.page_size) : 20;

  const payload = await employeeService.listBranchUsers({
    branchId,
    role,
    isActive,
    page,
    pageSize,
    actor: req.user
  });

  return res.json(payload);
});

const verifyKyc = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const payload = await kycService.verifyKyc({
    kycId: Number(req.params.id),
    status,
    actor: req.user,
    ipAddress: req.ip
  });

  return res.json(payload);
});

const listTickets = asyncHandler(async (req, res) => {
  const status = req.query.status || null;
  const includeUnassigned = parseBoolean(req.query.include_unassigned);
  const page = req.query.page ? Number(req.query.page) : 1;
  const pageSize = req.query.page_size ? Number(req.query.page_size) : 20;

  const payload = await employeeService.listAssignedTickets({
    actor: req.user,
    status,
    includeUnassigned: Boolean(includeUnassigned),
    page,
    pageSize
  });

  return res.json(payload);
});

const assignTicketToSelf = asyncHandler(async (req, res) => {
  const payload = await employeeService.assignTicketToSelf({
    ticketId: Number(req.params.id),
    actor: req.user,
    ipAddress: req.ip
  });

  return res.json(payload);
});

const updateTicketStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const payload = await supportService.updateTicketStatus({
    ticketId: Number(req.params.id),
    status,
    actor: req.user,
    ipAddress: req.ip
  });

  return res.json(payload);
});

const listLoans = asyncHandler(async (req, res) => {
  const userId = req.query.user_id ? Number(req.query.user_id) : null;
  const status = req.query.status || null;
  const page = req.query.page ? Number(req.query.page) : 1;
  const pageSize = req.query.page_size ? Number(req.query.page_size) : 20;

  const payload = await loanService.listLoans({
    userId,
    status,
    page,
    pageSize,
    actor: req.user
  });

  return res.json(payload);
});

const decideLoan = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const payload = await loanService.decideLoan({
    loanId: Number(req.params.id),
    status,
    actor: req.user,
    ipAddress: req.ip
  });

  return res.json(payload);
});

const dashboardStats = asyncHandler(async (req, res) => {
  const payload = await employeeService.getBranchDashboardStats({
    actor: req.user
  });
  return res.json(payload);
});

module.exports = {
  listBranchUsers,
  verifyKyc,
  listTickets,
  assignTicketToSelf,
  updateTicketStatus,
  listLoans,
  decideLoan,
  dashboardStats
};
