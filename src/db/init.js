const { logger } = require("../middleware/errorHandler");
const { initializeModels, getModel } = require("./models.js");

async function initDB() {
  try {
    logger.info("🚀 Initializing database...");
    const { connectDB } = require("./connection.js");
    await connectDB();
    await initializeModels();
    logger.info("✅ Database initialized successfully");
  } catch (error) {
    logger.error("❌ Failed to initialize database:", error);
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

module.exports = { initDB, getModel };
