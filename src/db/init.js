const mongoose = require('mongoose');
const { initializeModels, getModel } = require('./models');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Initialize all models
    await initializeModels();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    // Bubble up the error so the server can decide whether to start in degraded mode
    throw error;
  }
};

// Export both connectDB and getModel functions
module.exports = connectDB;
module.exports.getModel = getModel;
