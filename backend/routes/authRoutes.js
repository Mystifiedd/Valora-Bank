const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

router.post(
  '/register',
  [
    body('first_name').trim().notEmpty().isLength({ max: 80 }),
    body('last_name').trim().notEmpty().isLength({ max: 80 }),
    body('email').trim().isEmail().normalizeEmail(),
    body('phone').trim().notEmpty().isLength({ max: 30 }),
    body('password').isLength({ min: 8 }),
    body('role').optional().isIn(['Customer', 'Employee'])
  ],
  validateRequest,
  optionalAuthMiddleware,
  authController.register
);

router.post(
  '/login',
  [
    body('email').trim().isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  validateRequest,
  authController.login
);

router.get('/me', authMiddleware, authController.me);

router.put(
  '/change-password',
  authMiddleware,
  [
    body('current_password').notEmpty().withMessage('Current password is required'),
    body('new_password').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
  ],
  validateRequest,
  authController.changePassword
);

router.put(
  '/transaction-pin',
  authMiddleware,
  [
    body('current_pin')
      .optional({ nullable: true })
      .isLength({ min: 4, max: 6 })
      .isNumeric()
      .withMessage('PIN must be 4–6 digits'),
    body('new_pin')
      .notEmpty()
      .isLength({ min: 4, max: 6 })
      .isNumeric()
      .withMessage('New PIN must be 4–6 digits')
  ],
  validateRequest,
  authController.setTransactionPin
);

router.put(
  '/profile',
  authMiddleware,
  [
    body('first_name').optional().trim().notEmpty().isLength({ max: 80 }),
    body('last_name').optional().trim().notEmpty().isLength({ max: 80 }),
    body('phone').optional().trim().notEmpty().isLength({ max: 30 }),
    body('email').optional().trim().isEmail().normalizeEmail(),
    body('branch_id').optional().isInt({ min: 1 }).toInt()
  ],
  validateRequest,
  authController.updateProfile
);

module.exports = router;
