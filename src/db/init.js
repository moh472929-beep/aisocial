const { logger } = require("../middleware/errorHandler");
const { initializeModels, getModel } = require("./models.js");

async function initDB() {
  try {
    logger.info("🚀 Initializing database...");
    const { connectDB } = await import("./connection.mjs");
    await connectDB();
    await initializeModels();
    logger.info("✅ Database initialized successfully");
  } catch (error) {
    logger.error("❌ Failed to initialize database:", error);
    throw error;
  }
}

module.exports = { initDB, getModel };
