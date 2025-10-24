const jwt = require('jsonwebtoken');
const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';

// Test user credentials
const testUser = {
  email: 'premium-test@example.com',
  username: 'premiumtest',
  password: 'TestPassword123!',
  fullName: 'Premium Test User'
};

// Helper function to get JWT secret (same logic as server)
function getJWTSecret() {
  return process.env.JWT_SECRET || process.env.SESSION_SECRET || 'facebook-ai-manager-secret-key-2025';
}

// Helper function to decode JWT
function decodeJWT(token) {
  try {
    return jwt.verify(token, getJWTSecret(), {
      algorithms: ['HS256'],
      audience: process.env.JWT_AUDIENCE || 'facebook-ai-manager',
      issuer: process.env.JWT_ISSUER || 'facebook-ai-manager-auth'
    });
  } catch (error) {
    console.error('JWT decode error:', error.message);
    return null;
  }
}

// Helper function to make authenticated requests
async function makeAuthenticatedRequest(url, token, method = 'GET', data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status 
    };
  }
}

// Test 1: Create or update premium user
async function testCreatePremiumUser() {
  console.log('\n🔧 Testing premium user creation/update...');
  
  try {
    // First try to signup
    const signupResponse = await axios.post(`${BASE_URL}/api/auth/signup`, {
      email: testUser.email,
      username: testUser.username,
      password: testUser.password,
      fullName: testUser.fullName
    });
    
    console.log('✅ User created successfully');
    return signupResponse.data;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('ℹ️ User already exists, proceeding with login test');
      return null;
    }
    console.error('❌ Signup failed:', error.response?.data || error.message);
    throw error;
  }
}

// Test 2: Login and verify JWT contains role and subscription
async function testLoginJWT() {
  console.log('\n🔑 Testing login JWT generation...');
  
  try {
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    const { accessToken, refreshToken, user } = loginResponse.data.data;
    
    console.log('✅ Login successful');
    console.log('User data:', {
      id: user.id,
      email: user.email,
      role: user.role,
      subscription: user.subscription
    });
    
    // Decode and verify JWT
    const decodedAccess = decodeJWT(accessToken);
    const decodedRefresh = decodeJWT(refreshToken);
    
    console.log('\n📋 Access Token Payload:');
    console.log({
      userId: decodedAccess?.userId,
      email: decodedAccess?.email,
      role: decodedAccess?.role,
      subscription: decodedAccess?.subscription
    });
    
    console.log('\n📋 Refresh Token Payload:');
    console.log({
      userId: decodedRefresh?.userId,
      email: decodedRefresh?.email,
      role: decodedRefresh?.role,
      subscription: decodedRefresh?.subscription,
      type: decodedRefresh?.type
    });
    
    // Verify required fields are present
    if (!decodedAccess?.role || !decodedAccess?.subscription) {
      console.error('❌ Missing role or subscription in access token');
      return null;
    }
    
    if (!decodedRefresh?.role || !decodedRefresh?.subscription) {
      console.error('❌ Missing role or subscription in refresh token');
      return null;
    }
    
    console.log('✅ JWT tokens contain role and subscription fields');
    return { accessToken, refreshToken, user };
    
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

// Test 3: Test premium endpoint access
async function testPremiumEndpoints(accessToken) {
  console.log('\n🔒 Testing premium endpoint access...');
  
  const premiumEndpoints = [
    '/api/analytics/fetch',
    '/api/analytics/dashboard',
    '/api/competitor/analyze',
    '/api/facebook-automation/pages',
    '/api/auto-response/settings'
  ];
  
  for (const endpoint of premiumEndpoints) {
    console.log(`\nTesting ${endpoint}...`);
    
    const result = await makeAuthenticatedRequest(endpoint, accessToken, 'POST', {});
    
    if (result.success) {
      console.log(`✅ ${endpoint} - Access granted (${result.status})`);
    } else if (result.status === 403) {
      console.log(`❌ ${endpoint} - Access denied (403): ${result.error?.error || result.error}`);
    } else {
      console.log(`⚠️ ${endpoint} - Other error (${result.status}): ${result.error?.error || result.error}`);
    }
  }
}

// Test 4: Test refresh token functionality
async function testRefreshToken(refreshToken) {
  console.log('\n🔄 Testing refresh token functionality...');
  
  try {
    const refreshResponse = await axios.post(`${BASE_URL}/api/auth/refresh`, {
      refreshToken: refreshToken
    });
    
    const { accessToken: newAccessToken } = refreshResponse.data.data;
    const decodedNew = decodeJWT(newAccessToken);
    
    console.log('✅ Refresh token successful');
    console.log('New Access Token Payload:', {
      userId: decodedNew?.userId,
      email: decodedNew?.email,
      role: decodedNew?.role,
      subscription: decodedNew?.subscription
    });
    
    if (!decodedNew?.role || !decodedNew?.subscription) {
      console.error('❌ Missing role or subscription in refreshed token');
      return null;
    }
    
    console.log('✅ Refreshed token contains role and subscription');
    return newAccessToken;
    
  } catch (error) {
    console.error('❌ Refresh token failed:', error.response?.data || error.message);
    throw error;
  }
}

// Main test function
async function runAuthTests() {
  console.log('🚀 Starting Authentication Fix Tests');
  console.log('=====================================');
  
  try {
    // Test 1: Create/verify premium user
    await testCreatePremiumUser();
    
    // Test 2: Login and verify JWT
    const loginResult = await testLoginJWT();
    if (!loginResult) {
      throw new Error('Login test failed');
    }
    
    const { accessToken, refreshToken } = loginResult;
    
    // Test 3: Test premium endpoints
    await testPremiumEndpoints(accessToken);
    
    // Test 4: Test refresh token
    const newAccessToken = await testRefreshToken(refreshToken);
    if (newAccessToken) {
      console.log('\n🔄 Testing premium endpoints with refreshed token...');
      await testPremiumEndpoints(newAccessToken);
    }
    
    console.log('\n✅ All authentication tests completed');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runAuthTests();