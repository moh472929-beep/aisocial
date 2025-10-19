import { connectDB } from "./connection.js";
import { initializeModels } from "./models.js";
import { logger } from "../utils/logger.js";

export async function initDB() {
  try {
    logger.info("🚀 Initializing database...");
    await connectDB();
    await initializeModels();
    logger.info("✅ Database initialized successfully");
  } catch (error) {
    logger.error("❌ Failed to initialize database:", error);
    throw error;
  }
}

export { getModel } from "./models.js";
