const axios = require('axios');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:3000';

// Helper function to decode JWT token
function decodeJWT(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

// Test with existing user credentials
async function testWithExistingUser() {
  console.log('🧪 Premium Endpoints Test with Existing User');
  console.log('============================================\n');
  
  // Use a known test user (you may need to create this manually first)
  const testCredentials = {
    email: 'test@example.com',
    password: 'TestPassword123!'
  };
  
  try {
    console.log('🔑 Logging in with existing user...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, testCredentials);
    
    const { accessToken } = loginResponse.data.data;
    console.log('✅ Login successful');
    
    // Decode and verify JWT contains subscription field
    const decodedToken = decodeJWT(accessToken);
    if (decodedToken && decodedToken.subscription) {
      console.log(`✅ JWT contains subscription: ${decodedToken.subscription}`);
    } else {
      console.log('⚠️ JWT missing subscription field');
    }
    
    // Define premium endpoints to test
    const premiumEndpoints = [
      { path: '/api/analytics/fetch', method: 'POST' },
      { path: '/api/facebook/pages', method: 'GET' },
      { path: '/api/autoresponse/settings', method: 'GET' }
    ];
    
    console.log('\n📊 Testing Premium Endpoints with Free User Token');
    console.log('================================================\n');
    
    for (const endpoint of premiumEndpoints) {
      try {
        const config = {
          method: endpoint.method,
          url: `${BASE_URL}${endpoint.path}`,
          headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        };
        
        // Add minimal body for POST requests
        if (endpoint.method === 'POST') {
          config.data = { test: true };
        }
        
        const response = await axios(config);
        console.log(`❌ ${endpoint.path} - Unexpected success: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(response.data)}`);
      } catch (error) {
        if (error.response) {
          const status = error.response.status;
          if (status === 403) {
            console.log(`✅ ${endpoint.path} - Correctly blocked free user (403)`);
          } else if (status === 401) {
            console.log(`⚠️ ${endpoint.path} - Authentication issue (401)`);
          } else {
            console.log(`⚠️ ${endpoint.path} - Unexpected status: ${status}`);
            console.log(`   Error: ${error.response.data?.error || error.message}`);
          }
        } else {
          console.log(`❌ ${endpoint.path} - Network error: ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('❌ User not found. Please create a test user first:');
      console.log('   POST /api/auth/signup');
      console.log('   {');
      console.log('     "username": "testuser",');
      console.log('     "email": "test@example.com",');
      console.log('     "password": "TestPassword123!",');
      console.log('     "fullName": "Test User"');
      console.log('   }');
    } else {
      console.error('❌ Login failed:', error.response?.status, error.response?.data);
    }
  }
  
  console.log('\n🏁 Existing user test finished');
}

// Run the test
testWithExistingUser().catch(error => {
  console.error('❌ Test suite failed:', error.message);
});