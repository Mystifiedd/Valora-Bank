const express = require('express');
const { query, param } = require('express-validator');
const notificationController = require('../controllers/notificationController');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('page_size').optional().isInt({ min: 1, max: 100 })
  ],
  validateRequest,
  notificationController.listNotifications
);

router.patch(
  '/:id/read',
  [param('id').isInt({ min: 1 })],
  validateRequest,
  notificationController.markRead
);

module.exports = router;
