const axios = require('axios');
const { MongoClient } = require('mongodb');
const config = require('../config');
const User = require('../src/models/User');

// Mock data for testing
const testUser = {
  fullName: 'Test User',
  email: 'test2@example.com',
  username: 'testuser2',
  password: 'testpassword123',
};

// Test suite for Facebook automation functionality
describe('Facebook Automation Tests', () => {
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

  test('Facebook pages management', async () => {
    // Get Facebook pages (should be empty initially)
    const pagesResponse = await axios.get(
      `${config.baseUrl}/.netlify/functions/api/facebook/pages`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    expect(pagesResponse.data.success).toBe(true);
    expect(Array.isArray(pagesResponse.data.pages)).toBe(true);
  });

  test('AI post generation', async () => {
    // Enable AI permissions first
    await axios.post(
      `${config.baseUrl}/.netlify/functions/api/ai/permissions/enable`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Test AI post generation
    const postResponse = await axios.post(
      `${config.baseUrl}/.netlify/functions/api/facebook/generate-post`,
      {
        category: 'business',
        tone: 'professional',
        customPrompt: 'Write about AI technology trends',
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    expect(postResponse.data.success).toBe(true);
    expect(postResponse.data.post).toBeDefined();
    expect(postResponse.data.post.content).toBeDefined();
    expect(postResponse.data.post.category).toBe('business');
    expect(postResponse.data.post.tone).toBe('professional');
  });

  test('User posts management', async () => {
    // Get user posts
    const postsResponse = await axios.get(
      `${config.baseUrl}/.netlify/functions/api/facebook/posts`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    expect(postsResponse.data.success).toBe(true);
    expect(Array.isArray(postsResponse.data.posts)).toBe(true);
    expect(postsResponse.data.posts.length).toBeGreaterThan(0);
  });
});
