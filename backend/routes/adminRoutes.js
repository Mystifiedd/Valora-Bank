const express = require('express');
const { body, query, param } = require('express-validator');
const adminController = require('../controllers/adminController');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

router.use(roleMiddleware('Admin'));

router.get(
  '/users',
  [
    query('role').optional().isIn(['Admin', 'Employee', 'Customer']),
    query('is_active').optional().isIn(['true', 'false', '1', '0']),
    query('branch_id').optional().isInt({ min: 1 }),
    query('page').optional().isInt({ min: 1 }),
    query('page_size').optional().isInt({ min: 1, max: 100 })
  ],
  validateRequest,
  adminController.listUsers
);

router.patch(
  '/users/:id/status',
  [param('id').isInt({ min: 1 }), body('is_active').isIn(['true', 'false', true, false, '1', '0'])],
  validateRequest,
  adminController.updateUserStatus
);

router.get(
  '/accounts',
  [
    query('user_id').optional().isInt({ min: 1 }),
    query('branch_id').optional().isInt({ min: 1 }),
    query('status').optional().isIn(['active', 'frozen', 'closed']),
    query('account_type').optional().isIn(['savings', 'current', 'fixed']),
    query('page').optional().isInt({ min: 1 }),
    query('page_size').optional().isInt({ min: 1, max: 100 })
  ],
  validateRequest,
  adminController.listAccounts
);

router.get(
  '/branches/report',
  [
    query('start_date').optional().isISO8601(),
    query('end_date').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }),
    query('page_size').optional().isInt({ min: 1, max: 100 })
  ],
  validateRequest,
  adminController.branchReport
);

router.get(
  '/audit-logs',
  [
    query('user_id').optional().isInt({ min: 0 }),
    query('action').optional().isLength({ max: 120 }),
    query('table_name').optional().isLength({ max: 120 }),
    query('start_date').optional().isISO8601(),
    query('end_date').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }),
    query('page_size').optional().isInt({ min: 1, max: 100 })
  ],
  validateRequest,
  adminController.listAuditLogs
);

router.get(
  '/employees',
  [
    query('is_active').optional().isIn(['true', 'false', '1', '0']),
    query('branch_id').optional().isInt({ min: 1 }),
    query('page').optional().isInt({ min: 1 }),
    query('page_size').optional().isInt({ min: 1, max: 100 })
  ],
  validateRequest,
  adminController.listEmployees
);

router.post(
  '/employees',
  [
    body('first_name').trim().notEmpty().isLength({ max: 80 }),
    body('last_name').trim().notEmpty().isLength({ max: 80 }),
    body('email').trim().isEmail().normalizeEmail(),
    body('phone').trim().notEmpty().isLength({ max: 30 }),
    body('password').isLength({ min: 8 }),
    body('branch_id').optional({ nullable: true }).isInt({ min: 1 })
  ],
  validateRequest,
  adminController.addEmployee
);

router.patch(
  '/employees/:id',
  [
    param('id').isInt({ min: 1 }),
    body('is_active').optional().isIn(['true', 'false', true, false, '1', '0']),
    body('branch_id').optional().isInt({ min: 1 })
  ],
  validateRequest,
  adminController.updateEmployee
);

router.delete(
  '/employees/:id',
  [param('id').isInt({ min: 1 })],
  validateRequest,
  adminController.removeEmployee
);

router.patch(
  '/employees/:id/role',
  [
    param('id').isInt({ min: 1 }),
    body('role_id').isInt({ min: 1 })
  ],
  validateRequest,
  adminController.updateEmployeeRole
);

router.patch(
  '/loans/:id/decision',
  [param('id').isInt({ min: 1 }), body('status').isIn(['approved', 'rejected'])],
  validateRequest,
  adminController.approveLoan
);

router.get(
  '/stats',
  [query('month').optional().matches(/^\d{4}-\d{2}$/)],
  validateRequest,
  adminController.getStats
);

module.exports = router;
