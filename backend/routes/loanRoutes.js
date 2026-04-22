const express = require('express');
const { body, query, param } = require('express-validator');
const loanController = require('../controllers/loanController');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

router.post(
  '/apply',
  [
    body('user_id').optional().isInt({ min: 1 }),
    body('loan_type').trim().notEmpty().isLength({ max: 60 }),
    body('principal_amount').notEmpty().isFloat({ gt: 0 }),
    body('interest_rate').optional().isFloat({ gt: 0 }),
    body('tenure_months').notEmpty().isInt({ min: 1 })
  ],
  validateRequest,
  loanController.applyLoan
);

router.patch(
  '/:id/decision',
  roleMiddleware('Admin', 'Employee'),
  [param('id').isInt({ min: 1 }), body('status').isIn(['approved', 'rejected'])],
  validateRequest,
  loanController.decideLoan
);

router.post(
  '/:id/payments',
  [
    param('id').isInt({ min: 1 }),
    body('amount_paid').notEmpty().isFloat({ gt: 0 }),
    body('payment_date').optional().isISO8601()
  ],
  validateRequest,
  loanController.recordPayment
);

router.get(
  '/',
  [
    query('user_id').optional().isInt({ min: 1 }),
    query('status').optional().isIn(['pending', 'approved', 'rejected', 'closed']),
    query('page').optional().isInt({ min: 1 }),
    query('page_size').optional().isInt({ min: 1, max: 100 })
  ],
  validateRequest,
  loanController.listLoans
);

module.exports = router;
