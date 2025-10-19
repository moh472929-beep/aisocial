const mongoose = require("mongoose");
const { logger } = require("../middleware/errorHandler");

let db = null;

async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MongoDB URI not configured. Set MONGODB_URI or MONGO_URI");
    }

    logger.info("⏳ Connecting to MongoDB...");
    const conn = await mongoose.connect(mongoUri);

    db = conn.connection.db;
    logger.info("✅ MongoDB connected successfully");

    return db;
  } catch (error) {
    logger.error("❌ MongoDB connection failed:", error);
    throw error;
  }
}

function getDb() {
  if (!db) throw new Error("Database not initialized. Call connectDB() first.");
  return db;
}

module.exports = { connectDB, getDb };
