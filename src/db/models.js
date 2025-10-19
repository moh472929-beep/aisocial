import { logger } from "../utils/logger.js";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let modelsRegistry = {};

// دالة لتحميل المودلز من المسار الصحيح داينمكياً
async function loadModel(relativePath) {
  const fullPath = path.join(__dirname, "../models", relativePath);
  const moduleURL = pathToFileURL(fullPath).href;
  const module = await import(moduleURL);
  return module.default || module;
}

function instantiate(module) {
  const exported = module?.default ?? module;
  return typeof exported === "function" ? new exported() : exported;
}

export async function initializeModels() {
  try {
    // تهيئة جميع المودلز المتوفرة فعلياً في src/models
    const User = instantiate(await loadModel("User.js"));
    const FacebookPage = instantiate(await loadModel("FacebookPage.js"));
    const Post = instantiate(await loadModel("Post.js"));
    const Analytics = instantiate(await loadModel("Analytics.js"));
    const AutoResponse = instantiate(await loadModel("AutoResponse.js"));
    const UserData = instantiate(await loadModel("UserData.js"));
    const TrendingTopic = instantiate(await loadModel("TrendingTopic.js"));
    const CompetitorAnalytics = instantiate(await loadModel("CompetitorAnalytics.js"));

    modelsRegistry = {
      User,
      FacebookPage,
      Post,
      Analytics,
      AutoResponse,
      UserData,
      TrendingTopic,
      CompetitorAnalytics,
    };

    // استدعاء initialize لكل مودل إن وجد
    for (const key of Object.keys(modelsRegistry)) {
      const model = modelsRegistry[key];
      if (typeof model?.initialize === "function") {
        await model.initialize();
      }
    }

    logger.info("✅ All models initialized successfully");
  } catch (error) {
    logger.error("❌ Error initializing models:", error);
    throw error;
  }
}

export function getModel(name) {
  const model = modelsRegistry[name];
  if (!model) throw new Error(`Model '${name}' is not initialized`);
  return model;
}
