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
    const User = instantiate(await import(useMemory ? "../models/memory/UserMemory.js" : "../models/User.js"));

    // When using memory, initialize essential models with in-memory versions
    if (useMemory) {
      const Analytics = instantiate(await import("../models/memory/AnalyticsMemory.js"));
      
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

    // Real DB-backed models
    const FacebookPage = instantiate(loadModel("FacebookPage.js"));
    const Post = instantiate(loadModel("Post.js"));
    const Analytics = instantiate(loadModel("Analytics.js"));
    const AutoResponse = instantiate(loadModel("AutoResponse.js"));
    const UserData = instantiate(loadModel("UserData.js"));
    const TrendingTopic = instantiate(loadModel("TrendingTopic.js"));
    const CompetitorAnalytics = instantiate(loadModel("CompetitorAnalytics.js"));

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
