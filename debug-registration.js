const axios = require('axios');

// Resolve an accessible base URL from common ports
async function resolveBaseURL() {
  const candidates = [
    process.env.PORT ? `http://localhost:${process.env.PORT}` : null,
    'http://localhost:3000',
    'http://localhost:10000',
    'http://localhost:4001',
  ].filter(Boolean);

  for (const base of candidates) {
    try {
      await axios.get(`${base}/api/`, { timeout: 2000 });
      return base;
    } catch {}
  }
  return 'http://localhost:3000';
}

// Test registration endpoint
async function testRegistration(base) {
  const testUser = {
    fullName: 'Test User',
    username: 'testuser123',
    email: 'test@example.com',
    password: 'Password123!'
  };

  try {
    console.log('🧪 Testing registration endpoint...');
    console.log(`📤 Sending request to: ${base}/api/auth/register`);
    console.log('📋 Test data:', testUser);

    const response = await axios.post(`${base}/api/auth/register`, testUser, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Registration successful!');
    console.log('📊 Response status:', response.status);
    console.log('📄 Response data:', JSON.stringify(response.data, null, 2));

    // Test if user can login
    console.log('\n🔐 Testing login with created user...');
    const loginResponse = await axios.post(`${base}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Login successful!');
    console.log('📊 Login response status:', loginResponse.status);
    console.log('📄 Login response data:', JSON.stringify(loginResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Registration test failed!');
    
    if (error.response) {
      console.error('📊 Error status:', error.response.status);
      console.error('📄 Error response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('📡 No response received:', error.message);
    } else {
      console.error('⚠️ Request setup error:', error.message);
    }
  }
}

// Test database connection status
async function testDatabaseStatus(base) {
  try {
    console.log('\n🗄️ Testing API status...');
    const response = await axios.get(`${base}/api/`, {
      timeout: 5000
    });

    console.log('✅ API is running!');
    console.log('📄 API status:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ API test failed!');
    if (error.response) {
      console.error('📊 Error status:', error.response.status);
      console.error('📄 Error response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('📡 Connection error:', error.message);
    }
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting registration diagnostics...\n');
  const base = await resolveBaseURL();
  console.log(`🔎 Resolved API base: ${base}`);

  await testDatabaseStatus(base);
  await testRegistration(base);
  
  console.log('\n✨ Diagnostics completed!');
}

runTests().catch(console.error);