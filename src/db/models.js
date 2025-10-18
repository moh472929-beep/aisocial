const User = require('../models/User');
const Post = require('../models/Post');
const Analytics = require('../models/Analytics');
const AutoResponse = require('../models/AutoResponse');
const CompetitorAnalytics = require('../models/CompetitorAnalytics');
const FacebookPage = require('../models/FacebookPage');
const TrendingTopic = require('../models/TrendingTopic');

const modelInstances = {};

const initializeModels = async (connection) => {
  if (!connection || connection.readyState !== 1) {
    throw new Error("Database not initialized. Call connectDB() first.");
  }

  try {
    modelInstances.User = new User();
    modelInstances.Post = new Post();
    modelInstances.Analytics = new Analytics();
    modelInstances.AutoResponse = new AutoResponse();
    modelInstances.CompetitorAnalytics = new CompetitorAnalytics();
    modelInstances.FacebookPage = new FacebookPage();
    modelInstances.TrendingTopic = new TrendingTopic();

    for (const name in modelInstances) {
      if (modelInstances[name].initialize) {
        await modelInstances[name].initialize();
      }
    }

    console.log("✅ Models initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing models:", error);
    throw error;
  }
};

const getModel = (name) => {
  if (!modelInstances[name]) {
    throw new Error(`Model ${name} not found`);
  }
  return modelInstances[name];
};

module.exports = {
  initializeModels,
  getModel,
};
