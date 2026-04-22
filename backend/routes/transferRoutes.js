const express = require('express');
const { body } = require('express-validator');
const transferController = require('../controllers/transferController');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

router.post(
  '/',
  [
    body('from_account_id').notEmpty().isInt({ min: 1 }),
    body('to_account_number').notEmpty().isString().trim().isLength({ min: 10, max: 20 }),
    body('amount').notEmpty().isFloat({ gt: 0 })
  ],
  validateRequest,
  transferController.createTransfer
);

module.exports = router;
