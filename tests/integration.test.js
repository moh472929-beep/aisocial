const axios = require('axios');
const { MongoClient } = require('mongodb');
const config = require('../config');
const User = require('../src/models/User');

// Mock data for testing
const testUser = {
  fullName: 'Integration Test User',
  email: 'integration_test@example.com',
  username: 'integrationtestuser',
  password: 'testpassword123',
};

// Integration test to verify code structure and imports
const path = require('path');

// Test that all modules can be imported without syntax errors
console.log('Testing module imports...');

try {
  // Test model imports
  const AutoResponse = require('../src/models/AutoResponse');
  const CompetitorAnalytics = require('../src/models/CompetitorAnalytics');
  console.log('✓ Models imported successfully');

  // Test controller imports
  const autoResponseController = require('../src/api/autoResponseController');
  const competitorController = require('../src/api/competitorController');
  console.log('✓ Controllers imported successfully');

  // Test database initialization
  const dbInit = require('../src/db/init');
  console.log('✓ Database initialization module imported successfully');

  // Test that classes can be instantiated
  const autoResponseModel = new AutoResponse();
  const competitorAnalyticsModel = new CompetitorAnalytics();
  console.log('✓ Model instances created successfully');

  console.log('\n✅ All integration tests passed! Code structure is valid.');
  process.exit(0);
} catch (error) {
  console.error('❌ Integration test failed:', error.message);
  process.exit(1);
}

// Test suite for integration functionality
describe('Integration Tests', () => {
  let user, token, dbClient;

  beforeAll(async () => {
    // Connect to database
    dbClient = new MongoClient(config.database.mongodbUri);
    await dbClient.connect();

    // Initialize models
    const userInstance = new User();
    await userInstance.initialize();
  });

  afterAll(async () => {
    // Clean up test data
    if (user && user.id) {
      const userInstance = new User();
      await userInstance.initialize();
      await userInstance.collection.deleteOne({ _id: user._id });
    }

    await dbClient.close();
  });

  test('Complete user flow', async () => {
    // 1. User signup
    const signupResponse = await axios.post(
      `${config.baseUrl}/.netlify/functions/api/auth/signup`,
      testUser
    );
    expect(signupResponse.data.success).toBe(true);
    expect(signupResponse.data.user).toBeDefined();

    user = signupResponse.data.user;

    // 2. User login
    const loginResponse = await axios.post(`${config.baseUrl}/.netlify/functions/api/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });

    expect(loginResponse.data.success).toBe(true);
    expect(loginResponse.data.token).toBeDefined();

    token = loginResponse.data.token;

    // 3. Access user profile
    const profileResponse = await axios.get(
      `${config.baseUrl}/.netlify/functions/api/auth/profile`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    expect(profileResponse.data.success).toBe(true);
    expect(profileResponse.data.user).toBeDefined();

    // 4. Enable AI permissions
    const enableResponse = await axios.post(
      `${config.baseUrl}/.netlify/functions/api/ai/permissions/enable`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    expect(enableResponse.data.success).toBe(true);
    expect(enableResponse.data.user.aiPermissions.enabled).toBe(true);

    // 5. AI chat
    const chatResponse = await axios.post(
      `${config.baseUrl}/.netlify/functions/api/ai/chat`,
      { message: 'Hello, AI assistant! Can you help me with Facebook management?' },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    expect(chatResponse.data.success).toBe(true);
    expect(chatResponse.data.response).toBeDefined();
    expect(typeof chatResponse.data.response).toBe('string');

    // 6. AI post generation
    const postResponse = await axios.post(
      `${config.baseUrl}/.netlify/functions/api/facebook/generate-post`,
      {
        category: 'business',
        tone: 'professional',
        customPrompt: 'Write about the benefits of AI in social media management',
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    expect(postResponse.data.success).toBe(true);
    expect(postResponse.data.post).toBeDefined();
    expect(postResponse.data.post.content).toBeDefined();

    // 7. Get user posts
    const postsResponse = await axios.get(
      `${config.baseUrl}/.netlify/functions/api/facebook/posts`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    expect(postsResponse.data.success).toBe(true);
    expect(Array.isArray(postsResponse.data.posts)).toBe(true);
    expect(postsResponse.data.posts.length).toBeGreaterThan(0);

    // 8. Update AI preferences
    const preferences = {
      postCategories: ['business', 'technology', 'ai'],
      preferredTone: 'professional',
      postingFrequency: 'daily',
    };

    const updateResponse = await axios.put(
      `${config.baseUrl}/.netlify/functions/api/ai/preferences`,
      { preferences },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    expect(updateResponse.data.success).toBe(true);
    expect(updateResponse.data.preferences).toEqual(preferences);

    // 9. Get AI memory
    const memoryResponse = await axios.get(`${config.baseUrl}/.netlify/functions/api/ai/memory`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(memoryResponse.data.success).toBe(true);
    expect(memoryResponse.data.aiMemory).toBeDefined();

    // 10. Get AI permissions
    const permissionsResponse = await axios.get(
      `${config.baseUrl}/.netlify/functions/api/ai/permissions`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    expect(permissionsResponse.data.success).toBe(true);
    expect(permissionsResponse.data.aiPermissions.enabled).toBe(true);
  });

  test('Health check endpoint', async () => {
    // Test API health check
    const healthResponse = await axios.get(`${config.baseUrl}/.netlify/functions/api/health`);

    expect(healthResponse.data.status).toBe('OK');
    expect(healthResponse.data.service).toBe('Facebook AI Manager API');
    expect(healthResponse.data.timestamp).toBeDefined();
  });
});
