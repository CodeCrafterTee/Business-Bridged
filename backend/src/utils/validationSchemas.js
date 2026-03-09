const { body } = require('express-validator');

const registerValidation = [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(['entrepreneur', 'mentor', 'funder'])
    .withMessage('Invalid role'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number')
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const entrepreneurProfileValidation = [
  body('businessName').notEmpty().withMessage('Business name is required'),
  body('industry').notEmpty().withMessage('Industry is required'),
  body('cicpNumber').notEmpty().withMessage('CICP number is required'),
  body('fixedCost').optional().isNumeric().withMessage('Fixed cost must be a number'),
  body('variableMonthlyCost').optional().isNumeric().withMessage('Variable cost must be a number')
];

module.exports = {
  registerValidation,
  loginValidation,
  entrepreneurProfileValidation
};
