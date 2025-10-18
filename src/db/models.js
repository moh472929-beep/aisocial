// src/db/models.js
const fs = require('fs');
const path = require('path');
const logger = require('../middleware/logger') || console;

async function initializeModels() {
  try {
    const modelsDir = path.join(__dirname, '../models');
    const modelFiles = fs.readdirSync(modelsDir).filter(file => file.endsWith('.js'));

    for (const file of modelFiles) {
      const modelPath = path.join(modelsDir, file);
      require(modelPath);
      logger.info(`✅ Loaded model: ${file}`);
    }

    logger.info('✅ All models initialized successfully.');
  } catch (error) {
    logger.error('❌ Error initializing models:', error);
    throw error;
  }
}

module.exports = { initializeModels };
