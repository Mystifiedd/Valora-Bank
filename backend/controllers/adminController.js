const asyncHandler = require('../utils/asyncHandler');
const adminService = require('../services/adminService');
const parseBoolean = require('../utils/parseBoolean');

const listUsers = asyncHandler(async (req, res) => {
  const role = req.query.role || null;
  const isActive = parseBoolean(req.query.is_active);
  const branchId = req.query.branch_id ? Number(req.query.branch_id) : null;
  const page = req.query.page ? Number(req.query.page) : 1;
  const pageSize = req.query.page_size ? Number(req.query.page_size) : 20;

  const payload = await adminService.listUsers({
    role,
    isActive,
    branchId,
    page,
    pageSize
  });

  return res.json(payload);
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const isActive = parseBoolean(req.body.is_active);
  if (isActive === null) {
    return res.status(400).json({ error: 'is_active must be true or false' });
  }

  const payload = await adminService.setUserStatus({
    userId: Number(req.params.id),
    isActive,
    actor: req.user,
    ipAddress: req.ip
  });

  return res.json(payload);
});

const listAccounts = asyncHandler(async (req, res) => {
  const userId = req.query.user_id ? Number(req.query.user_id) : null;
  const branchId = req.query.branch_id ? Number(req.query.branch_id) : null;
  const status = req.query.status || null;
  const accountType = req.query.account_type || null;
  const page = req.query.page ? Number(req.query.page) : 1;
  const pageSize = req.query.page_size ? Number(req.query.page_size) : 20;

  const payload = await adminService.listAccounts({
    userId,
    branchId,
    status,
    accountType,
    page,
    pageSize
  });

  return res.json(payload);
});

const listEmployees = asyncHandler(async (req, res) => {
  const isActive = parseBoolean(req.query.is_active);
  const branchId = req.query.branch_id ? Number(req.query.branch_id) : null;
  const page = req.query.page ? Number(req.query.page) : 1;
  const pageSize = req.query.page_size ? Number(req.query.page_size) : 20;

  const payload = await adminService.listEmployees({
    isActive,
    branchId,
    page,
    pageSize
  });

  return res.json(payload);
});

const updateEmployee = asyncHandler(async (req, res) => {
  const isActive = parseBoolean(req.body.is_active);
  const branchId = req.body.branch_id ? Number(req.body.branch_id) : null;

  const payload = await adminService.updateEmployee({
    employeeId: Number(req.params.id),
    isActive,
    branchId,
    actor: req.user,
    ipAddress: req.ip
  });

  return res.json(payload);
});

const listAuditLogs = asyncHandler(async (req, res) => {
  const userId = req.query.user_id ? Number(req.query.user_id) : null;
  const action = req.query.action || null;
  const tableName = req.query.table_name || null;
  const startDate = req.query.start_date || null;
  const endDate = req.query.end_date || null;
  const page = req.query.page ? Number(req.query.page) : 1;
  const pageSize = req.query.page_size ? Number(req.query.page_size) : 20;

  const payload = await adminService.listAuditLogs({
    userId,
    action,
    tableName,
    startDate,
    endDate,
    page,
    pageSize
  });

  return res.json(payload);
});

const branchReport = asyncHandler(async (req, res) => {
  const startDate = req.query.start_date || null;
  const endDate = req.query.end_date || null;
  const page = req.query.page ? Number(req.query.page) : 1;
  const pageSize = req.query.page_size ? Number(req.query.page_size) : 20;

  const payload = await adminService.getBranchReports({
    startDate,
    endDate,
    page,
    pageSize
  });

  return res.json(payload);
});

const getStats = asyncHandler(async (req, res) => {
  const month = req.query.month || null;
  const payload = await adminService.getDashboardStats({ month });
  return res.json(payload);
});

const approveLoan = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const payload = await adminService.approveLoan({
    loanId: Number(req.params.id),
    status,
    actor: req.user,
    ipAddress: req.ip
  });

  return res.json(payload);
});

const addEmployee = asyncHandler(async (req, res) => {
  const { first_name, last_name, email, phone, password, branch_id } = req.body;
  const payload = await adminService.addEmployee({
    first_name,
    last_name,
    email,
    phone,
    password,
    branchId: branch_id ? Number(branch_id) : null,
    actor: req.user,
    ipAddress: req.ip
  });
  return res.status(201).json(payload);
});

const removeEmployee = asyncHandler(async (req, res) => {
  const payload = await adminService.removeEmployee({
    employeeId: Number(req.params.id),
    actor: req.user,
    ipAddress: req.ip
  });
  return res.json(payload);
});

const updateEmployeeRole = asyncHandler(async (req, res) => {
  const { role_id } = req.body;
  const payload = await adminService.updateEmployeeRole({
    employeeId: Number(req.params.id),
    roleId: Number(role_id),
    actor: req.user,
    ipAddress: req.ip
  });
  return res.json(payload);
});

module.exports = {
  listUsers,
  updateUserStatus,
  listAccounts,
  listEmployees,
  updateEmployee,
  addEmployee,
  removeEmployee,
  updateEmployeeRole,
  listAuditLogs,
  branchReport,
  getStats,
  approveLoan
};
