const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test premium endpoints with a simple approach
async function testPremiumEndpoints() {
  console.log('🧪 Simple Premium Endpoints Test');
  console.log('================================\n');
  
  // Define premium endpoints to test
  const premiumEndpoints = [
    { path: '/api/analytics/fetch', method: 'POST' },
    { path: '/api/facebook/pages', method: 'GET' },
    { path: '/api/autoresponse/settings', method: 'GET' }
  ];
  
  console.log('📊 Testing Premium Endpoints (No Auth - Should get 401)');
  console.log('======================================================\n');
  
  for (const endpoint of premiumEndpoints) {
    try {
      const config = {
        method: endpoint.method,
        url: `${BASE_URL}${endpoint.path}`,
        timeout: 5000
      };
      
      // Add minimal body for POST requests
      if (endpoint.method === 'POST') {
        config.data = { test: true };
        config.headers = { 'Content-Type': 'application/json' };
      }
      
      const response = await axios(config);
      console.log(`❌ ${endpoint.path} - Unexpected success: ${response.status}`);
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          console.log(`✅ ${endpoint.path} - Correctly requires authentication (401)`);
        } else if (status === 403) {
          console.log(`✅ ${endpoint.path} - Correctly blocked access (403)`);
        } else {
          console.log(`⚠️ ${endpoint.path} - Unexpected status: ${status}`);
        }
      } else {
        console.log(`❌ ${endpoint.path} - Network error: ${error.message}`);
      }
    }
  }
  
  console.log('\n📊 Testing with Invalid Token (Should get 401)');
  console.log('===============================================\n');
  
  for (const endpoint of premiumEndpoints) {
    try {
      const config = {
        method: endpoint.method,
        url: `${BASE_URL}${endpoint.path}`,
        headers: { 
          'Authorization': 'Bearer invalid.token.here',
          'Content-Type': 'application/json'
        },
        timeout: 5000
      };
      
      // Add minimal body for POST requests
      if (endpoint.method === 'POST') {
        config.data = { test: true };
      }
      
      const response = await axios(config);
      console.log(`❌ ${endpoint.path} - Invalid token accepted: ${response.status}`);
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          console.log(`✅ ${endpoint.path} - Correctly rejected invalid token (401)`);
        } else {
          console.log(`⚠️ ${endpoint.path} - Unexpected status: ${status}`);
        }
      } else {
        console.log(`❌ ${endpoint.path} - Network error: ${error.message}`);
      }
    }
  }
  
  console.log('\n🏁 Simple premium endpoints test finished');
}

// Run the test
testPremiumEndpoints().catch(error => {
  console.error('❌ Test suite failed:', error.message);
});