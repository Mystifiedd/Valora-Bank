const express = require('express');
const { body, query, param } = require('express-validator');
const controller = require('../controllers/accountRequestController');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

// Any authenticated user can list branches (for the dropdown)
router.get('/branches', controller.listBranches);

// Customer submits a new account request
router.post(
  '/',
  roleMiddleware('Customer'),
  [
    body('branch_id').notEmpty().isInt({ min: 1 }),
    body('account_type').isIn(['savings', 'current', 'fixed'])
  ],
  validateRequest,
  controller.submitRequest
);

// List requests (customer sees own, employee sees branch, admin sees all)
router.get(
  '/',
  [
    query('status').optional().isIn(['pending', 'approved', 'rejected']),
    query('page').optional().isInt({ min: 1 }),
    query('page_size').optional().isInt({ min: 1, max: 100 })
  ],
  validateRequest,
  controller.listRequests
);

// Employee or Admin approves / rejects a request
router.patch(
  '/:id/review',
  roleMiddleware('Admin', 'Employee'),
  [
    param('id').isInt({ min: 1 }),
    body('decision').isIn(['approved', 'rejected'])
  ],
  validateRequest,
  controller.reviewRequest
);

module.exports = router;
