// src/db/connection.js
const mongoose = require('mongoose');
const logger = require('../middleware/logger') || console;

mongoose.connection.on('connected', () => {
  logger.info('✅ Mongoose connected to database');
});

mongoose.connection.on('error', (err) => {
  logger.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️ Mongoose disconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('Mongoose connection closed on app termination');
  process.exit(0);
});

module.exports = mongoose;
