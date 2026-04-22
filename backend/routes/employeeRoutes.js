const express = require('express');
const { body, query, param } = require('express-validator');
const employeeController = require('../controllers/employeeController');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

router.use(roleMiddleware('Employee', 'Admin'));

router.get('/dashboard-stats', employeeController.dashboardStats);

router.get(
  '/branch-users',
  [
    query('branch_id').optional().isInt({ min: 1 }),
    query('role').optional().isIn(['Customer', 'Employee']),
    query('is_active').optional().isIn(['true', 'false', '1', '0']),
    query('page').optional().isInt({ min: 1 }),
    query('page_size').optional().isInt({ min: 1, max: 100 })
  ],
  validateRequest,
  employeeController.listBranchUsers
);

router.patch(
  '/kyc/:id/verify',
  [param('id').isInt({ min: 1 }), body('status').isIn(['verified', 'rejected'])],
  validateRequest,
  employeeController.verifyKyc
);

router.get(
  '/tickets',
  [
    query('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']),
    query('include_unassigned').optional().isIn(['true', 'false', '1', '0']),
    query('page').optional().isInt({ min: 1 }),
    query('page_size').optional().isInt({ min: 1, max: 100 })
  ],
  validateRequest,
  employeeController.listTickets
);

router.patch(
  '/tickets/:id/assign-self',
  [param('id').isInt({ min: 1 })],
  validateRequest,
  employeeController.assignTicketToSelf
);

router.patch(
  '/tickets/:id/status',
  [
    param('id').isInt({ min: 1 }),
    body('status').isIn(['open', 'in_progress', 'resolved', 'closed'])
  ],
  validateRequest,
  employeeController.updateTicketStatus
);

// Loan management for employees
router.get(
  '/loans',
  [
    query('user_id').optional().isInt({ min: 1 }),
    query('status').optional().isIn(['pending', 'approved', 'rejected', 'closed']),
    query('page').optional().isInt({ min: 1 }),
    query('page_size').optional().isInt({ min: 1, max: 100 })
  ],
  validateRequest,
  employeeController.listLoans
);

router.patch(
  '/loans/:id/decision',
  [
    param('id').isInt({ min: 1 }),
    body('status').isIn(['approved', 'rejected'])
  ],
  validateRequest,
  employeeController.decideLoan
);

module.exports = router;
