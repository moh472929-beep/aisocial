const axios = require('axios');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:3000';

// Helper function to get JWT secret
function getJWTSecret() {
  return process.env.JWT_SECRET || 'your-secret-key';
}

// Helper function to decode JWT without verification (for testing)
function decodeJWTUnsafe(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('JWT decode error:', error.message);
    return null;
  }
}

// Helper function to create and login user
async function createAndLoginUser(userType, subscription = 'free') {
  const timestamp = Date.now() + Math.floor(Math.random() * 10000);
  const email = `${userType}-user-${timestamp}@example.com`;
  const fullName = `${userType} User ${timestamp}`;
  
  try {
    console.log(`📝 Creating ${userType} user: ${email}`);
    
    // Step 1: Create user
    const signupResponse = await axios.post(`${BASE_URL}/api/auth/signup`, {
      username: fullName.toLowerCase().replace(/\s+/g, '_'),
      email: email,
      password: 'TestPassword123!',
      fullName: fullName
    });
    
    console.log('✅ User created successfully');
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 2: Login to get token
    console.log(`🔑 Logging in ${userType} user...`);
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: email,
      password: 'TestPassword123!'
    });
    
    const { accessToken, refreshToken } = loginResponse.data.data;
    console.log('✅ Login successful');
    
    // Decode and verify JWT contains subscription field
    const decodedToken = decodeJWT(accessToken);
    if (decodedToken && decodedToken.subscription) {
      console.log(`✅ JWT contains subscription: ${decodedToken.subscription}`);
    } else {
      console.log('⚠️ JWT missing subscription field');
    }
    
    return { accessToken, refreshToken, email, userId: signupResponse.data.data.user.id };
  } catch (error) {
    console.error(`❌ Error creating ${userType} user:`, error.response?.status, error.response?.data);
    throw error;
  }
}

// Helper function to test an endpoint
async function testEndpoint(endpoint, method, accessToken, expectedStatus, userType) {
  try {
    const requestConfig = {
      method: method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    // Add minimal body for POST requests
    if (method === 'POST') {
      requestConfig.data = {};
    }
    
    const response = await axios(requestConfig);
    
    if (response.status === expectedStatus) {
      console.log(`   ✅ ${endpoint} - Expected ${expectedStatus} for ${userType} user`);
      return true;
    } else {
      console.log(`   ❌ ${endpoint} - Got ${response.status}, expected ${expectedStatus} for ${userType} user`);
      return false;
    }
    
  } catch (error) {
    const actualStatus = error.response?.status;
    if (actualStatus === expectedStatus) {
      console.log(`   ✅ ${endpoint} - Expected ${expectedStatus} for ${userType} user`);
      console.log(`   📋 Response: ${error.response?.data?.message || error.response?.data?.error}`);
      return true;
    } else {
      console.log(`   ❌ ${endpoint} - Got ${actualStatus}, expected ${expectedStatus} for ${userType} user`);
      console.log(`   📋 Error: ${error.response?.data?.error || error.message}`);
      return false;
    }
  }
}

// Main test function
async function testPremiumEndpoints() {
  console.log('🧪 Premium Endpoints Access Control Test');
  console.log('=========================================\n');
  
  const timestamp = Date.now();
  
  try {
    // Create free user
    const freeUser = await createAndLoginUser('free');
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Create premium user (for now, just another free user since we don't have premium upgrade)
    const premiumUser = await createAndLoginUser('premium');
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Define premium endpoints to test
    const premiumEndpoints = [
      { path: '/api/analytics/fetch', method: 'POST' },
      { path: '/api/facebook/pages', method: 'GET' },
      { path: '/api/autoresponse/settings', method: 'GET' },
      { path: '/api/analytics/dashboard', method: 'GET' },
      { path: '/api/facebook/generate-post', method: 'POST' }
    ];
    
    console.log('📊 Testing Premium Endpoints Access Control');
    console.log('===========================================\n');
    
    let totalTests = 0;
    let passedTests = 0;
    
    for (const endpoint of premiumEndpoints) {
      console.log(`🔍 Testing ${endpoint.path} (${endpoint.method})`);
      console.log('-'.repeat(50));
      
      // Test with free user (should get 403)
      totalTests++;
      const freeResult = await testEndpoint(
        endpoint.path, 
        endpoint.method, 
        freeUser.accessToken, 
        403, 
        'free'
      );
      if (freeResult) passedTests++;
      
      // Test with premium user (should get 200 or other success status)
      totalTests++;
      const premiumResult = await testEndpoint(
        endpoint.path, 
        endpoint.method, 
        premiumUser.accessToken, 
        200, 
        'premium'
      );
      if (premiumResult) passedTests++;
      
      console.log('');
    }
    
    console.log('📊 Test Results Summary');
    console.log('=======================');
    console.log(`🎯 Overall: ${passedTests}/${totalTests} tests passed`);
    console.log(`📈 Success Rate: ${Math.round((passedTests/totalTests) * 100)}%`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All premium endpoint access control tests passed!');
    } else {
      console.log('⚠️  Some tests failed. Premium access control may need attention.');
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
  
  console.log('\n🏁 Premium endpoints test finished');
}

// Run the test
if (require.main === module) {
  testPremiumEndpoints().catch(console.error);
}

module.exports = { testPremiumEndpoints };