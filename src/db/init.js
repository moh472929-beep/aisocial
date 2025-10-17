const mongoose = require('mongoose');
const { initializeModels, getModel } = require('./models');
require('dotenv').config();

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  console.log("🔹 MONGODB_URI:", uri); // تحقق من أن المتغير موجود

  if (!uri) {
    console.warn("⚠️ MongoDB URI missing! Running without DB (static preview mode)");
    return;
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Initialize all models
    await initializeModels();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error; // يسمح للسيرفر بالتعامل مع الوضع degraded
  }
};

// Export both connectDB and getModel functions
module.exports = connectDB;
module.exports.getModel = getModel;
