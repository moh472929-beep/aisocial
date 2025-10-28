import { logger } from "../middleware/errorHandler.js";
import { initializeModels, getModel } from "./models.js";

async function initDB() {
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.RENDER;
  try {
    logger.info("🚀 Initializing database...");
    const { connectDB } = await import("./connection.js");
    await connectDB();
    await initializeModels();
    logger.info("✅ Database initialized successfully");
  } catch (error) {
    logger.error("❌ Failed to initialize database:", error);
    if (isProd) {
      // في الإنتاج، عدم الفولباك إلى الذاكرة لتجنب فقدان البيانات
      throw error;
    }
    logger.warn("⚠️ Falling back to in-memory models (development mode). Data will not persist.");
    try {
      await initializeModels({ useMemory: true });
      logger.info("✅ In-memory models initialized successfully");
    } catch (memErr) {
      logger.error("❌ Failed to initialize in-memory models:", memErr);
      throw memErr;
    }
  }
}

export { initDB, getModel };
