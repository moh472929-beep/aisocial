const mongoose = require('mongoose');
const { logger } = require('../middleware/errorHandler');
require('dotenv').config();

let db = null;

const connectDB = async (retries = 5) => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    db = connection.connection.db;
    logger.info('✅ Connected to MongoDB Atlas');
    return db;
  } catch (error) {
    logger.error(`❌ MongoDB connection attempt failed (${retries} retries left):`, error.message);

    if (retries > 0) {
      logger.info('Retrying MongoDB connection in 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      return connectDB(retries - 1);
    } else {
      logger.error('❌ MongoDB connection failed after all retries');
      process.exit(1);
    }
  }
};

// Get database instance
const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return db;
};

module.exports = connectDB;
module.exports.getDb = getDb;
