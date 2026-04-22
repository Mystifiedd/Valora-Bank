const asyncHandler = require('../utils/asyncHandler');
const transactionService = require('../services/transactionService');

const deposit = asyncHandler(async (req, res) => {
  const { account_id, amount } = req.body;
  const payload = await transactionService.deposit({
    accountId: Number(account_id),
    amount: Number(amount),
    actor: req.user,
    ipAddress: req.ip
  });

  return res.status(201).json(payload);
});

const withdraw = asyncHandler(async (req, res) => {
  const { account_id, amount } = req.body;
  const payload = await transactionService.withdraw({
    accountId: Number(account_id),
    amount: Number(amount),
    actor: req.user,
    ipAddress: req.ip
  });

  return res.status(201).json(payload);
});

const listTransactions = asyncHandler(async (req, res) => {
  const accountId = req.query.account_id ? Number(req.query.account_id) : null;
  const type = req.query.type || null;
  const startDate = req.query.start_date || null;
  const endDate = req.query.end_date || null;
  const page = req.query.page ? Number(req.query.page) : 1;
  const pageSize = req.query.page_size ? Number(req.query.page_size) : 20;

  const payload = await transactionService.listTransactions({
    accountId,
    type,
    startDate,
    endDate,
    page,
    pageSize,
    actor: req.user,
    ipAddress: req.ip
  });

  return res.json(payload);
});

module.exports = {
  deposit,
  withdraw,
  listTransactions
};
