const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation middleware wrapper
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errorAr: 'فشل التحقق من البيانات',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }

  next();
};

/**
 * Common validation rules
 */
const validators = {
  // User validators
  signup: [
    body('fullName')
      .trim()
      .notEmpty()
      .withMessage('Full name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters')
      .matches(/^[a-zA-Z\u0600-\u06FF\s]+$/)
      .withMessage('Full name can only contain letters and spaces'),

    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required')
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9._]+$/)
      .withMessage('Username can only contain letters, numbers, underscores, and dots')
      .toLowerCase(),

    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail()
      .toLowerCase(),

    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),

    validate,
  ],

  login: [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail()
      .toLowerCase(),

    body('password').notEmpty().withMessage('Password is required'),

    validate,
  ],

  // Post validators
  createPost: [
    body('pageId')
      .notEmpty()
      .withMessage('Page ID is required')
      .isString()
      .withMessage('Page ID must be a string'),

    body('category')
      .optional()
      .isIn(['motivational', 'business', 'lifestyle', 'technology', 'health', 'entertainment'])
      .withMessage('Invalid category'),

    body('tone')
      .optional()
      .isIn(['professional', 'friendly', 'casual', 'formal', 'humorous'])
      .withMessage('Invalid tone'),

    body('customPrompt')
      .optional()
      .isString()
      .withMessage('Custom prompt must be a string')
      .isLength({ max: 1000 })
      .withMessage('Custom prompt must not exceed 1000 characters'),

    body('imageUrl').optional().isURL().withMessage('Image URL must be a valid URL'),

    validate,
  ],

  publishPost: [
    body('postId')
      .notEmpty()
      .withMessage('Post ID is required')
      .isString()
      .withMessage('Post ID must be a string'),

    body('pageId')
      .notEmpty()
      .withMessage('Page ID is required')
      .isString()
      .withMessage('Page ID must be a string'),

    validate,
  ],

  schedulePost: [
    body('postId')
      .notEmpty()
      .withMessage('Post ID is required')
      .isString()
      .withMessage('Post ID must be a string'),

    body('pageId')
      .notEmpty()
      .withMessage('Page ID is required')
      .isString()
      .withMessage('Page ID must be a string'),

    body('scheduledTime')
      .notEmpty()
      .withMessage('Scheduled time is required')
      .isISO8601()
      .withMessage('Scheduled time must be a valid ISO 8601 date')
      .custom(value => {
        const scheduledDate = new Date(value);
        const now = new Date();
        if (scheduledDate <= now) {
          throw new Error('Scheduled time must be in the future');
        }
        return true;
      }),

    validate,
  ],

  // AI validators
  aiChat: [
    body('message')
      .notEmpty()
      .withMessage('Message is required')
      .isString()
      .withMessage('Message must be a string')
      .isLength({ min: 1, max: 2000 })
      .withMessage('Message must be between 1 and 2000 characters'),

    body('context').optional().isArray().withMessage('Context must be an array'),

    validate,
  ],

  generateImage: [
    body('prompt')
      .notEmpty()
      .withMessage('Prompt is required')
      .isString()
      .withMessage('Prompt must be a string')
      .isLength({ min: 3, max: 1000 })
      .withMessage('Prompt must be between 3 and 1000 characters'),

    body('size')
      .optional()
      .isIn(['256x256', '512x512', '1024x1024'])
      .withMessage('Size must be one of: 256x256, 512x512, 1024x1024'),

    validate,
  ],

  // Analytics validators
  fetchAnalytics: [
    body('period')
      .optional()
      .isIn(['daily', 'weekly', 'monthly', 'yearly'])
      .withMessage('Period must be one of: daily, weekly, monthly, yearly'),

    validate,
  ],

  // ID validators
  mongoId: [
    param('id')
      .notEmpty()
      .withMessage('ID is required')
      .isMongoId()
      .withMessage('Invalid ID format'),

    validate,
  ],

  pageId: [
    param('pageId')
      .notEmpty()
      .withMessage('Page ID is required')
      .isString()
      .withMessage('Page ID must be a string'),

    validate,
  ],

  // Query validators
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer')
      .toInt(),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
      .toInt(),

    validate,
  ],
};

module.exports = validators;
