const axios = require('axios');

// Test registration endpoint
async function testRegistration() {
  const testUser = {
    fullName: 'Test User',
    username: 'testuser123',
    email: 'test@example.com',
    password: 'password123'
  };

  try {
    console.log('🧪 Testing registration endpoint...');
    console.log('📤 Sending request to: http://localhost:10000/api/auth/register');
    console.log('📋 Test data:', testUser);

    const response = await axios.post('http://localhost:10000/api/auth/register', testUser, {
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
    const loginResponse = await axios.post('http://localhost:10000/api/auth/login', {
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
async function testDatabaseStatus() {
  try {
    console.log('\n🗄️ Testing database status...');
    const response = await axios.get('http://localhost:10000/api/', {
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
  
  await testDatabaseStatus();
  await testRegistration();
  
  console.log('\n✨ Diagnostics completed!');
}

runTests().catch(console.error);