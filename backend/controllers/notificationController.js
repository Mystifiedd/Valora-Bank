const asyncHandler = require('../utils/asyncHandler');
const notificationService = require('../services/notificationService');

const listNotifications = asyncHandler(async (req, res) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const pageSize = req.query.page_size ? Number(req.query.page_size) : 20;

  const payload = await notificationService.listNotifications({
    userId: req.user.id,
    page,
    pageSize
  });

  return res.json(payload);
});

const markRead = asyncHandler(async (req, res) => {
  const payload = await notificationService.markRead({
    notificationId: Number(req.params.id),
    actor: req.user
  });

  return res.json(payload);
});

module.exports = {
  listNotifications,
  markRead
};
