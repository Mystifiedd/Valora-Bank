const express = require('express');
const { body, query, param } = require('express-validator');
const kycController = require('../controllers/kycController');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

router.post(
  '/',
  [
    body('user_id').optional().isInt({ min: 1 }),
    body('document_type').trim().notEmpty().isLength({ max: 60 }),
    body('document_number').trim().notEmpty().isLength({ max: 80 })
  ],
  validateRequest,
  kycController.submitKyc
);

router.patch(
  '/:id/verify',
  roleMiddleware('Employee', 'Admin'),
  [param('id').isInt({ min: 1 }), body('status').isIn(['verified', 'rejected'])],
  validateRequest,
  kycController.verifyKyc
);

router.get(
  '/',
  [
    query('user_id').optional().isInt({ min: 1 }),
    query('status').optional().isIn(['pending', 'verified', 'rejected']),
    query('page').optional().isInt({ min: 1 }),
    query('page_size').optional().isInt({ min: 1, max: 100 })
  ],
  validateRequest,
  kycController.listKyc
);

module.exports = router;
