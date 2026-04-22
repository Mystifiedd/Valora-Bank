const pool = require('../config/db');
const createError = require('../utils/createError');
const { normalisePagination, paginatedResponse } = require('../utils/pagination');

const createNotification = async ({
  userId,
  title,
  message,
  isRead = false,
  connection
}) => {
  if (!userId) {
    return null;
  }

  const executor = connection || pool;
  const [result] = await executor.execute(
    'INSERT INTO notifications (user_id, title, message, is_read, created_at) VALUES (?, ?, ?, ?, NOW())',
    [userId, title, message, isRead ? 1 : 0]
  );

  return result.insertId;
};

const listNotifications = async ({ userId, page = 1, pageSize = 20 }) => {
  if (!userId) {
    throw createError(401, 'Authentication required');
  }

  const pg = normalisePagination(page, pageSize);

  const [countRows] = await pool.execute(
    'SELECT COUNT(*) AS total FROM notifications WHERE user_id = ?',
    [userId]
  );

  const [rows] = await pool.execute(
    'SELECT id, user_id, title, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [userId, pg.pageSize, pg.offset]
  );

  return paginatedResponse('notifications', rows, {
    page: pg.page,
    pageSize: pg.pageSize,
    total: countRows[0].total
  });
};

const markRead = async ({ notificationId, actor }) => {
  if (!actor) {
    throw createError(401, 'Authentication required');
  }

  const [rows] = await pool.execute(
    'SELECT id, user_id FROM notifications WHERE id = ? LIMIT 1',
    [notificationId]
  );

  if (rows.length === 0) {
    throw createError(404, 'Notification not found');
  }

  if (rows[0].user_id !== actor.id) {
    throw createError(403, 'Forbidden');
  }

  await pool.execute(
    'UPDATE notifications SET is_read = 1 WHERE id = ? LIMIT 1',
    [notificationId]
  );

  return { id: notificationId, is_read: 1 };
};

module.exports = {
  createNotification,
  listNotifications,
  markRead
};
