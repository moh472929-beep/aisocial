import { connectDB } from "./connection.js";
import { initializeModels } from "./models.js";
import { logger } from "../utils/logger.js";

export async function initDB() {
  try {
    logger.info("🚀 Initializing database...");
    await connectDB(); // أول شي يتصل بقاعدة البيانات
    await initializeModels(); // بعدين يجهز المودلز
    logger.info("✅ Database initialized successfully");
  } catch (error) {
    logger.error("❌ Failed to initialize database:", error);
    throw error;
  }
}
