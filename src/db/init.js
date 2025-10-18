const mongoose = require('mongoose');
const { initializeModels, getModel } = require('./models');
require('dotenv').config();

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || "aisocial";

  console.log("🔹 MONGODB_URI:", uri);

  if (!uri) {
    console.warn("⚠️ MongoDB URI missing! Running without DB (static preview mode)");
    return;
  }

  try {
    // 🟢 الاتصال بقاعدة البيانات
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: dbName,
    });

    console.log(`✅ Connected to MongoDB Database: ${dbName}`);

    // 🧩 بعد الاتصال، فعّل الموديلات
    await initializeModels(mongoose.connection);
    console.log('📦 All models initialized successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
};

module.exports = connectDB;
module.exports.getModel = getModel;
