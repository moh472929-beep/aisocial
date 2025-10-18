import { getDb } from "./connection.js";
import { logger } from "../utils/logger.js";
import path from "path";
import { pathToFileURL } from "url";

// دالة لتحميل المودلز من المسار الصحيح داينمكياً
async function loadModel(relativePath) {
  const fullPath = path.join(process.cwd(), "src", "models", relativePath);
  const moduleURL = pathToFileURL(fullPath).href;
  const module = await import(moduleURL);
  return module.default || module;
}

export async function initializeModels() {
  try {
    const db = getDb();
    logger.info("📦 Initializing MongoDB models...");

    // تحميل المودلز ديناميكياً حسب أسماء الملفات
    const User = await loadModel("User.js");
    const Page = await loadModel("Page.js");
    const Post = await loadModel("Post.js");
    const Analytics = await loadModel("Analytics.js");
    const AutoResponse = await loadModel("AutoResponse.js");
    const Task = await loadModel("Task.js");

    const models = [User, Page, Post, Analytics, AutoResponse, Task];

    for (const model of models) {
      if (model.initialize) {
        await model.initialize(db);
      }
    }

    logger.info("✅ All models initialized successfully");
  } catch (error) {
    logger.error("❌ Error initializing models:", error);
    throw error;
  }
}
