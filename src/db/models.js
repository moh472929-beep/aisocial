const User = require('../models/User');
const Post = require('../models/Post');
const Analytics = require('../models/Analytics');
const AutoResponse = require('../models/AutoResponse');
const CompetitorAnalytics = require('../models/CompetitorAnalytics');
const FacebookPage = require('../models/FacebookPage');
const TrendingTopic = require('../models/TrendingTopic');

// Model instances cache
const modelInstances = {};

// Initialize all models
const initializeModels = async () => {
  try {
    // Initialize each model
    modelInstances.User = new User();
    modelInstances.Post = new Post();
    modelInstances.Analytics = new Analytics();
    modelInstances.AutoResponse = new AutoResponse();
    modelInstances.CompetitorAnalytics = new CompetitorAnalytics();
    modelInstances.FacebookPage = new FacebookPage();
    modelInstances.TrendingTopic = new TrendingTopic();

    // Initialize model collections
    for (const modelName in modelInstances) {
      if (modelInstances[modelName].initialize) {
        await modelInstances[modelName].initialize();
      }
    }

    console.log('✅ All models initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing models:', error);
    throw error;
  }
};

// Get model instance by name
const getModel = modelName => {
  if (!modelInstances[modelName]) {
    throw new Error(`Model ${modelName} not found`);
  }
  return modelInstances[modelName];
};

module.exports = {
  initializeModels,
  getModel,
};
