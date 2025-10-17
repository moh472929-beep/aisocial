const axios = require('axios');
const { MongoClient } = require('mongodb');
const config = require('../config');
const User = require('../src/models/User');

// Mock data for testing
const testUser = {
  fullName: 'Auth Test User',
  email: 'auth_test@example.com',
  username: 'authtestuser',
  password: 'testpassword123',
};

const invalidUser = {
  email: 'nonexistent@example.com',
  password: 'wrongpassword',
};

// Test suite for authentication functionality
describe('Authentication Tests', () => {
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

  test('User signup', async () => {
    // Test successful signup
    const signupResponse = await axios.post(
      `${config.baseUrl}/.netlify/functions/api/auth/signup`,
      testUser
    );
    expect(signupResponse.data.success).toBe(true);
    expect(signupResponse.data.user).toBeDefined();
    expect(signupResponse.data.user.email).toBe(testUser.email);
    expect(signupResponse.data.user.fullName).toBe(testUser.fullName);
    expect(signupResponse.data.user.username).toBe(testUser.username);
    expect(signupResponse.data.user.password).toBeUndefined(); // Password should not be returned

    user = signupResponse.data.user;

    // Test duplicate signup (should fail)
    try {
      await axios.post(`${config.baseUrl}/.netlify/functions/api/auth/signup`, testUser);
      // If we reach here, the test failed
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.success).toBe(false);
    }
  });

  test('User login', async () => {
    // Test successful login
    const loginResponse = await axios.post(`${config.baseUrl}/.netlify/functions/api/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });

    expect(loginResponse.data.success).toBe(true);
    expect(loginResponse.data.token).toBeDefined();
    expect(loginResponse.data.user).toBeDefined();
    expect(loginResponse.data.user.email).toBe(testUser.email);
    expect(loginResponse.data.user.password).toBeUndefined(); // Password should not be returned

    token = loginResponse.data.token;

    // Test login with invalid credentials
    try {
      await axios.post(`${config.baseUrl}/.netlify/functions/api/auth/login`, {
        email: invalidUser.email,
        password: invalidUser.password,
      });
      // If we reach here, the test failed
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(401);
      expect(error.response.data.success).toBe(false);
    }
  });

  test('User profile access', async () => {
    // Test accessing user profile with valid token
    const profileResponse = await axios.get(
      `${config.baseUrl}/.netlify/functions/api/auth/profile`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    expect(profileResponse.data.success).toBe(true);
    expect(profileResponse.data.user).toBeDefined();
    expect(profileResponse.data.user.email).toBe(testUser.email);

    // Test accessing user profile with invalid token
    try {
      await axios.get(`${config.baseUrl}/.netlify/functions/api/auth/profile`, {
        headers: { Authorization: 'Bearer invalid_token' },
      });
      // If we reach here, the test failed
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(401);
      expect(error.response.data.success).toBe(false);
    }

    // Test accessing user profile without token
    try {
      await axios.get(`${config.baseUrl}/.netlify/functions/api/auth/profile`);
      // If we reach here, the test failed
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(401);
      expect(error.response.data.success).toBe(false);
    }
  });
});
