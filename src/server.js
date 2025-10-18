// src/server.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./db/init');
const logger = require('./middleware/logger') || console;

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Connect to MongoDB
(async () => {
  try {
    await connectDB();
    logger.info('✅ Database connected and models initialized');
  } catch (err) {
    logger.error('❌ Database initialization failed:', err);
  }
})();

// Serve static frontend files
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// API routes
app.use('/api', require('./api/index'));

// Fallback route for frontend (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});
