const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testSimpleLogin() {
  console.log('🔑 Testing simple login...');
  
  try {
    // Test with existing user or create new one
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'premium-test@example.com',
      password: 'TestPassword123!'
    });
    
    console.log('✅ Login successful');
    console.log('Response data:', JSON.stringify(loginResponse.data, null, 2));
    
    const { accessToken, refreshToken, user } = loginResponse.data.data;
    
    console.log('\n📋 User data from response:');
    console.log({
      id: user.id,
      email: user.email,
      role: user.role,
      subscription: user.subscription,
      postsRemaining: user.postsRemaining,
      aiEnabled: user.aiEnabled
    });
    
    console.log('\n🔍 Raw tokens:');
    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);
    
    // Try to decode without verification first
    const jwt = require('jsonwebtoken');
    
    console.log('\n📋 Access Token Decoded (no verification):');
    const accessDecoded = jwt.decode(accessToken);
    console.log(JSON.stringify(accessDecoded, null, 2));
    
    console.log('\n📋 Refresh Token Decoded (no verification):');
    const refreshDecoded = jwt.decode(refreshToken);
    console.log(JSON.stringify(refreshDecoded, null, 2));
    
    // Test a premium endpoint
    console.log('\n🔒 Testing premium endpoint access...');
    
    try {
      const premiumResponse = await axios.post(`${BASE_URL}/api/analytics/fetch`, {}, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Premium endpoint accessible:', premiumResponse.status);
      
    } catch (error) {
      console.log('❌ Premium endpoint error:', {
        status: error.response?.status,
        error: error.response?.data
      });
    }
    
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
  }
}

testSimpleLogin();