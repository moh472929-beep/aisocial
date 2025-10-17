// Test setup file
const config = require('../config');

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/facebook_ai_manager_test';
process.env.SESSION_SECRET = 'test-secret-key';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.FACEBOOK_APP_ID = 'test-facebook-app-id';
process.env.FACEBOOK_APP_SECRET = 'test-facebook-app-secret';

// Mock console methods to reduce noise during testing
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock external APIs
jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  create: jest.fn().mockReturnThis(),
  defaults: {
    headers: {
      common: {},
      post: {},
      get: {},
      put: {},
      delete: {},
    },
  },
}));

// Mock database connection
jest.mock('../src/db/connection', () => ({
  getDb: jest.fn(() => ({
    collection: jest.fn().mockReturnValue({
      findOne: jest.fn().mockResolvedValue(null),
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      }),
      insertOne: jest.fn().mockResolvedValue({ insertedId: 'test_id' }),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      createIndex: jest.fn().mockResolvedValue(),
    }),
  })),
}));

// Mock Facebook API responses
const mockFacebookAuthResponse = {
  data: {
    access_token: 'test_access_token',
  },
};

const mockFacebookUserResponse = {
  data: {
    id: 'test_facebook_user_id',
    name: 'Test Facebook User',
  },
};

const mockFacebookPagesResponse = {
  data: {
    data: [
      {
        id: 'test_page_id',
        access_token: 'test_page_access_token',
        name: 'Test Facebook Page',
        category: 'Business',
      },
    ],
  },
};

const mockFacebookPageResponse = {
  data: {
    fan_count: 1000,
    followers_count: 1200,
  },
};

const mockFacebookPostsResponse = {
  data: {
    data: [
      { id: 'post1', message: 'Test post 1' },
      { id: 'post2', message: 'Test post 2' },
    ],
  },
};

const mockFacebookPostDetailsResponse = {
  data: {
    likes: { summary: { total_count: 50 } },
    comments: { summary: { total_count: 10 } },
    shares: { count: 5 },
  },
};

const mockFacebookPublishResponse = {
  data: {
    id: 'published_post_id',
  },
};

// Mock OpenAI API responses
const mockOpenAIChatResponse = {
  data: {
    choices: [
      {
        message: {
          content: 'This is a test AI response',
        },
      },
    ],
  },
};

const mockOpenAIImageResponse = {
  data: {
    data: [
      {
        url: 'https://example.com/test-image.png',
      },
    ],
  },
};

// Setup axios mocks
const axios = require('axios');

axios.post.mockImplementation((url, data) => {
  if (url.includes('oauth/access_token')) {
    return Promise.resolve(mockFacebookAuthResponse);
  }

  if (url.includes('me?access_token')) {
    return Promise.resolve(mockFacebookUserResponse);
  }

  if (url.includes('me/accounts?access_token')) {
    return Promise.resolve(mockFacebookPagesResponse);
  }

  if (url.includes('me/feed')) {
    return Promise.resolve(mockFacebookPublishResponse);
  }

  if (url.includes('chat/completions')) {
    return Promise.resolve(mockOpenAIChatResponse);
  }

  if (url.includes('images/generations')) {
    return Promise.resolve(mockOpenAIImageResponse);
  }

  return Promise.reject(new Error('Unknown endpoint'));
});

axios.get.mockImplementation(url => {
  if (url.includes('me?access_token')) {
    return Promise.resolve(mockFacebookUserResponse);
  }

  if (url.includes('me/accounts?access_token')) {
    return Promise.resolve(mockFacebookPagesResponse);
  }

  if (
    url.includes('/v18.0/') &&
    url.includes('?access_token') &&
    url.includes('fields=fan_count,followers_count')
  ) {
    return Promise.resolve(mockFacebookPageResponse);
  }

  if (url.includes('/v18.0/') && url.includes('/posts?access_token')) {
    return Promise.resolve(mockFacebookPostsResponse);
  }

  if (
    url.includes('/v18.0/') &&
    url.includes('?access_token') &&
    url.includes('fields=likes.summary(true)')
  ) {
    return Promise.resolve(mockFacebookPostDetailsResponse);
  }

  return Promise.reject(new Error('Unknown endpoint'));
});
