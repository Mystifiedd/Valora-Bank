const express = require('express');
const { body, query } = require('express-validator');
const transactionController = require('../controllers/transactionController');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

// Only Admin or Employee can perform deposit/withdraw (not customers directly)
router.post(
  '/deposit',
  roleMiddleware('Admin', 'Employee'),
  [
    body('account_id').notEmpty().isInt({ min: 1 }),
    body('amount').notEmpty().isFloat({ gt: 0 })
  ],
  validateRequest,
  transactionController.deposit
);

router.post(
  '/withdraw',
  roleMiddleware('Admin', 'Employee'),
  [
    body('account_id').notEmpty().isInt({ min: 1 }),
    body('amount').notEmpty().isFloat({ gt: 0 })
  ],
  validateRequest,
  transactionController.withdraw
);

router.get(
  '/',
  [
    query('account_id').notEmpty().isInt({ min: 1 }),
    query('type').optional().isIn(['credit', 'debit']),
    query('start_date').optional().isISO8601(),
    query('end_date').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }),
    query('page_size').optional().isInt({ min: 1, max: 100 })
  ],
  validateRequest,
  transactionController.listTransactions
);

module.exports = router;
