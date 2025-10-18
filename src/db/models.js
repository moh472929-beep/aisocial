import { getDb } from "./connection.js";
import { logger } from "../utils/logger.js";

import User from "../models/User.js";
import Page from "../models/Page.js";
import Post from "../models/Post.js";
import Analytics from "../models/Analytics.js";
import AutoResponse from "../models/AutoResponse.js";
import Task from "../models/Task.js";

export async function initializeModels() {
  try {
    const db = getDb();
    logger.info("📦 Initializing models...");

    const models = [User, Page, Post, Analytics, AutoResponse, Task];
    for (const model of models) {
      if (model.initialize) await model.initialize(db);
    }

    logger.info("✅ All models initialized successfully");
  } catch (error) {
    logger.error("❌ Error initializing models:", error);
    throw error;
  }
}
