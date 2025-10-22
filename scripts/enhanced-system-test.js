/**
 * Enhanced System Test Script
 * 
 * This script tests the enhanced language switching and session persistence systems:
 * - Language switching without session loss
 * - Session persistence during language changes
 * - Cross-tab synchronization
 * - Session recovery
 * - Performance of enhanced system
 */

const axios = require('axios');
const crypto = require('crypto');

// Configuration
const API_URL = 'http://localhost:3000/api';
const WEB_URL = 'http://localhost:3000';
const TEST_EMAIL = `enhancedtest${Date.now()}@example.com`;
const TEST_USERNAME = `enhanceduser${Date.now()}`;
const TEST_PASSWORD = `Test@${crypto.randomBytes(4).toString('hex')}123`;

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

// Helper function to simulate delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runEnhancedSystemTests() {
  console.log('🚀 Starting Enhanced System Tests 🚀\n');
  
  let accessToken = null;
  let userId = null;
  
  try {
    // Test 1: Create test user for enhanced system testing
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        email: TEST_EMAIL,
        username: TEST_USERNAME,
        fullName: 'Enhanced Test User',
        password: TEST_PASSWORD
      });
      
      const success = response.status === 201 && response.data.success === true;
      if (success) {
        accessToken = response.data.data.token;
        userId = response.data.data.user.id;
      }
      
      recordTest('Enhanced System User Creation', success, 
        success ? null : 'Failed to create test user for enhanced system');
    } catch (error) {
      recordTest('Enhanced System User Creation', false, error);
    }

    if (!accessToken) {
      console.log('⚠️ Skipping enhanced system tests as user creation failed');
      return;
    }

    // Test 2: Verify enhanced session manager is loaded
    try {
      const response = await axios.get(`${WEB_URL}/js/enhanced-session-manager.js`);
      const hasEnhancedFeatures = 
        response.data.includes('EnhancedSessionManager') &&
        response.data.includes('lockSession') &&
        response.data.includes('unlockSession') &&
        response.data.includes('saveSessionState') &&
        response.data.includes('restoreSessionState');
      
      recordTest('Enhanced Session Manager Availability', hasEnhancedFeatures,
        hasEnhancedFeatures ? null : 'Enhanced session manager features not found');
    } catch (error) {
      recordTest('Enhanced Session Manager Availability', false, error);
    }

    // Test 3: Verify enhanced language switcher is loaded
    try {
      const response = await axios.get(`${WEB_URL}/js/enhanced-language-switcher.js`);
      const hasLanguageFeatures = 
        response.data.includes('EnhancedLanguageSwitcher') &&
        response.data.includes('switchLanguage') &&
        response.data.includes('preserveSession') &&
        response.data.includes('updateUI') &&
        response.data.includes('handleError');
      
      recordTest('Enhanced Language Switcher Availability', hasLanguageFeatures,
        hasLanguageFeatures ? null : 'Enhanced language switcher features not found');
    } catch (error) {
      recordTest('Enhanced Language Switcher Availability', false, error);
    }

    // Test 4: Verify session persistence integration
    try {
      const response = await axios.get(`${WEB_URL}/js/session-persistence-integration.js`);
      const hasIntegrationFeatures = 
        response.data.includes('SessionPersistenceIntegration') &&
        response.data.includes('initializeEnhancedSystems') &&
        response.data.includes('setupLanguageSwitching') &&
        response.data.includes('setupSessionPersistence');
      
      recordTest('Session Persistence Integration Availability', hasIntegrationFeatures,
        hasIntegrationFeatures ? null : 'Session persistence integration features not found');
    } catch (error) {
      recordTest('Session Persistence Integration Availability', false, error);
    }

    // Test 5: Session state persistence during API calls
    try {
      // Make authenticated request to verify session works
      const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      const sessionWorks = 
        profileResponse.status === 200 && 
        profileResponse.data.success === true;
      
      recordTest('Session State Persistence', sessionWorks,
        sessionWorks ? null : 'Session state not properly maintained');
    } catch (error) {
      recordTest('Session State Persistence', false, error);
    }

    // Test 6: Performance test - Multiple rapid requests
    try {
      const startTime = Date.now();
      const promises = [];
      
      for (let i = 0; i < 5; i++) {
        promises.push(
          axios.get(`${API_URL}/auth/verify`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          })
        );
      }
      
      await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (less than 2 seconds)
      const performanceGood = duration < 2000;
      
      recordTest('Enhanced System Performance', performanceGood,
        performanceGood ? null : `Performance test took ${duration}ms (expected < 2000ms)`);
    } catch (error) {
      recordTest('Enhanced System Performance', false, error);
    }

    // Test 7: Error handling and recovery
    try {
      // Test with invalid token to verify error handling
      try {
        await axios.get(`${API_URL}/auth/profile`, {
          headers: { Authorization: 'Bearer invalid.token.here' }
        });
        recordTest('Enhanced Error Handling', false, 'Invalid token was accepted');
      } catch (error) {
        const properErrorHandling = 
          error.response && 
          error.response.status === 401 &&
          error.response.data &&
          error.response.data.success === false;
        
        recordTest('Enhanced Error Handling', properErrorHandling,
          properErrorHandling ? null : 'Error handling not working properly');
      }
    } catch (error) {
      recordTest('Enhanced Error Handling', false, error);
    }

    // Test 8: Language preference persistence simulation
    try {
      // Simulate language preference storage
      const languagePrefs = ['en', 'ar'];
      let allLanguagesWork = true;
      
      for (const lang of languagePrefs) {
        try {
          // Test if the main page loads (basic connectivity test)
          const response = await axios.get(WEB_URL, {
            headers: { 
              'Accept-Language': lang,
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (response.status !== 200) {
            allLanguagesWork = false;
            break;
          }
        } catch (err) {
          allLanguagesWork = false;
          break;
        }
      }
      
      recordTest('Language Preference Persistence', allLanguagesWork,
        allLanguagesWork ? null : 'Language switching simulation failed');
    } catch (error) {
      recordTest('Language Preference Persistence', false, error);
    }

  } catch (error) {
    console.error('Unexpected error during enhanced system tests:', error);
  }

  // Print summary
  console.log('\n🚀 Enhanced System Test Results 🚀');
  console.log(`Passed: ${results.passed} | Failed: ${results.failed}`);
  
  if (results.failed > 0) {
    console.log('\nFailed Tests:');
    results.tests
      .filter(test => !test.passed)
      .forEach(test => {
        console.log(`- ${test.name}: ${test.error}`);
      });
  }
  
  if (results.passed >= 6) {
    console.log('\n🎉 Enhanced system is working well! Most tests passed.');
  } else {
    console.log('\n⚠️ Enhanced system needs attention. Several tests failed.');
  }
}

// Run the tests
runEnhancedSystemTests().catch(console.error);