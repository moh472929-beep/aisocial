const { MongoClient, ObjectId } = require('mongodb');
const config = require('../config');
const User = require('../src/models/User');
const FacebookPage = require('../src/models/FacebookPage');
const UserData = require('../src/models/UserData');

// Mock data for testing
const testUser = {
  fullName: 'Model Test User',
  email: 'model_test@example.com',
  username: 'modeltestuser',
  password: 'testpassword123',
};

const testFacebookPage = {
  userId: 'test_user_id',
  pageId: '123456789',
  pageToken: 'test_page_token',
  pageName: 'Test Facebook Page',
  category: 'Business',
};

const testUserData = {
  userId: 'test_user_id',
  postsHistory: [],
  interactionData: [],
  aiMemory: {
    preferences: {},
    interactionHistory: [],
    learningData: {},
  },
};

// Test suite for database models
describe('Database Models Tests', () => {
  let dbClient, userInstance, facebookPageInstance, userDataInstance;

  beforeAll(async () => {
    // Connect to database
    dbClient = new MongoClient(config.database.mongodbUri);
    await dbClient.connect();

    // Initialize models
    userInstance = new User();
    await userInstance.initialize();

    facebookPageInstance = new FacebookPage();
    await facebookPageInstance.initialize();

    userDataInstance = new UserData();
    await userDataInstance.initialize();
  });

  afterAll(async () => {
    // Clean up test data
    await userInstance.collection.deleteMany({ email: testUser.email });
    await facebookPageInstance.collection.deleteMany({ pageId: testFacebookPage.pageId });
    await userDataInstance.collection.deleteMany({ userId: testUserData.userId });

    await dbClient.close();
  });

  test('User model operations', async () => {
    // Test user creation
    const createdUser = await userInstance.create(testUser);
    expect(createdUser).toBeDefined();
    expect(createdUser.email).toBe(testUser.email);
    expect(createdUser.fullName).toBe(testUser.fullName);
    expect(createdUser.id).toBeDefined();

    // Test finding user by ID
    const foundUser = await userInstance.findById(createdUser.id);
    expect(foundUser).toBeDefined();
    expect(foundUser.email).toBe(testUser.email);

    // Test finding user by email
    const userByEmail = await userInstance.findByEmail(testUser.email);
    expect(userByEmail).toBeDefined();
    expect(userByEmail.id).toBe(createdUser.id);

    // Test finding user by username
    const userByUsername = await userInstance.findByUsername(testUser.username);
    expect(userByUsername).toBeDefined();
    expect(userByUsername.id).toBe(createdUser.id);

    // Test updating user
    const updateData = { fullName: 'Updated Test User' };
    const updated = await userInstance.update(createdUser.id, updateData);
    expect(updated).toBe(true);

    const updatedUser = await userInstance.findById(createdUser.id);
    expect(updatedUser.fullName).toBe('Updated Test User');

    // Test AI memory operations
    const aiMemory = {
      preferences: { tone: 'professional' },
      interactionHistory: [{ message: 'Hello' }],
      learningData: { topics: ['AI'] },
    };

    const memoryUpdated = await userInstance.updateAIMemory(createdUser.id, aiMemory);
    expect(memoryUpdated).toBe(true);

    // Test adding interaction to history
    const interaction = { userMessage: 'Test message', aiResponse: 'Test response' };
    const interactionAdded = await userInstance.addInteractionToHistory(
      createdUser.id,
      interaction
    );
    expect(interactionAdded).toBe(true);

    // Test adding post to history
    const post = { content: 'Test post', category: 'business' };
    const postAdded = await userInstance.addPostToHistory(createdUser.id, post);
    expect(postAdded).toBe(true);
  });

  test('FacebookPage model operations', async () => {
    // Test Facebook page creation
    const createdPage = await facebookPageInstance.create(testFacebookPage);
    expect(createdPage).toBeDefined();
    expect(createdPage.pageId).toBe(testFacebookPage.pageId);
    expect(createdPage.pageName).toBe(testFacebookPage.pageName);
    expect(createdPage.id).toBeDefined();

    // Test finding pages by user ID
    const pages = await facebookPageInstance.findByUserId(testFacebookPage.userId);
    expect(Array.isArray(pages)).toBe(true);
    expect(pages.length).toBeGreaterThan(0);

    // Test finding page by page ID
    const page = await facebookPageInstance.findByPageId(testFacebookPage.pageId);
    expect(page).toBeDefined();
    expect(page.id).toBe(createdPage.id);

    // Test finding page by user ID and page ID
    const userPage = await facebookPageInstance.findByUserIdAndPageId(
      testFacebookPage.userId,
      testFacebookPage.pageId
    );
    expect(userPage).toBeDefined();
    expect(userPage.id).toBe(createdPage.id);

    // Test updating Facebook page
    const updateData = { pageName: 'Updated Test Page' };
    const updated = await facebookPageInstance.update(
      testFacebookPage.userId,
      testFacebookPage.pageId,
      updateData
    );
    expect(updated).toBe(true);

    const updatedPage = await facebookPageInstance.findByUserIdAndPageId(
      testFacebookPage.userId,
      testFacebookPage.pageId
    );
    expect(updatedPage.pageName).toBe('Updated Test Page');

    // Test updating page settings
    const settings = { autoPost: true, scheduleTime: '09:00' };
    const settingsUpdated = await facebookPageInstance.updateSettings(
      testFacebookPage.userId,
      testFacebookPage.pageId,
      settings
    );
    expect(settingsUpdated).toBe(true);
  });

  test('UserData model operations', async () => {
    // Test user data creation
    const createdData = await userDataInstance.create(testUserData);
    expect(createdData).toBeDefined();
    expect(createdData.userId).toBe(testUserData.userId);
    expect(createdData.id).toBeDefined();

    // Test finding user data by user ID
    const foundData = await userDataInstance.findByUserId(testUserData.userId);
    expect(foundData).toBeDefined();
    expect(foundData.userId).toBe(testUserData.userId);

    // Test updating user data
    const updateData = { postsHistory: [{ content: 'Updated post' }] };
    const updated = await userDataInstance.updateByUserId(testUserData.userId, updateData);
    expect(updated).toBe(true);

    // Test adding post history
    const post = { content: 'New post', category: 'technology' };
    const postAdded = await userDataInstance.addPostHistory(testUserData.userId, post);
    expect(postAdded).toBe(true);

    // Test adding interaction data
    const interaction = { type: 'chat', message: 'Hello' };
    const interactionAdded = await userDataInstance.addInteractionData(
      testUserData.userId,
      interaction
    );
    expect(interactionAdded).toBe(true);

    // Test updating AI memory
    const aiMemory = { preferences: { tone: 'friendly' } };
    const memoryUpdated = await userDataInstance.updateAIMemory(testUserData.userId, aiMemory);
    expect(memoryUpdated).toBe(true);
  });
});
