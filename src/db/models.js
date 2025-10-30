import path from "path";
import { logger } from "../middleware/errorHandler.js";

let modelsRegistry = {};

async function loadModel(relativePath) {
  // Create a proper file:// URL for ESM imports
  const baseUrl = new URL('../models', import.meta.url);
  const moduleUrl = new URL(relativePath, baseUrl);
  const module = await import(moduleUrl);
  return module?.default ?? module;
}

function instantiate(module) {
  const exported = module?.default ?? module;
  return typeof exported === "function" ? new exported() : exported;
}

async function initializeModels(opts = {}) {
  try {
    const useMemory = !!opts.useMemory;

    // Always initialize User model; fallback to in-memory when requested
    const User = instantiate(await import(useMemory ? 
      new URL('memory/UserMemory.js', new URL('../models/', import.meta.url)) : 
      new URL('User.js', new URL('../models/', import.meta.url))));

    // When using memory, initialize essential models with in-memory versions
    if (useMemory) {
      const Analytics = instantiate(await import(new URL('memory/AnalyticsMemory.js', new URL('../models/', import.meta.url))));
      
      modelsRegistry = { User, Analytics };
      
      for (const key of Object.keys(modelsRegistry)) {
        const model = modelsRegistry[key];
        if (typeof model?.initialize === "function") {
          await model.initialize();
        }
      }
      
      logger.info("✅ In-memory models initialized (User, Analytics)");
      return;
    }

    // Real DB-backed models - using path.join for cross-platform compatibility
    const modelsPath = new URL('../models', import.meta.url).pathname;
    const FacebookPage = instantiate(await import(new URL('FacebookPage.js', new URL('../models/', import.meta.url))));
    const Post = instantiate(await import(new URL('Post.js', new URL('../models/', import.meta.url))));
    const Analytics = instantiate(await import(new URL('Analytics.js', new URL('../models/', import.meta.url))));
    const AutoResponse = instantiate(await import(new URL('AutoResponse.js', new URL('../models/', import.meta.url))));
    const UserData = instantiate(await import(new URL('UserData.js', new URL('../models/', import.meta.url))));
    const TrendingTopic = instantiate(await import(new URL('TrendingTopic.js', new URL('../models/', import.meta.url))));
    const CompetitorAnalytics = instantiate(await import(new URL('CompetitorAnalytics.js', new URL('../models/', import.meta.url))));

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

function getModel(name) {
  const model = modelsRegistry[name];
  if (!model) throw new Error(`Model '${name}' is not initialized`);
  return model;
}

export { initializeModels, getModel };
