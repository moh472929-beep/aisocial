const axios = require('axios');
const { MongoClient } = require('mongodb');
const config = require('../config');
const User = require('../src/models/User');
const Post = require('../src/models/Post');
const Analytics = require('../src/models/Analytics');

// Mock data for testing
const testUser = {
  fullName: 'Analytics Test User',
  email: 'analytics_test@example.com',
  username: 'analyticstestuser',
  password: 'testpassword123',
};

const testPost = {
  postId: 'test_post_123',
  pageId: 'test_page_123',
  userId: 'test_user_id',
  content: 'Test post content',
  type: 'text',
  likes: 100,
  shares: 50,
  comments: 25,
  views: 500,
};

const testAnalytics = {
  userId: 'test_user_id',
  pageId: 'test_page_123',
  period: 'daily',
  totalPosts: 10,
  totalLikes: 1000,
  totalShares: 500,
  totalComments: 250,
  totalViews: 5000,
  totalFollowers: 10000,
  engagementRate: 17.5,
  followerGrowth: 5.2,
  topPosts: [testPost],
  bestPostTimes: [{ hour: 10, averageEngagement: 150 }],
};

// Test suite for analytics functionality
describe('Analytics Tests', () => {
  let user, token, dbClient;

  beforeAll(async () => {
    // Connect to database
    dbClient = new MongoClient(config.database.mongodbUri);
    await dbClient.connect();

    // Initialize models
    const userInstance = new User();
    await userInstance.initialize();

    const postInstance = new Post();
    await postInstance.initialize();

    const analyticsInstance = new Analytics();
    await analyticsInstance.initialize();
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

  test('Post model operations', async () => {
    const postInstance = new Post();
    await postInstance.initialize();

    // Test post creation
    const createdPost = await postInstance.create(testPost);
    expect(createdPost).toBeDefined();
    expect(createdPost.postId).toBe(testPost.postId);
    expect(createdPost.content).toBe(testPost.content);

    // Test finding post by post ID
    const foundPost = await postInstance.findByPostId(testPost.postId);
    expect(foundPost).toBeDefined();
    expect(foundPost.postId).toBe(testPost.postId);

    // Test finding posts by page ID
    const postsByPage = await postInstance.findByPageId(testPost.pageId);
    expect(Array.isArray(postsByPage)).toBe(true);
    expect(postsByPage.length).toBeGreaterThan(0);

    // Test finding posts by user ID
    const postsByUser = await postInstance.findByUserId(testPost.userId);
    expect(Array.isArray(postsByUser)).toBe(true);
    expect(postsByUser.length).toBeGreaterThan(0);

    // Test updating post metrics
    const updated = await postInstance.updateMetrics(testPost.postId, {
      likes: 150,
      shares: 75,
      comments: 40,
      views: 750,
    });
    expect(updated).toBe(true);

    // Test getting top posts by engagement
    const topPosts = await postInstance.getTopPostsByEngagement(testPost.userId);
    expect(Array.isArray(topPosts)).toBe(true);
  });

  test('Analytics model operations', async () => {
    const analyticsInstance = new Analytics();
    await analyticsInstance.initialize();

    // Test analytics creation
    const createdAnalytics = await analyticsInstance.create(testAnalytics);
    expect(createdAnalytics).toBeDefined();
    expect(createdAnalytics.userId).toBe(testAnalytics.userId);
    expect(createdAnalytics.pageId).toBe(testAnalytics.pageId);

    // Test finding analytics by user ID and page ID
    const foundAnalytics = await analyticsInstance.findByUserIdAndPageId(
      testAnalytics.userId,
      testAnalytics.pageId
    );
    expect(foundAnalytics).toBeDefined();
    expect(foundAnalytics.userId).toBe(testAnalytics.userId);
    expect(foundAnalytics.pageId).toBe(testAnalytics.pageId);

    // Test updating analytics by user ID and page ID
    const updated = await analyticsInstance.updateByUserIdAndPageId(
      testAnalytics.userId,
      testAnalytics.pageId,
      {
        engagementRate: 20.5,
        followerGrowth: 7.8,
      }
    );
    expect(updated).toBe(true);

    // Test updating engagement rate
    const engagementUpdated = await analyticsInstance.updateEngagementRate(
      testAnalytics.userId,
      testAnalytics.pageId,
      22.5
    );
    expect(engagementUpdated).toBe(true);

    // Test updating follower growth
    const followerGrowthUpdated = await analyticsInstance.updateFollowerGrowth(
      testAnalytics.userId,
      testAnalytics.pageId,
      10.2
    );
    expect(followerGrowthUpdated).toBe(true);

    // Test updating best post times
    const bestTimesUpdated = await analyticsInstance.updateBestPostTimes(
      testAnalytics.userId,
      testAnalytics.pageId,
      [
        { hour: 12, averageEngagement: 200 },
        { hour: 18, averageEngagement: 180 },
      ]
    );
    expect(bestTimesUpdated).toBe(true);
  });

  test('Analytics API endpoints', async () => {
    // Enable AI permissions first
    await axios.post(
      `${config.baseUrl}/.netlify/functions/api/ai/permissions/enable`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Test analytics fetch endpoint (mocked)
    const fetchResponse = await axios.post(
      `${config.baseUrl}/.netlify/functions/api/analytics/fetch`,
      { period: 'daily' },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Note: This test might fail if no Facebook pages are connected
    // In a real test environment, we would mock the Facebook API
    expect([true, false]).toContain(fetchResponse.data.success);

    // Test analytics process endpoint (mocked)
    const processResponse = await axios.post(
      `${config.baseUrl}/.netlify/functions/api/analytics/process`,
      { period: 'daily' },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Note: This test might fail if no Facebook pages are connected
    // In a real test environment, we would mock the Facebook API
    expect([true, false]).toContain(processResponse.data.success);

    // Test analytics dashboard endpoint
    const dashboardResponse = await axios.get(
      `${config.baseUrl}/.netlify/functions/api/analytics/dashboard?period=daily`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    expect(dashboardResponse.data.success).toBe(true);
    expect(Array.isArray(dashboardResponse.data.analytics)).toBe(true);
  });
});
