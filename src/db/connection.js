import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

let db = null;

export async function connectDB() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in environment variables");
    }

    logger.info("⏳ Connecting to MongoDB...");
    const conn = await mongoose.connect(process.env.MONGO_URI);

    db = conn.connection.db;
    logger.info("✅ MongoDB connected successfully");

    return db;
  } catch (error) {
    logger.error("❌ MongoDB connection failed:", error);
    throw error;
  }
}

export function getDb() {
  if (!db) throw new Error("Database not initialized. Call connectDB() first.");
  return db;
}
