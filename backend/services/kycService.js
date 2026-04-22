const pool = require('../config/db');
const { recordAudit } = require('./auditService');
const createError = require('../utils/createError');
const { normalisePagination, paginatedResponse } = require('../utils/pagination');

const submitKyc = async ({
  userId,
  documentType,
  documentNumber,
  actor,
  ipAddress
}) => {
  if (!actor) {
    throw createError(401, 'Authentication required');
  }

  const resolvedUserId = userId || actor.id;
  if (actor.role === 'Customer' && resolvedUserId !== actor.id) {
    throw createError(403, 'Forbidden');
  }

  const [existing] = await pool.execute(
    'SELECT id FROM kyc WHERE user_id = ? AND document_type = ? LIMIT 1',
    [resolvedUserId, documentType]
  );

  if (existing.length > 0) {
    throw createError(409, 'KYC already submitted for this document type');
  }

  const [result] = await pool.execute(
    'INSERT INTO kyc (user_id, document_type, document_number, status, submitted_at, verified_by) VALUES (?, ?, ?, ?, NOW(), NULL)',
    [resolvedUserId, documentType, documentNumber, 'pending']
  );

  await recordAudit({
    userId: actor.id,
    action: 'SUBMIT_KYC',
    tableName: 'kyc',
    recordId: result.insertId,
    ipAddress
  });

  return {
    id: result.insertId,
    user_id: resolvedUserId,
    document_type: documentType,
    document_number: documentNumber,
    status: 'pending'
  };
};

const verifyKyc = async ({ kycId, status, actor, ipAddress }) => {
  if (!actor || !['Employee', 'Admin'].includes(actor.role)) {
    throw createError(403, 'Only Employee or Admin can verify KYC');
  }

  const [rows] = await pool.execute(
    'SELECT id, status FROM kyc WHERE id = ? LIMIT 1',
    [kycId]
  );

  if (rows.length === 0) {
    throw createError(404, 'KYC record not found');
  }

  await pool.execute(
    'UPDATE kyc SET status = ?, verified_by = ? WHERE id = ? LIMIT 1',
    [status, actor.id, kycId]
  );

  await recordAudit({
    userId: actor.id,
    action: status === 'verified' ? 'VERIFY_KYC' : 'REJECT_KYC',
    tableName: 'kyc',
    recordId: kycId,
    ipAddress
  });

  return { id: kycId, status };
};

const listKyc = async ({ userId, status, page = 1, pageSize = 20, actor }) => {
  if (!actor) {
    throw createError(401, 'Authentication required');
  }

  // Customers can only see their own KYC records
  if (actor.role === 'Customer' && userId && userId !== actor.id) {
    throw createError(403, 'Forbidden');
  }

  const filters = [];
  const params = [];

  if (actor.role === 'Customer') {
    // Customers always see only their own KYC
    filters.push('user_id = ?');
    params.push(actor.id);
  } else if (userId) {
    // Admin/Employee can filter by user_id, or see all if not provided
    filters.push('user_id = ?');
    params.push(userId);
  }

  if (status) {
    filters.push('status = ?');
    params.push(status);
  }

  const pg = normalisePagination(page, pageSize);

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM kyc ${whereClause}`,
    params
  );

  const [rows] = await pool.execute(
    `SELECT id, user_id, document_type, document_number, status, submitted_at, verified_by FROM kyc ${whereClause} ORDER BY submitted_at DESC LIMIT ? OFFSET ?`,
    [...params, pg.pageSize, pg.offset]
  );

  return paginatedResponse('kyc', rows, {
    page: pg.page,
    pageSize: pg.pageSize,
    total: countRows[0].total
  });
};

module.exports = {
  submitKyc,
  verifyKyc,
  listKyc
};
