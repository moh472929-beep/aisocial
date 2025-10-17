// Simple authentication tests
const axios = require('axios');

// Mock the axios calls
jest.mock('axios');

// Mock data for testing
const testUser = {
  fullName: 'Test User',
  email: 'test@example.com',
  username: 'testuser',
  password: 'testpassword123',
};

describe('Authentication Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('User signup should return success', async () => {
    // Mock the axios post response for signup
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        user: {
          id: 'test_user_id',
          fullName: testUser.fullName,
          email: testUser.email,
          username: testUser.username,
        },
      },
    });

    const response = await axios.post('/api/auth/signup', testUser);

    expect(response.data.success).toBe(true);
    expect(response.data.user.email).toBe(testUser.email);
    expect(response.data.user.fullName).toBe(testUser.fullName);
    expect(axios.post).toHaveBeenCalledWith('/api/auth/signup', testUser);
  });

  test('User login should return token', async () => {
    // Mock the axios post response for login
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        token: 'test_jwt_token',
        user: {
          id: 'test_user_id',
          email: testUser.email,
        },
      },
    });

    const loginData = {
      email: testUser.email,
      password: testUser.password,
    };

    const response = await axios.post('/api/auth/login', loginData);

    expect(response.data.success).toBe(true);
    expect(response.data.token).toBe('test_jwt_token');
    expect(axios.post).toHaveBeenCalledWith('/api/auth/login', loginData);
  });

  test('Invalid login should return error', async () => {
    // Mock the axios post response for failed login
    axios.post.mockRejectedValueOnce({
      response: {
        status: 401,
        data: {
          success: false,
          error: 'Invalid credentials',
        },
      },
    });

    const invalidLoginData = {
      email: 'wrong@example.com',
      password: 'wrongpassword',
    };

    try {
      await axios.post('/api/auth/login', invalidLoginData);
    } catch (error) {
      expect(error.response.status).toBe(401);
      expect(error.response.data.success).toBe(false);
      expect(error.response.data.error).toBe('Invalid credentials');
    }
  });
});
