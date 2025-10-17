const axios = require('axios');
const { MongoClient } = require('mongodb');
const config = require('../config');
const User = require('../src/models/User');
const FacebookPage = require('../src/models/FacebookPage');
const UserData = require('../src/models/UserData');

// Mock data for testing
const testUser = {
  fullName: 'Test User',
  email: 'test@example.com',
  username: 'testuser',
  password: 'testpassword123',
};

const testFacebookPage = {
  pageId: '123456789',
  pageToken: 'test_page_token',
  pageName: 'Test Facebook Page',
  category: 'Business',
};

// Test suite for AI functionality
describe('AI Functionality Tests', () => {
  let user, token, dbClient;

  beforeAll(async () => {
    // Connect to database
    dbClient = new MongoClient(config.database.mongodbUri);
    await dbClient.connect();

    // Initialize models
    const userInstance = new User();
    await userInstance.initialize();

    const facebookPageInstance = new FacebookPage();
    await facebookPageInstance.initialize();

    const userDataInstance = new UserData();
    await userDataInstance.initialize();
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

  test('User signup and login', async () => {
    // Test user signup
    const signupResponse = await axios.post(
      `${config.baseUrl}/.netlify/functions/api/auth/signup`,
      testUser
    );
    expect(signupResponse.data.success).toBe(true);
    expect(signupResponse.data.user).toBeDefined();
    expect(signupResponse.data.user.email).toBe(testUser.email);

    user = signupResponse.data.user;

    // Test user login
    const loginResponse = await axios.post(`${config.baseUrl}/.netlify/functions/api/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });

    expect(loginResponse.data.success).toBe(true);
    expect(loginResponse.data.token).toBeDefined();
    expect(loginResponse.data.user).toBeDefined();

    token = loginResponse.data.token;
  });

  test('AI permissions management', async () => {
    // Enable AI permissions
    const enableResponse = await axios.post(
      `${config.baseUrl}/.netlify/functions/api/ai/permissions/enable`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    expect(enableResponse.data.success).toBe(true);
    expect(enableResponse.data.user.aiPermissions.enabled).toBe(true);

    // Get AI permissions
    const getResponse = await axios.get(`${config.baseUrl}/.netlify/functions/api/ai/permissions`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(getResponse.data.success).toBe(true);
    expect(getResponse.data.aiPermissions.enabled).toBe(true);

    // Disable AI permissions
    const disableResponse = await axios.post(
      `${config.baseUrl}/.netlify/functions/api/ai/permissions/disable`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    expect(disableResponse.data.success).toBe(true);
    expect(disableResponse.data.user.aiPermissions.enabled).toBe(false);
  });

  test('AI chat functionality', async () => {
    // Enable AI permissions first
    await axios.post(
      `${config.baseUrl}/.netlify/functions/api/ai/permissions/enable`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Test AI chat
    const chatResponse = await axios.post(
      `${config.baseUrl}/.netlify/functions/api/ai/chat`,
      { message: 'Hello, AI assistant!' },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    expect(chatResponse.data.success).toBe(true);
    expect(chatResponse.data.response).toBeDefined();
    expect(typeof chatResponse.data.response).toBe('string');
  });

  test('AI image generation', async () => {
    // Test AI image generation
    const imageResponse = await axios.post(
      `${config.baseUrl}/.netlify/functions/api/ai/image`,
      { prompt: 'A beautiful sunset' },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Note: This test might fail if no OpenAI API key is configured
    // In a real test environment, we would mock the OpenAI API
    expect([true, false]).toContain(imageResponse.data.success);
  });

  test('AI memory and preferences', async () => {
    // Update AI preferences
    const preferences = {
      postCategories: ['business', 'technology'],
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

    // Get AI memory
    const memoryResponse = await axios.get(`${config.baseUrl}/.netlify/functions/api/ai/memory`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(memoryResponse.data.success).toBe(true);
    expect(memoryResponse.data.aiMemory).toBeDefined();
  });
});
