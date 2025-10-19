const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const dbInit = require('../db/init');
const { validateSignup, validateLogin } = require('../middleware/validation');
const { logger } = require('../middleware/errorHandler');
const { generateToken } = require('../middleware/auth');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../utils/constants');

const router = express.Router();

// Brute-force protection for login using rate-limiter-flexible
const loginLimiter = new RateLimiterMemory({
  points: 10, // 10 tries
  duration: 60 * 15, // per 15 minutes
});

// Signup endpoint with validation
router.post(['/signup', '/register'], validateSignup, async (req, res, next) => {
  try {
    const { fullName, username, email, password } = req.body;

    // Get user model
    const userModel = dbInit.getModel('User');

    // Check if user already exists
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      throw ApiError.conflict(ERROR_MESSAGES.USER_EXISTS.en, ERROR_MESSAGES.USER_EXISTS.ar);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const emailVerificationToken = crypto.randomBytes(24).toString('hex');
    const userData = {
      fullName,
      username,
      email,
      passwordHash: hashedPassword,
      role: 'user',
      isEmailVerified: false,
      aiEnabled: false,
      emailVerificationToken,
    };

    const user = await userModel.create(userData);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Generate JWT token
    const token = generateToken({ userId: user.id, email: user.email, role: user.role }, '15m');

    logger.info('User signed up successfully', { userId: user.id, email: user.email });

    ApiResponse.created(
      res,
      {
        user: userWithoutPassword,
        token,
      },
      SUCCESS_MESSAGES.SIGNUP_SUCCESS.ar
    );
  } catch (error) {
    logger.error('Signup error:', error);
    
    // Handle specific error types
    if (error.code === 11000) {
      // MongoDB duplicate key error
      return res.status(409).json({
        success: false,
        error: 'User with this email or username already exists',
        errorAr: 'مستخدم بهذا البريد الإلكتروني أو اسم المستخدم موجود بالفعل'
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errorAr: 'فشل التحقق من البيانات',
        details: error.message
      });
    }
    
    // For other errors, use the error handler
    next(error);
  }
});

// Login endpoint with validation
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    // apply brute-force protection
    await loginLimiter.consume(req.ip);
    const { email, password } = req.body;

    // Get user model
    const userModel = dbInit.getModel('User');

    // Find user
    const user = await userModel.findByEmail(email);
    if (!user) {
      throw ApiError.unauthorized(
        ERROR_MESSAGES.INVALID_CREDENTIALS.en,
        ERROR_MESSAGES.INVALID_CREDENTIALS.ar
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash || user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized(
        ERROR_MESSAGES.INVALID_CREDENTIALS.en,
        ERROR_MESSAGES.INVALID_CREDENTIALS.ar
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Generate JWT token
    const accessToken = generateToken(
      { userId: user.id, email: user.email, role: user.role },
      '15m'
    );
    const refreshToken = generateToken(
      { userId: user.id, email: user.email, role: user.role, type: 'refresh' },
      '7d'
    );

    // store hashed refresh token
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await userModel.addRefreshToken(user.id, tokenHash, expiresAt);

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

    ApiResponse.success(
      res,
      {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
      SUCCESS_MESSAGES.LOGIN_SUCCESS.ar
    );
  } catch (error) {
    if (error instanceof Error && error.msBeforeNext) {
      return res.status(429).json({ success: false, error: 'Too many login attempts' });
    }
    logger.error('Login error:', error);
    next(error);
  }
});

// Register alias handled by unified route above

// Email verification endpoint
router.get('/verify', async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      return ApiResponse.badRequest(res, 'Verification token is required');
    }
    const userModel = dbInit.getModel('User');
    const user = await userModel.findByEmailVerificationToken(token);
    if (!user) {
      return ApiResponse.notFound(res, null, 'Invalid verification token');
    }
    await userModel.markEmailVerified(user.id);
    return ApiResponse.success(res, { verified: true }, 'Email verified successfully');
  } catch (error) {
    next(error);
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return ApiResponse.badRequest(res, 'Refresh token required');
    const payload = require('../middleware/auth').verifyToken(refreshToken);
    if (payload.type !== 'refresh') {
      return ApiResponse.badRequest(res, 'Invalid refresh token');
    }
    const userModel = dbInit.getModel('User');
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const user = await userModel.findById(payload.userId);
    const hasToken = (user.refreshTokens || []).some(rt => rt.tokenHash === tokenHash);
    if (!hasToken) {
      return ApiResponse.unauthorized(res, null, 'Refresh token revoked');
    }
    const accessToken = generateToken(
      { userId: payload.userId, email: payload.email, role: payload.role },
      '15m'
    );
    return ApiResponse.success(res, { accessToken }, 'Token refreshed');
  } catch (error) {
    next(error);
  }
});

// Logout endpoint (revoke refresh token)
router.post('/logout', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return ApiResponse.badRequest(res, 'Refresh token required');
    const payload = require('../middleware/auth').verifyToken(refreshToken);
    const userModel = dbInit.getModel('User');
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await userModel.removeRefreshToken(payload.userId, tokenHash);
    return ApiResponse.success(res, { success: true }, 'Logged out');
  } catch (error) {
    next(error);
  }
});

// Get user profile
const { authenticateToken } = require('../middleware/auth');

router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    // Get user model
    const userModel = dbInit.getModel('User');

    // Find user
    const user = await userModel.findById(req.user.userId);
    if (!user) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND.en, ERROR_MESSAGES.USER_NOT_FOUND.ar);
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    ApiResponse.success(res, { user: userWithoutPassword }, 'Profile fetched successfully');
  } catch (error) {
    logger.error('Get profile error:', error);
    next(error);
  }
});

module.exports = router;
