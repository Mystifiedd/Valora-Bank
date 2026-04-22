const asyncHandler = require('../utils/asyncHandler');
const transferService = require('../services/transferService');

const createTransfer = asyncHandler(async (req, res) => {
  const { from_account_id, to_account_number, amount } = req.body;
  const payload = await transferService.createTransfer({
    fromAccountId: Number(from_account_id),
    toAccountNumber: to_account_number,
    amount: Number(amount),
    actor: req.user,
    ipAddress: req.ip
  });

  return res.status(201).json(payload);
});

module.exports = {
  createTransfer
};
