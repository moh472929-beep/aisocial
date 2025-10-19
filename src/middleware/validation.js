const { body, validationResult, oneOf } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
    });
  }
  next();
};

// Signup validation
const validateSignup = [
  body('fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters'),
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters')
    .matches(/^[a-zA-Z0-9._]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and dots')
    .customSanitizer(v => (typeof v === 'string' ? v.toLowerCase() : v)),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
];

// Login validation: accept email OR username OR identifier
const validateLogin = [
  oneOf([
    body('email').isEmail().normalizeEmail(),
    body('username').isLength({ min: 3 }).matches(/^[a-zA-Z0-9._]+$/),
    body('identifier').isLength({ min: 3 }),
  ], 'Valid email or username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

module.exports = {
  validateSignup,
  validateLogin,
};
