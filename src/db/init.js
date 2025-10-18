// src/db/init.js
const mongoose = require('mongoose');
const { initializeModels } = require('./models');
const logger = require('../middleware/logger') || console;

let isConnected = false;

async function connectDB() {
  if (isConnected) return mongoose.connection;

  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    logger.error('❌ MongoDB URI is not defined.');
    throw new Error('MongoDB URI missing in environment variables.');
  }

  try {
    logger.info('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    logger.info('✅ MongoDB connected successfully.');

    await initializeModels();
    logger.info('✅ Models initialized successfully.');

    return mongoose.connection;
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

module.exports = connectDB;
