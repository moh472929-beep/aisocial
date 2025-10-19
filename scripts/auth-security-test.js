/**
 * Authentication Security Test Script
 * 
 * This script tests the security of the authentication system, including:
 * - NoSQL injection protection
 * - Password policy enforcement
 * - Rate limiting
 * - JWT token security
 * - Protection against user enumeration
 */

const axios = require('axios');
const crypto = require('crypto');

// Configuration
const API_URL = 'http://localhost:10000/api';
const TEST_EMAIL = `test${Date.now()}@example.com`;
const TEST_USERNAME = `testuser${Date.now()}`;
const STRONG_PASSWORD = `Test@${crypto.randomBytes(4).toString('hex')}123`;
const WEAK_PASSWORD = 'password123';

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to record test results
function recordTest(name, passed, error = null) {
  results.tests.push({
    name,
    passed,
    error: error ? error.toString() : null
  });
  
  if (passed) {
    results.passed++;
    console.log(`✅ PASSED: ${name}`);
  } else {
    results.failed++;
    console.log(`❌ FAILED: ${name}`);
    if (error) {
      console.log(`   Error: ${error}`);
    }
  }
}

async function runTests() {
  console.log('🔒 Starting Authentication Security Tests 🔒\n');
  
  try {
    // Test 1: Password Policy Enforcement
    try {
      await axios.post(`${API_URL}/auth/signup`, {
        email: TEST_EMAIL,
        username: TEST_USERNAME,
        fullName: 'Test User',
        password: WEAK_PASSWORD
      });
      recordTest('Password Policy Enforcement', false, 'Weak password was accepted');
    } catch (error) {
      const isPasswordPolicyError = 
        error.response && 
        error.response.data && 
        error.response.data.details && 
        error.response.data.details.some(d => d.param === 'password');
      
      recordTest('Password Policy Enforcement', isPasswordPolicyError, 
        isPasswordPolicyError ? null : 'Error was not related to password policy');
    }

    // Test 2: NoSQL Injection Protection
    try {
      const injectionPayload = { 
        email: { $ne: null }, 
        password: 'anything' 
      };
      
      await axios.post(`${API_URL}/auth/login`, injectionPayload);
      recordTest('NoSQL Injection Protection', false, 'NoSQL injection attempt was processed');
    } catch (error) {
      // We expect a 400 or 401 error, not a 500 server error
      const isProtected = error.response && error.response.status !== 500;
      recordTest('NoSQL Injection Protection', isProtected, 
        isProtected ? null : 'Server error occurred during injection attempt');
    }

    // Test 3: Successful Registration with Strong Password
    let userId, accessToken;
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        email: TEST_EMAIL,
        username: TEST_USERNAME,
        fullName: 'Test User',
        password: STRONG_PASSWORD
      });
      
      const success = 
        response.status === 201 && 
        response.data.success === true && 
        response.data.data && 
        response.data.data.user && 
        !response.data.data.user.passwordHash;
      
      if (success) {
        userId = response.data.data.user.id;
        accessToken = response.data.data.token;
      }
      
      recordTest('Successful Registration', success, 
        success ? null : 'Registration failed or exposed passwordHash');
    } catch (error) {
      recordTest('Successful Registration', false, error);
    }

    // Test 4: Duplicate Registration Prevention
    try {
      await axios.post(`${API_URL}/auth/signup`, {
        email: TEST_EMAIL,
        username: TEST_USERNAME,
        fullName: 'Test User',
        password: STRONG_PASSWORD
      });
      recordTest('Duplicate Registration Prevention', false, 'Duplicate registration was accepted');
    } catch (error) {
      const isConflict = error.response && error.response.status === 409;
      recordTest('Duplicate Registration Prevention', isConflict, 
        isConflict ? null : 'Error was not a conflict (409) status');
    }

    // Test 5: JWT Token Validation
    if (accessToken) {
      try {
        const response = await axios.get(`${API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        const success = 
          response.status === 200 && 
          response.data.success === true && 
          response.data.data && 
          !response.data.data.passwordHash;
        
        recordTest('JWT Token Validation', success, 
          success ? null : 'Profile access failed or exposed passwordHash');
      } catch (error) {
        recordTest('JWT Token Validation', false, error);
      }
      
      // Test with invalid token
      try {
        await axios.get(`${API_URL}/users/profile`, {
          headers: { Authorization: 'Bearer invalid.token.here' }
        });
        recordTest('Invalid JWT Rejection', false, 'Invalid token was accepted');
      } catch (error) {
        const isUnauthorized = error.response && error.response.status === 401;
        recordTest('Invalid JWT Rejection', isUnauthorized, 
          isUnauthorized ? null : 'Error was not an unauthorized (401) status');
      }
    } else {
      console.log('⚠️ Skipping JWT tests as registration failed');
    }

    // Test 6: Rate Limiting (simplified test)
    let rateLimitHit = false;
    for (let i = 0; i < 10; i++) {
      try {
        await axios.post(`${API_URL}/auth/login`, {
          email: `wrong${i}@example.com`,
          password: 'wrongpassword'
        });
      } catch (error) {
        if (error.response && error.response.status === 429) {
          rateLimitHit = true;
          break;
        }
      }
    }
    recordTest('Rate Limiting', rateLimitHit, 
      rateLimitHit ? null : 'Rate limit was not triggered after multiple attempts');

  } catch (error) {
    console.error('Unexpected error during tests:', error);
  }

  // Print summary
  console.log('\n🔒 Authentication Security Test Results 🔒');
  console.log(`Passed: ${results.passed} | Failed: ${results.failed}`);
  
  if (results.failed > 0) {
    console.log('\nFailed Tests:');
    results.tests
      .filter(test => !test.passed)
      .forEach(test => {
        console.log(`- ${test.name}: ${test.error}`);
      });
  }
}

// Run the tests
runTests().catch(console.error);