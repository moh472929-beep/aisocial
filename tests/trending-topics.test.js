const express = require('express');
const request = require('supertest');
const trendingTopicsController = require('../src/api/trendingTopicsController');
const dbInit = require('../src/db/init');

// Mock the database initialization
jest.mock('../src/db/init', () => {
  return {
    getModel: jest.fn().mockReturnValue({
      findByUserIdAndKeyword: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
      updateContentId: jest.fn(),
    }),
  };
});

// Mock JWT
jest.mock('jsonwebtoken', () => {
  return {
    verify: jest.fn().mockReturnValue({ userId: 'test-user-id' }),
  };
});

describe('Trending Topics Controller', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/trending', trendingTopicsController);
  });

  describe('GET /api/trending/list', () => {
    it('should return trending topics for a user', async () => {
      const mockTopics = [
        {
          id: '1',
          user_id: 'test-user-id',
          topic_keyword: 'technology',
          topic_title: 'Latest Technology Trends',
          location: 'US',
          status: 'generated',
          subscription_type: 'premium',
        },
      ];

      dbInit.getModel.mockReturnValue({
        findByUserId: jest.fn().mockResolvedValue(mockTopics),
      });

      const response = await request(app)
        .get('/api/trending/list')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.topics).toHaveLength(1);
    });

    it('should return 401 if no authorization token is provided', async () => {
      const response = await request(app).get('/api/trending/list');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/trending/fetch', () => {
    it('should fetch new trending topics', async () => {
      dbInit.getModel.mockReturnValue({
        findByUserIdAndKeyword: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: 'new-topic-id',
          topic_keyword: 'ai',
          topic_title: 'Artificial Intelligence',
          location: 'US',
          status: 'discovered',
        }),
      });

      const response = await request(app)
        .get('/api/trending/fetch')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
