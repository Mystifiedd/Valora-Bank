const pool = require('../config/db');
const { recordAudit } = require('./auditService');
const { createNotification } = require('./notificationService');
const createError = require('../utils/createError');
const { normalisePagination, paginatedResponse } = require('../utils/pagination');

const calculateInterest = ({ principalAmount, interestRate, tenureMonths }) => {
  const totalInterest =
    Number(principalAmount) * (Number(interestRate) / 100) *
    (Number(tenureMonths) / 12);
  const totalPayable = Number(principalAmount) + totalInterest;
  const monthlyPayment = totalPayable / Number(tenureMonths);

  return {
    total_interest: Number(totalInterest.toFixed(2)),
    total_payable: Number(totalPayable.toFixed(2)),
    monthly_payment: Number(monthlyPayment.toFixed(2))
  };
};

// Default interest rates by loan type (only Admin/Employee can override)
const DEFAULT_INTEREST_RATES = {
  personal: 10.5,
  home: 8.5,
  auto: 9.0,
  education: 7.5,
  business: 11.0
};

const DEFAULT_INTEREST_RATE = 10.5;

const applyLoan = async ({
  userId,
  loanType,
  principalAmount,
  interestRate,
  tenureMonths,
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

  // Customers cannot set interest rate — use system default based on loan type
  let resolvedInterestRate;
  if (actor.role === 'Customer') {
    resolvedInterestRate = DEFAULT_INTEREST_RATES[loanType] || DEFAULT_INTEREST_RATE;
  } else {
    // Admin/Employee can set custom interest rate, fall back to default if not provided
    resolvedInterestRate = (interestRate != null && !Number.isNaN(interestRate))
      ? interestRate
      : (DEFAULT_INTEREST_RATES[loanType] || DEFAULT_INTEREST_RATE);
  }

  if (principalAmount <= 0 || resolvedInterestRate <= 0 || tenureMonths <= 0) {
    throw createError(400, 'Invalid loan terms');
  }

  const [userRows] = await pool.execute(
    'SELECT id FROM users WHERE id = ? AND is_active = 1 LIMIT 1',
    [resolvedUserId]
  );

  if (userRows.length === 0) {
    throw createError(404, 'User not found');
  }

  const [result] = await pool.execute(
    'INSERT INTO loans (user_id, loan_type, principal_amount, interest_rate, tenure_months, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
    [resolvedUserId, loanType, principalAmount, resolvedInterestRate, tenureMonths, 'pending']
  );

  await recordAudit({
    userId: actor.id,
    action: 'APPLY_LOAN',
    tableName: 'loans',
    recordId: result.insertId,
    ipAddress
  });

  // Notify Admins and Employees about the new loan request
  const [staff] = await pool.execute(
    'SELECT users.id FROM users JOIN roles ON users.role_id = roles.id WHERE roles.name IN (?, ?)',
    ['Admin', 'Employee']
  );
  
  for (const s of staff) {
    await createNotification({
      userId: s.id,
      title: 'New Loan Application',
      message: `A new ${loanType} loan application of ${principalAmount} has been submitted by user #${resolvedUserId}.`
    });
  }

  return {
    id: result.insertId,
    user_id: resolvedUserId,
    loan_type: loanType,
    principal_amount: Number(principalAmount),
    interest_rate: Number(resolvedInterestRate),
    tenure_months: Number(tenureMonths),
    status: 'pending',
    ...calculateInterest({ principalAmount, interestRate: resolvedInterestRate, tenureMonths })
  };
};

const decideLoan = async ({ loanId, status, actor, ipAddress }) => {
  if (!actor || !['Admin', 'Employee'].includes(actor.role)) {
    throw createError(403, 'Only Admin or Employee can approve or reject loans');
  }

  const [rows] = await pool.execute(
    'SELECT id, user_id, status FROM loans WHERE id = ? LIMIT 1',
    [loanId]
  );

  if (rows.length === 0) {
    throw createError(404, 'Loan not found');
  }

  const loan = rows[0];
  if (loan.status !== 'pending') {
    throw createError(409, 'Loan already processed');
  }

  await pool.execute(
    'UPDATE loans SET status = ? WHERE id = ? LIMIT 1',
    [status, loanId]
  );

  await recordAudit({
    userId: actor.id,
    action: status === 'approved' ? 'APPROVE_LOAN' : 'REJECT_LOAN',
    tableName: 'loans',
    recordId: loanId,
    ipAddress
  });

  await createNotification({
    userId: loan.user_id,
    title: `Loan ${status}`,
    message: `Your loan request has been ${status}.`
  });

  return { id: loanId, status };
};

const recordPayment = async ({
  loanId,
  amountPaid,
  paymentDate,
  actor,
  ipAddress
}) => {
  if (!actor) {
    throw createError(401, 'Authentication required');
  }

  if (amountPaid <= 0) {
    throw createError(400, 'Amount must be greater than zero');
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [loanRows] = await connection.execute(
      'SELECT id, user_id, principal_amount, interest_rate, tenure_months, status FROM loans WHERE id = ? FOR UPDATE',
      [loanId]
    );

    if (loanRows.length === 0) {
      throw createError(404, 'Loan not found');
    }

    const loan = loanRows[0];
    if (actor.role === 'Customer' && loan.user_id !== actor.id) {
      throw createError(403, 'Forbidden');
    }

    if (loan.status !== 'approved') {
      throw createError(409, 'Loan is not active');
    }

    const dateValue = paymentDate || new Date().toISOString().slice(0, 10);

    const [paymentResult] = await connection.execute(
      'INSERT INTO loan_payments (loan_id, amount_paid, payment_date) VALUES (?, ?, ?)',
      [loanId, amountPaid, dateValue]
    );

    const [sumRows] = await connection.execute(
      'SELECT COALESCE(SUM(amount_paid), 0) AS total_paid FROM loan_payments WHERE loan_id = ?',
      [loanId]
    );

    const { total_payable: totalPayable } = calculateInterest({
      principalAmount: loan.principal_amount,
      interestRate: loan.interest_rate,
      tenureMonths: loan.tenure_months
    });

    const totalPaid = Number(sumRows[0].total_paid) || 0;
    let newStatus = loan.status;

    if (totalPaid >= totalPayable) {
      newStatus = 'closed';
      await connection.execute(
        'UPDATE loans SET status = ? WHERE id = ? LIMIT 1',
        [newStatus, loanId]
      );

      await recordAudit({
        userId: actor.id,
        action: 'CLOSE_LOAN',
        tableName: 'loans',
        recordId: loanId,
        ipAddress,
        connection
      });
    }

    await recordAudit({
      userId: actor.id,
      action: 'RECORD_LOAN_PAYMENT',
      tableName: 'loan_payments',
      recordId: paymentResult.insertId,
      ipAddress,
      connection
    });

    await createNotification({
      userId: loan.user_id,
      title: 'Loan payment received',
      message: `Payment of ${amountPaid} received for your loan.`,
      connection
    });

    if (newStatus === 'closed') {
      await createNotification({
        userId: loan.user_id,
        title: 'Loan closed',
        message: 'Your loan has been fully repaid and closed.',
        connection
      });
    }

    await connection.commit();

    return {
      id: paymentResult.insertId,
      loan_id: loanId,
      amount_paid: Number(amountPaid),
      payment_date: dateValue,
      total_paid: totalPaid,
      total_payable: totalPayable,
      status: newStatus
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const listLoans = async ({ userId, status, page = 1, pageSize = 20, actor }) => {
  if (!actor) {
    throw createError(401, 'Authentication required');
  }

  // Customers can only see their own loans
  if (actor.role === 'Customer' && userId && userId !== actor.id) {
    throw createError(403, 'Forbidden');
  }

  const filters = [];
  const params = [];

  if (actor.role === 'Customer') {
    // Customers always see only their own loans
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

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

  const pg = normalisePagination(page, pageSize);

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM loans ${whereClause}`,
    params
  );

  const [rows] = await pool.execute(
    `SELECT id, user_id, loan_type, principal_amount, interest_rate, tenure_months, status, created_at FROM loans ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, pg.pageSize, pg.offset]
  );

  return paginatedResponse('loans', rows, {
    page: pg.page,
    pageSize: pg.pageSize,
    total: countRows[0].total
  });
};

module.exports = {
  applyLoan,
  decideLoan,
  recordPayment,
  listLoans
};
