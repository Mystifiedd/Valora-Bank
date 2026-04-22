const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const config = require('../config');
const createError = require('../utils/createError');

const SALT_ROUNDS = 12;
const ALLOWED_ROLES = ['Customer', 'Employee'];

const getRoleIdByName = async (roleName) => {
  const [roleRows] = await pool.execute(
    'SELECT id FROM roles WHERE name = ? LIMIT 1',
    [roleName]
  );

  if (roleRows.length === 0) {
    throw createError(500, `${roleName} role not configured`);
  }

  return roleRows[0].id;
};

const registerUser = async ({
  first_name,
  last_name,
  email,
  phone,
  password,
  roleName,
  actor
}) => {
  const resolvedRole = roleName || 'Customer';

  if (!ALLOWED_ROLES.includes(resolvedRole)) {
    throw createError(400, 'Invalid role');
  }

  if (resolvedRole === 'Employee') {
    if (!actor || actor.role !== 'Admin') {
      throw createError(403, 'Only Admin can create Employee');
    }
  }

  const [existing] = await pool.execute(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  if (existing.length > 0) {
    throw createError(409, 'Email already registered');
  }

  const roleId = await getRoleIdByName(resolvedRole);
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [result] = await pool.execute(
    'INSERT INTO users (first_name, last_name, email, phone, password_hash, role_id, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())',
    [first_name, last_name, email, phone, passwordHash, roleId]
  );

  return {
    id: result.insertId,
    first_name,
    last_name,
    email,
    phone,
    role: resolvedRole
  };
};

const loginUser = async ({ email, password, ipAddress }) => {
  const [rows] = await pool.execute(
    'SELECT users.id, users.first_name, users.last_name, users.email, users.password_hash, users.branch_id, roles.name AS role FROM users JOIN roles ON users.role_id = roles.id WHERE users.email = ? AND users.is_active = 1 LIMIT 1',
    [email]
  );

  if (rows.length === 0) {
    throw createError(401, 'Invalid credentials');
  }

  const user = rows[0];
  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    throw createError(401, 'Invalid credentials');
  }

  const token = jwt.sign(
    { sub: user.id, role: user.role, branch_id: user.branch_id },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  await pool.execute(
    'INSERT INTO audit_logs (user_id, action, table_name, record_id, ip_address, timestamp) VALUES (?, ?, ?, ?, ?, NOW())',
    [user.id, 'LOGIN', 'users', user.id, ipAddress || 'unknown']
  );

  return {
    token,
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      branch_id: user.branch_id
    }
  };
};

const getUserById = async (userId) => {
  /* ── base user + branch name ── */
  const [rows] = await pool.execute(
    `SELECT u.id, u.first_name, u.last_name, u.email, u.phone,
            u.branch_id, u.created_at, u.transaction_pin,
            r.name  AS role,
            b.name  AS branch_name,
            b.IFSC_code AS branch_SWIFT
     FROM users u
     JOIN roles    r ON u.role_id   = r.id
     LEFT JOIN branches b ON u.branch_id = b.id
     WHERE u.id = ? AND u.is_active = 1
     LIMIT 1`,
    [userId]
  );

  if (rows.length === 0) {
    throw createError(404, 'User not found');
  }

  const user = rows[0];

  /* ── accounts (relevant for Customer; empty for other roles) ── */
  const [accountRows] = await pool.execute(
    `SELECT id, account_number, account_type, balance, status, created_at
     FROM accounts
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );

  /* ── KYC records ── */
  const [kycRows] = await pool.execute(
    `SELECT id, document_type, document_number, status, submitted_at
     FROM kyc
     WHERE user_id = ?
     ORDER BY submitted_at DESC`,
    [userId]
  );

  return {
    ...user,
    has_transaction_pin: !!user.transaction_pin,
    accounts: accountRows,
    kyc: kycRows
  };
};

/* ── Change password ── */
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const [rows] = await pool.execute(
    'SELECT password_hash FROM users WHERE id = ? AND is_active = 1 LIMIT 1',
    [userId]
  );
  if (rows.length === 0) throw createError(404, 'User not found');

  const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!valid) throw createError(400, 'Current password is incorrect');

  const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await pool.execute(
    'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
    [hash, userId]
  );
  return { message: 'Password updated successfully' };
};

/* ── Set / Change transaction PIN ── */
const setTransactionPin = async (userId, { currentPin, newPin }) => {
  const [rows] = await pool.execute(
    'SELECT transaction_pin FROM users WHERE id = ? AND is_active = 1 LIMIT 1',
    [userId]
  );
  if (rows.length === 0) throw createError(404, 'User not found');

  const existing = rows[0].transaction_pin;

  if (existing) {
    if (!currentPin) throw createError(400, 'Current PIN is required');
    const pinValid = await bcrypt.compare(currentPin, existing);
    if (!pinValid) throw createError(400, 'Current PIN is incorrect');
  }

  const pinHash = await bcrypt.hash(newPin, SALT_ROUNDS);
  await pool.execute(
    'UPDATE users SET transaction_pin = ?, updated_at = NOW() WHERE id = ?',
    [pinHash, userId]
  );
  return { message: existing ? 'Transaction PIN updated' : 'Transaction PIN set successfully' };
};

/* ── Update personal information ── */
const updateProfile = async (userId, { first_name, last_name, phone, email, branch_id }) => {
  const fields = [];
  const values = [];

  if (first_name !== undefined) { fields.push('first_name = ?'); values.push(first_name); }
  if (last_name !== undefined)  { fields.push('last_name = ?');  values.push(last_name);  }
  if (phone !== undefined)      { fields.push('phone = ?');      values.push(phone);      }
  if (email !== undefined)      { fields.push('email = ?');      values.push(email);      }

  /* validate & set branch */
  if (branch_id !== undefined) {
    const [branchRows] = await pool.execute(
      'SELECT id FROM branches WHERE id = ? AND is_active = 1 LIMIT 1',
      [branch_id]
    );
    if (branchRows.length === 0) throw createError(404, 'Branch not found');
    fields.push('branch_id = ?');
    values.push(branch_id);
  }

  if (fields.length === 0) throw createError(400, 'No fields to update');

  /* check email uniqueness if changing */
  if (email !== undefined) {
    const [dup] = await pool.execute(
      'SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1',
      [email, userId]
    );
    if (dup.length > 0) throw createError(409, 'Email already in use');
  }

  /* check phone uniqueness if changing */
  if (phone !== undefined) {
    const [dup] = await pool.execute(
      'SELECT id FROM users WHERE phone = ? AND id != ? LIMIT 1',
      [phone, userId]
    );
    if (dup.length > 0) throw createError(409, 'Phone number already in use');
  }

  fields.push('updated_at = NOW()');
  values.push(userId);

  await pool.execute(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  return getUserById(userId);
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  changePassword,
  setTransactionPin,
  updateProfile
};
