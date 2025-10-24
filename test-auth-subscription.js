const axios = require('axios');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:3000';

// Helper function to decode JWT without verification (for inspection)
function decodeJWTUnsafe(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('JWT decode error:', error.message);
    return null;
  }
}

// Generate unique test user data
const timestamp = Date.now();
const testUser = {
  fullName: `Test User ${timestamp}`,
  username: `testuser${timestamp}`,
  email: `test${timestamp}@example.com`,
  password: 'TestPassword123!'
};

async function testAuthWithSubscription() {
  console.log('🧪 Testing Authentication with Subscription Field\n');

  try {
    // Step 1: Sign up new user
    console.log('📝 Step 1: Creating new user account...');
    console.log(`   Email: ${testUser.email}`);
    
    const signupResponse = await axios.post(`${BASE_URL}/api/auth/signup`, testUser);
    
    if (signupResponse.status === 201) {
      console.log('✅ User created successfully');
      
      // Decode the signup token
      const signupToken = signupResponse.data.data.token;
      console.log('🔍 Raw signup token:', signupToken ? 'Present' : 'Missing');
      
      if (signupToken) {
        const signupPayload = decodeJWTUnsafe(signupToken);
        console.log('📋 Signup JWT payload:');
        console.log(`   User ID: ${signupPayload?.userId}`);
        console.log(`   Email: ${signupPayload?.email}`);
        console.log(`   Role: ${signupPayload?.role}`);
        console.log(`   Subscription: ${signupPayload?.subscription}`);
        
        if (signupPayload?.subscription) {
          console.log('✅ Subscription field present in signup JWT');
        } else {
          console.log('❌ ISSUE: Subscription field missing in signup JWT');
        }
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
      
      if (accessPayload?.subscription) {
        console.log('✅ Subscription field present in access token');
      } else {
        console.log('❌ ISSUE: Subscription field missing in access token');
      }
      
      // Decode refresh token
      const refreshPayload = decodeJWTUnsafe(refreshToken);
      console.log('📋 Refresh Token payload:');
      console.log(`   User ID: ${refreshPayload?.userId}`);
      console.log(`   Email: ${refreshPayload?.email}`);
      console.log(`   Role: ${refreshPayload?.role}`);
      console.log(`   Subscription: ${refreshPayload?.subscription}`);
      
      if (refreshPayload?.subscription) {
        console.log('✅ Subscription field present in refresh token');
      } else {
        console.log('❌ ISSUE: Subscription field missing in refresh token');
      }

      console.log('\n' + '='.repeat(50) + '\n');

      // Step 3: Test refresh token
      console.log('📝 Step 3: Testing refresh token...');
      
      const refreshResponse = await axios.post(`${BASE_URL}/api/auth/refresh`, {
        refreshToken: refreshToken
      });

      if (refreshResponse.status === 200) {
        console.log('✅ Refresh token successful');
        
        const newAccessToken = refreshResponse.data.data.accessToken;
        const newAccessPayload = decodeJWTUnsafe(newAccessToken);
        
        console.log('📋 New Access Token payload:');
        console.log(`   User ID: ${newAccessPayload?.userId}`);
        console.log(`   Email: ${newAccessPayload?.email}`);
        console.log(`   Role: ${newAccessPayload?.role}`);
        console.log(`   Subscription: ${newAccessPayload?.subscription}`);
        
        if (newAccessPayload?.subscription) {
          console.log('✅ Subscription field present in refreshed access token');
        } else {
          console.log('❌ ISSUE: Subscription field missing in refreshed access token');
        }
      } else {
        console.log('❌ Refresh token failed');
        return;
      }

      console.log('\n' + '='.repeat(50) + '\n');

      // Step 4: Test premium endpoint access
      console.log('📝 Step 4: Testing premium endpoint access...');
      
      const premiumEndpoints = [
        '/api/analytics/fetch',
        '/api/facebook/pages', 
        '/api/autoresponse/settings'
      ];
      
      for (const endpoint of premiumEndpoints) {
        console.log(`\n🔍 Testing ${endpoint}...`);
        
        try {
          const method = endpoint.includes('settings') ? 'GET' : 'POST';
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
          
          const premiumResponse = await axios(requestConfig);
          
          if (premiumResponse.status === 200) {
            console.log(`   ✅ ${endpoint} - Access granted (unexpected for free user)`);
          } else {
            console.log(`   ❌ ${endpoint} - Unexpected response: ${premiumResponse.status}`);
          }
        } catch (error) {
          if (error.response?.status === 403) {
            console.log(`   ✅ ${endpoint} - Access correctly denied (403) for free user`);
            console.log(`   📋 Response: ${error.response?.data?.message || error.response?.data?.error}`);
          } else {
            console.log(`   ❌ ${endpoint} - Unexpected error: ${error.response?.status} ${error.response?.data?.error || error.message}`);
          }
        }
      }

    } else {
      console.log('❌ Login failed');
      return;
    }

  } catch (error) {
    console.log('❌ API Error:', error.response?.status, error.response?.data);
  }

  console.log('\n🏁 Authentication with subscription test finished');
}

testAuthWithSubscription();