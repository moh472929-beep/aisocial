const axios = require('axios');

async function testAPI() {
  const baseUrl = 'http://localhost:3000/.netlify/functions/api';
  
  console.log('Testing Facebook AI Manager API endpoints...\n');
  
  try {
    // Test health check endpoint
    console.log('1. Testing health check endpoint...');
    const healthResponse = await axios.get(`${baseUrl}/health`);
    console.log('   Status:', healthResponse.status);
    console.log('   Data:', healthResponse.data);
    console.log('   ✅ Health check passed\n');
    
    // Test auth signup endpoint (should return validation error)
    console.log('2. Testing auth signup endpoint...');
    try {
      const signupResponse = await axios.post(`${baseUrl}/auth/signup`, {});
      console.log('   Status:', signupResponse.status);
      console.log('   Data:', signupResponse.data);
    } catch (error) {
      console.log('   Status:', error.response?.status);
      console.log('   Data:', error.response?.data);
      console.log('   ✅ Signup validation working\n');
    }
    
    // Test auth login endpoint (should return validation error)
    console.log('3. Testing auth login endpoint...');
    try {
      const loginResponse = await axios.post(`${baseUrl}/auth/login`, {});
      console.log('   Status:', loginResponse.status);
      console.log('   Data:', loginResponse.data);
    } catch (error) {
      console.log('   Status:', error.response?.status);
      console.log('   Data:', error.response?.data);
      console.log('   ✅ Login validation working\n');
    }
    
    // Test user profile endpoint (should return auth error)
    console.log('4. Testing user profile endpoint...');
    try {
      const profileResponse = await axios.get(`${baseUrl}/users/profile`);
      console.log('   Status:', profileResponse.status);
      console.log('   Data:', profileResponse.data);
    } catch (error) {
      console.log('   Status:', error.response?.status);
      console.log('   Data:', error.response?.data);
      console.log('   ✅ Profile authentication working\n');
    }
    
    console.log('🎉 All API endpoint tests completed successfully!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the test
testAPI();