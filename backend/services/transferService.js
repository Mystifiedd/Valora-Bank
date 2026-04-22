const pool = require('../config/db');
const { recordAudit } = require('./auditService');
const { createNotification } = require('./notificationService');
const createError = require('../utils/createError');
const { generateReference } = require('../utils/crypto');

const createTransfer = async ({
  fromAccountId,
  toAccountNumber,
  amount,
  actor,
  ipAddress
}) => {
  if (amount <= 0) {
    throw createError(400, 'Amount must be greater than zero');
  }

  if (!actor) {
    throw createError(401, 'Authentication required');
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Get the from account (by ID) and to account (by account number)
    const [fromRows] = await connection.execute(
      'SELECT id, user_id, balance, status, account_number FROM accounts WHERE id = ? FOR UPDATE',
      [fromAccountId]
    );

    if (fromRows.length === 0) {
      throw createError(404, 'Source account not found');
    }

    const [toRows] = await connection.execute(
      'SELECT id, user_id, balance, status, account_number FROM accounts WHERE account_number = ? FOR UPDATE',
      [toAccountNumber]
    );

    if (toRows.length === 0) {
      throw createError(404, 'Destination account not found');
    }

    const fromAccount = fromRows[0];
    const toAccount = toRows[0];

    if (fromAccount.id === toAccount.id) {
      throw createError(400, 'Cannot transfer to the same account');
    }

    if (!fromAccount || !toAccount) {
      throw createError(404, 'Account not found');
    }

    if (actor.role === 'Customer' && fromAccount.user_id !== actor.id) {
      throw createError(403, 'Forbidden');
    }

    if (fromAccount.status !== 'active' || toAccount.status !== 'active') {
      throw createError(409, 'Account not active');
    }

    if (Number(fromAccount.balance) < Number(amount)) {
      throw createError(409, 'Insufficient balance');
    }

    const newFromBalance = Number(fromAccount.balance) - Number(amount);
    const newToBalance = Number(toAccount.balance) + Number(amount);

    await connection.execute(
      'UPDATE accounts SET balance = ? WHERE id = ? LIMIT 1',
      [newFromBalance, fromAccountId]
    );

    await connection.execute(
      'UPDATE accounts SET balance = ? WHERE id = ? LIMIT 1',
      [newToBalance, toAccount.id]
    );

    const reference = generateReference('TRF');
    const debitReference = `${reference}-D`;
    const creditReference = `${reference}-C`;

    await connection.execute(
      'INSERT INTO transactions (account_id, type, amount, reference_number, description, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [fromAccount.id, 'debit', amount, debitReference, 'Transfer debit']
    );

    await connection.execute(
      'INSERT INTO transactions (account_id, type, amount, reference_number, description, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [toAccount.id, 'credit', amount, creditReference, 'Transfer credit']
    );

    const [transferResult] = await connection.execute(
      'INSERT INTO transfers (from_account_id, to_account_id, amount, status, created_at) VALUES (?, ?, ?, ?, NOW())',
      [fromAccountId, toAccount.id, amount, 'completed']
    );

    if (fromAccount.user_id === toAccount.user_id) {
      await createNotification({
        userId: fromAccount.user_id,
        title: 'Transfer completed',
        message: `Transfer of ${amount} between your accounts completed. Ref: ${reference}.`,
        connection
      });
    } else {
      await createNotification({
        userId: fromAccount.user_id,
        title: 'Transfer sent',
        message: `Transfer of ${amount} sent. Ref: ${reference}.`,
        connection
      });

      await createNotification({
        userId: toAccount.user_id,
        title: 'Transfer received',
        message: `Transfer of ${amount} received. Ref: ${reference}.`,
        connection
      });
    }

    await recordAudit({
      userId: actor.id,
      action: 'TRANSFER',
      tableName: 'transfers',
      recordId: transferResult.insertId,
      ipAddress,
      connection
    });

    await connection.commit();

    return {
      id: transferResult.insertId,
      from_account_id: fromAccountId,
      to_account_id: toAccount.id,
      amount,
      status: 'completed',
      reference
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

module.exports = {
  createTransfer
};
