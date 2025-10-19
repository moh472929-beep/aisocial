const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('../../src/db/init');
const { errorHandler, notFoundHandler, logger } = require('../../src/middleware/errorHandler');
const requestLogger = require('../../src/middleware/requestLogger');
const config = require('../../config');

// Import routes
const auth = require('../../src/api/auth');
const users = require('../../src/api/users');
const facebook = require('../../src/api/facebook-automation');
const ai = require('../../src/api/ai');
const analytics = require('../../src/api/analytics');
const autoResponse = require('../../src/api/autoResponseController');
const competitor = require('../../src/api/competitorController');
const trendingTopics = require('../../src/api/trendingTopicsController');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.render.com"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
});
app.use(limiter);

// Initialize database
(async () => {
  try {
    await connectDB();
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    process.exit(1);
  }
})();

// Request logging
app.use(requestLogger);

// CORS configuration
app.use(cors(config.corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/.netlify/functions/api/auth', auth);
app.use('/.netlify/functions/api/users', users);
app.use('/.netlify/functions/api/facebook', facebook);
app.use('/.netlify/functions/api/ai', ai);
app.use('/.netlify/functions/api/analytics', analytics);
app.use('/.netlify/functions/api/autoresponse', autoResponse);
app.use('/.netlify/functions/api/competitor', competitor);
app.use('/.netlify/functions/api/trending', trendingTopics);

// Health check
app.get('/.netlify/functions/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Facebook AI Manager API',
  });
});

// 404 handler
app.use(notFoundHandler);

// Enhanced error handling middleware
const ApiError = require('../../src/utils/ApiError');

app.use((err, req, res, next) => {
  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.userId,
    body: req.body,
  });

  // Handle ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      errorAr: err.messageAr,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errorAr: 'فشل التحقق من البيانات',
      details: Object.values(err.errors).map(e => e.message),
      timestamp: new Date().toISOString(),
    });
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: 'Duplicate entry',
      errorAr: 'إدخال مكرر',
      timestamp: new Date().toISOString(),
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      errorAr: 'رمز غير صالح',
      timestamp: new Date().toISOString(),
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired',
      errorAr: 'انتهت صلاحية الرمز',
      timestamp: new Date().toISOString(),
    });
  }

  // Handle CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format',
      errorAr: 'تنسيق معرف غير صالح',
      timestamp: new Date().toISOString(),
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message;

  res.status(statusCode).json({
    success: false,
    error: message,
    errorAr: 'حدث خطأ ما',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err,
    }),
  });
});

// Export the handler
module.exports.handler = serverless(app);
