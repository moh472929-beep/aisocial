const axios = require('axios');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:3000';

// Helper function to get JWT secret (mirrors server logic)
function getJWTSecret() {
  return process.env.JWT_SECRET || process.env.SESSION_SECRET || 'facebook-ai-manager-secret-key-2025';
}

// Helper function to decode JWT without verification (for inspection)
function decodeJWTUnsafe(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('JWT decode error:', error.message);
    return null;
  }
}

// Test user data
const testUser = {
  fullName: 'Test User Complete Final',
  username: 'testcompletefinal',
  email: 'test-complete-final@example.com',
  password: 'TestPassword123!'
};

async function testCompleteAuthFlow() {
  console.log('🧪 Testing Complete Authentication Flow with Subscription Field\n');

  try {
    // Step 1: Sign up new user
    console.log('📝 Step 1: Creating new user account...');
    
    const signupResponse = await axios.post(`${BASE_URL}/api/auth/signup`, testUser);
    
    if (signupResponse.status === 201) {
      console.log('✅ User created successfully');
      
      // Decode the signup token
      const signupToken = signupResponse.data.data.token;
      console.log('🔍 Raw signup token:', signupToken);
      const signupPayload = decodeJWTUnsafe(signupToken);
      console.log('🔍 Decoded payload:', JSON.stringify(signupPayload, null, 2));
      
      console.log('📋 Signup JWT payload:');
      console.log(`   User ID: ${signupPayload?.userId}`);
      console.log(`   Email: ${signupPayload?.email}`);
      console.log(`   Role: ${signupPayload?.role}`);
      console.log(`   Subscription: ${signupPayload?.subscription}`);
      
      if (!signupPayload?.subscription) {
        console.log('❌ ISSUE: Subscription field missing in signup JWT');
      } else {
        console.log('✅ Subscription field present in signup JWT');
      }
    } else {
      console.log('❌ User creation failed');
      return;
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Step 2: Login with the created user
    console.log('📝 Step 2: Logging in with created user...');
    
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      identifier: testUser.email,
      password: testUser.password
    });

    if (loginResponse.status === 200) {
      console.log('✅ Login successful');
      
      const { accessToken, refreshToken } = loginResponse.data.data;
      
      // Decode access token
      const accessPayload = decodeJWTUnsafe(accessToken);
      console.log('📋 Access Token payload:');
      console.log(`   User ID: ${accessPayload?.userId}`);
      console.log(`   Email: ${accessPayload?.email}`);
      console.log(`   Role: ${accessPayload?.role}`);
      console.log(`   Subscription: ${accessPayload?.subscription}`);
      
      if (!accessPayload?.subscription) {
        console.log('❌ ISSUE: Subscription field missing in access token');
      } else {
        console.log('✅ Subscription field present in access token');
      }

      // Decode refresh token
      const refreshPayload = decodeJWTUnsafe(refreshToken);
      console.log('📋 Refresh Token payload:');
      console.log(`   User ID: ${refreshPayload?.userId}`);
      console.log(`   Email: ${refreshPayload?.email}`);
      console.log(`   Role: ${refreshPayload?.role}`);
      console.log(`   Subscription: ${refreshPayload?.subscription}`);
      
      if (!refreshPayload?.subscription) {
        console.log('❌ ISSUE: Subscription field missing in refresh token');
      } else {
        console.log('✅ Subscription field present in refresh token');
      }

      console.log('\n' + '='.repeat(50) + '\n');

      // Step 3: Test refresh token functionality
      console.log('📝 Step 3: Testing refresh token...');
      
      const refreshResponse = await axios.post(`${BASE_URL}/api/auth/refresh`, {
        refreshToken: refreshToken
      });

      if (refreshResponse.status === 200) {
        console.log('✅ Token refresh successful');
        
        const newAccessToken = refreshResponse.data.data.accessToken;
        const newAccessPayload = decodeJWTUnsafe(newAccessToken);
        
        console.log('📋 New Access Token payload:');
        console.log(`   User ID: ${newAccessPayload?.userId}`);
        console.log(`   Email: ${newAccessPayload?.email}`);
        console.log(`   Role: ${newAccessPayload?.role}`);
        console.log(`   Subscription: ${newAccessPayload?.subscription}`);
        
        if (!newAccessPayload?.subscription) {
          console.log('❌ ISSUE: Subscription field missing in refreshed access token');
        } else {
          console.log('✅ Subscription field present in refreshed access token');
        }
      } else {
        console.log('❌ Token refresh failed');
      }

      console.log('\n' + '='.repeat(50) + '\n');

      // Step 4: Test access to free endpoint (should work)
      console.log('📝 Step 4: Testing access to free endpoint...');
      
      try {
        const freeResponse = await axios.get(`${BASE_URL}/api/analytics/dashboard`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (freeResponse.status === 200) {
          console.log('✅ Free endpoint access successful');
        }
      } catch (error) {
        if (error.response?.status === 403) {
          console.log('❌ Free endpoint access denied (unexpected)');
          console.log(`   Error: ${error.response.data.error}`);
        } else {
          console.log(`❌ Free endpoint error: ${error.message}`);
        }
      }

      console.log('\n' + '='.repeat(50) + '\n');

      // Step 5: Test access to premium endpoint (should fail for free user)
      console.log('📝 Step 5: Testing access to premium endpoint (should fail)...');
      
      try {
        const premiumResponse = await axios.get(`${BASE_URL}/api/ai/chat`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (premiumResponse.status === 200) {
          console.log('❌ UNEXPECTED: Premium endpoint access successful for free user');
        }
      } catch (error) {
        if (error.response?.status === 403) {
          console.log('✅ Premium endpoint correctly denied for free user');
          console.log(`   Error: ${error.response.data.error}`);
        } else {
          console.log(`❌ Premium endpoint error: ${error.message}`);
        }
      }

    } else {
      console.log('❌ Login failed');
    }

  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Network Error:', error.message);
    }
  }
}

// Run the test
testCompleteAuthFlow().then(() => {
  console.log('\n🏁 Complete authentication flow test finished');
}).catch(error => {
  console.error('❌ Test failed:', error);
});