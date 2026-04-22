const express = require('express');
const { body, query, param } = require('express-validator');
const accountController = require('../controllers/accountController');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

router.post(
  '/',
  roleMiddleware('Admin', 'Employee'),
  [
    body('user_id').notEmpty().isInt({ min: 1 }),
    body('branch_id').notEmpty().isInt({ min: 1 }),
    body('account_type').isIn(['savings', 'current', 'fixed'])
  ],
  validateRequest,
  accountController.createAccount
);

router.get(
  '/',
  [
    query('user_id').optional().isInt({ min: 1 }),
    query('status').optional().isIn(['active', 'frozen', 'closed']),
    query('account_type').optional().isIn(['savings', 'current', 'fixed']),
    query('page').optional().isInt({ min: 1 }),
    query('page_size').optional().isInt({ min: 1, max: 100 })
  ],
  validateRequest,
  accountController.getAccounts
);

router.patch(
  '/:id/freeze',
  roleMiddleware('Admin', 'Employee'),
  [param('id').isInt({ min: 1 })],
  validateRequest,
  accountController.freezeAccount
);

router.patch(
  '/:id/close',
  roleMiddleware('Admin', 'Employee'),
  [param('id').isInt({ min: 1 })],
  validateRequest,
  accountController.closeAccount
);

module.exports = router;
