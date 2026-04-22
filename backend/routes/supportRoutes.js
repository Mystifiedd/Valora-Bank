const express = require('express');
const { body, query, param } = require('express-validator');
const supportController = require('../controllers/supportController');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

router.post(
  '/',
  [
    body('user_id').optional().isInt({ min: 1 }),
    body('subject').trim().notEmpty().isLength({ max: 160 }),
    body('description').trim().notEmpty()
  ],
  validateRequest,
  supportController.createTicket
);

router.patch(
  '/:id/assign',
  roleMiddleware('Admin', 'Employee'),
  [param('id').isInt({ min: 1 }), body('assigned_employee_id').isInt({ min: 1 })],
  validateRequest,
  supportController.assignTicket
);

router.patch(
  '/:id/status',
  [
    param('id').isInt({ min: 1 }),
    body('status').isIn(['open', 'in_progress', 'resolved', 'closed'])
  ],
  validateRequest,
  supportController.updateStatus
);

router.get(
  '/',
  [
    query('user_id').optional().isInt({ min: 1 }),
    query('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']),
    query('page').optional().isInt({ min: 1 }),
    query('page_size').optional().isInt({ min: 1, max: 100 })
  ],
  validateRequest,
  supportController.listTickets
);

module.exports = router;
