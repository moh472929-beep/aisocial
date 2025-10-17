require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const connectDB = require('./db/init');
const { errorHandler, notFoundHandler, logger } = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const config = require('../config');

// Import routes
const auth = require('./api/auth');
const users = require('./api/users');
const facebook = require('./api/facebook-automation');
const ai = require('./api/ai');
const analytics = require('./api/analytics');
const autoResponse = require('./api/autoResponseController');
const competitor = require('./api/competitorController');
const trendingTopics = require('./api/trendingTopicsController');

const app = express();

// Security middleware
app.use(helmet());

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

// Per-user limiter for AI endpoints (60 req/hour)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.userId || req.ip,
  message: { success: false, error: 'AI rate limit exceeded (60/hour)' },
});

// Request logging
app.use(requestLogger);

// CORS configuration
app.use(cors(config.corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve frontend static files
const buildDir = path.resolve(__dirname, '../build');
if (fs.existsSync(buildDir)) {
  app.use(express.static(buildDir));
}
app.use(express.static('public'));

// Health check root
app.get('/', (req, res) => {
  res.json({ status: 'Server is running successfully' });
});

// API bases
const apiBase = '/api';
const netlifyBase = '/.netlify/functions/api';

// API routes under /api
app.use(`${apiBase}/auth`, auth);
app.use(`${apiBase}/users`, users);
app.use(`${apiBase}/facebook`, facebook);
app.use(`${apiBase}/ai`, aiLimiter, ai);
app.use(`${apiBase}/analytics`, analytics);
app.use(`${apiBase}/autoresponse`, autoResponse);
app.use(`${apiBase}/competitor`, competitor);
app.use(`${apiBase}/trending`, trendingTopics);

// Backward compatibility: Netlify-style paths
app.use(`${netlifyBase}/auth`, auth);
app.use(`${netlifyBase}/users`, users);
app.use(`${netlifyBase}/facebook`, facebook);
app.use(`${netlifyBase}/ai`, aiLimiter, ai);
app.use(`${netlifyBase}/analytics`, analytics);
app.use(`${netlifyBase}/autoresponse`, autoResponse);
app.use(`${netlifyBase}/competitor`, competitor);
app.use(`${netlifyBase}/trending`, trendingTopics);

// Serve SPA index.html for non-API routes when a build exists
if (fs.existsSync(buildDir)) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/.netlify/functions/api')) {
      return next();
    }
    res.sendFile(path.join(buildDir, 'index.html'));
  });
}

// Health endpoint under /api
app.get(`${apiBase}/health`, (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Facebook AI Manager API',
  });
});

// 404 handler
app.use(notFoundHandler);

// Centralized error handling
app.use(errorHandler);

// Start the server immediately to serve static assets.
app.listen(process.env.PORT || 10000, () => console.log('Server running'));

// Initialize database asynchronously; do not block server startup
connectDB()
  .then(() => {
    logger.info('Database initialized successfully');
  })
  .catch((error) => {
    logger.error('Failed to initialize database:', error);
    logger.warn('Running without DB (static preview mode)');
  });

module.exports = app;