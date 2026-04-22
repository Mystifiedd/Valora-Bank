const asyncHandler = require('../utils/asyncHandler');
const kycService = require('../services/kycService');

const submitKyc = asyncHandler(async (req, res) => {
  const { user_id, document_type, document_number } = req.body;
  const payload = await kycService.submitKyc({
    userId: user_id ? Number(user_id) : null,
    documentType: document_type,
    documentNumber: document_number,
    actor: req.user,
    ipAddress: req.ip
  });

  return res.status(201).json(payload);
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

const listKyc = asyncHandler(async (req, res) => {
  const userId = req.query.user_id ? Number(req.query.user_id) : null;
  const status = req.query.status || null;
  const page = req.query.page ? Number(req.query.page) : 1;
  const pageSize = req.query.page_size ? Number(req.query.page_size) : 20;

  const payload = await kycService.listKyc({
    userId,
    status,
    page,
    pageSize,
    actor: req.user
  });

  return res.json(payload);
});

module.exports = {
  submitKyc,
  verifyKyc,
  listKyc
};
