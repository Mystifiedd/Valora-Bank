const asyncHandler = require('../utils/asyncHandler');
const accountRequestService = require('../services/accountRequestService');

const submitRequest = asyncHandler(async (req, res) => {
  const { branch_id, account_type } = req.body;
  const payload = await accountRequestService.submitRequest({
    userId: req.user.id,
    branchId: Number(branch_id),
    accountType: account_type,
    ipAddress: req.ip
  });
  return res.status(201).json(payload);
});

const listRequests = asyncHandler(async (req, res) => {
  const status = req.query.status || null;
  const page = req.query.page ? Number(req.query.page) : 1;
  const pageSize = req.query.page_size ? Number(req.query.page_size) : 20;
  const payload = await accountRequestService.listRequests({
    actor: req.user,
    status,
    page,
    pageSize
  });
  return res.json(payload);
});

const reviewRequest = asyncHandler(async (req, res) => {
  const { decision } = req.body;
  const payload = await accountRequestService.reviewRequest({
    requestId: Number(req.params.id),
    decision,
    actor: req.user,
    ipAddress: req.ip
  });
  return res.json(payload);
});

const listBranches = asyncHandler(async (req, res) => {
  const branches = await accountRequestService.listBranches();
  return res.json({ branches });
});

module.exports = {
  submitRequest,
  listRequests,
  reviewRequest,
  listBranches
};
