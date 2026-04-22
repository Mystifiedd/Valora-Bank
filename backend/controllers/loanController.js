const asyncHandler = require('../utils/asyncHandler');
const loanService = require('../services/loanService');

const applyLoan = asyncHandler(async (req, res) => {
  const {
    user_id,
    loan_type,
    principal_amount,
    interest_rate,
    tenure_months
  } = req.body;

  const payload = await loanService.applyLoan({
    userId: user_id ? Number(user_id) : null,
    loanType: loan_type,
    principalAmount: Number(principal_amount),
    interestRate: interest_rate != null ? Number(interest_rate) : null,
    tenureMonths: Number(tenure_months),
    actor: req.user,
    ipAddress: req.ip
  });

  return res.status(201).json(payload);
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

const recordPayment = asyncHandler(async (req, res) => {
  const { amount_paid, payment_date } = req.body;
  const payload = await loanService.recordPayment({
    loanId: Number(req.params.id),
    amountPaid: Number(amount_paid),
    paymentDate: payment_date,
    actor: req.user,
    ipAddress: req.ip
  });

  return res.status(201).json(payload);
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

module.exports = {
  applyLoan,
  decideLoan,
  recordPayment,
  listLoans
};
