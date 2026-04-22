const asyncHandler = require('../utils/asyncHandler');
const accountService = require('../services/accountService');

const createAccount = asyncHandler(async (req, res) => {
  const { user_id, branch_id, account_type } = req.body;
  const payload = await accountService.createAccount({
    userId: Number(user_id),
    branchId: Number(branch_id),
    accountType: account_type,
    actor: req.user,
    ipAddress: req.ip
  });

  return res.status(201).json(payload);
});

const getAccounts = asyncHandler(async (req, res) => {
  const userId = req.query.user_id ? Number(req.query.user_id) : null;
  const status = req.query.status || null;
  const accountType = req.query.account_type || null;
  const page = req.query.page ? Number(req.query.page) : 1;
  const pageSize = req.query.page_size ? Number(req.query.page_size) : 20;
  const payload = await accountService.getAccounts({
    userId,
    actor: req.user,
    status,
    accountType,
    page,
    pageSize,
    ipAddress: req.ip
  });

  return res.json(payload);
});

const freezeAccount = asyncHandler(async (req, res) => {
  const payload = await accountService.updateAccountStatus({
    accountId: Number(req.params.id),
    status: 'frozen',
    actor: req.user,
    ipAddress: req.ip
  });

  return res.json(payload);
});

const closeAccount = asyncHandler(async (req, res) => {
  const payload = await accountService.updateAccountStatus({
    accountId: Number(req.params.id),
    status: 'closed',
    actor: req.user,
    ipAddress: req.ip
  });

  return res.json(payload);
});

module.exports = {
  createAccount,
  getAccounts,
  freezeAccount,
  closeAccount
};
