/**
 * Enhanced Files Test Script
 * 
 * This script tests the availability and functionality of enhanced system files:
 * - Enhanced session manager
 * - Enhanced language switcher  
 * - Session persistence integration
 * - File structure and content validation
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const WEB_URL = 'http://localhost:3000';
const PROJECT_ROOT = process.cwd();

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

// Helper function to check if file exists and has content
function checkFileExists(filePath, description) {
  try {
    const fullPath = path.join(PROJECT_ROOT, filePath);
    const exists = fs.existsSync(fullPath);
    if (exists) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const hasContent = content.length > 100; // Should have substantial content
      recordTest(`${description} - File Exists and Has Content`, hasContent,
        hasContent ? null : 'File exists but appears to be empty or too small');
      return content;
    } else {
      recordTest(`${description} - File Exists and Has Content`, false, 'File does not exist');
      return null;
    }
  } catch (error) {
    recordTest(`${description} - File Exists and Has Content`, false, error);
    return null;
  }
}

// Helper function to check file content for required features
function checkFileFeatures(content, features, description) {
  if (!content) return false;
  
  const missingFeatures = features.filter(feature => !content.includes(feature));
  const hasAllFeatures = missingFeatures.length === 0;
  
  recordTest(`${description} - Required Features`, hasAllFeatures,
    hasAllFeatures ? null : `Missing features: ${missingFeatures.join(', ')}`);
  
  return hasAllFeatures;
}

async function runEnhancedFilesTests() {
  console.log('📁 Starting Enhanced Files Tests 📁\n');
  
  try {
    // Test 1: Enhanced Session Manager File
    const sessionManagerContent = checkFileExists(
      'public/js/enhanced-session-manager.js',
      'Enhanced Session Manager'
    );
    
    if (sessionManagerContent) {
      checkFileFeatures(sessionManagerContent, [
        'EnhancedSessionManager',
        'lockSession',
        'unlockSession',
        'saveSessionState',
        'restoreSessionState',
        'handleSessionError',
        'isSessionLocked'
      ], 'Enhanced Session Manager');
    }

    // Test 2: Enhanced Language Switcher File
    const languageSwitcherContent = checkFileExists(
      'public/js/enhanced-language-switcher.js',
      'Enhanced Language Switcher'
    );
    
    if (languageSwitcherContent) {
      checkFileFeatures(languageSwitcherContent, [
        'EnhancedLanguageSwitcher',
        'switchLanguage',
        'preserveSession',
        'updateUI',
        'handleError',
        'saveLanguagePreference',
        'updateTextDirection'
      ], 'Enhanced Language Switcher');
    }

    // Test 3: Session Persistence Integration File
    const integrationContent = checkFileExists(
      'public/js/session-persistence-integration.js',
      'Session Persistence Integration'
    );
    
    if (integrationContent) {
      checkFileFeatures(integrationContent, [
        'SessionPersistenceIntegration',
        'initializeEnhancedSystems',
        'setupLanguageSwitching',
        'setupSessionPersistence',
        'handleLanguageSwitch',
        'monitorSessionHealth'
      ], 'Session Persistence Integration');
    }

    // Test 4: Web Server Accessibility
    try {
      const response = await axios.get(`${WEB_URL}/js/enhanced-session-manager.js`);
      const isAccessible = response.status === 200 && response.data.length > 100;
      recordTest('Enhanced Session Manager - Web Accessibility', isAccessible,
        isAccessible ? null : 'File not accessible via web server');
    } catch (error) {
      recordTest('Enhanced Session Manager - Web Accessibility', false, error);
    }

    try {
      const response = await axios.get(`${WEB_URL}/js/enhanced-language-switcher.js`);
      const isAccessible = response.status === 200 && response.data.length > 100;
      recordTest('Enhanced Language Switcher - Web Accessibility', isAccessible,
        isAccessible ? null : 'File not accessible via web server');
    } catch (error) {
      recordTest('Enhanced Language Switcher - Web Accessibility', false, error);
    }

    try {
      const response = await axios.get(`${WEB_URL}/js/session-persistence-integration.js`);
      const isAccessible = response.status === 200 && response.data.length > 100;
      recordTest('Session Persistence Integration - Web Accessibility', isAccessible,
        isAccessible ? null : 'File not accessible via web server');
    } catch (error) {
      recordTest('Session Persistence Integration - Web Accessibility', false, error);
    }

    // Test 5: Main Application Accessibility
    try {
      const response = await axios.get(WEB_URL);
      const isMainPageAccessible = response.status === 200;
      recordTest('Main Application - Web Accessibility', isMainPageAccessible,
        isMainPageAccessible ? null : 'Main application not accessible');
    } catch (error) {
      recordTest('Main Application - Web Accessibility', false, error);
    }

    // Test 6: Implementation Guide File
    const guideContent = checkFileExists(
      'IMPLEMENTATION_GUIDE.md',
      'Implementation Guide'
    );
    
    if (guideContent) {
      checkFileFeatures(guideContent, [
        'Enhanced Session Management',
        'Enhanced Language Switching',
        'Session Persistence',
        'Cross-tab Synchronization',
        'Error Handling'
      ], 'Implementation Guide');
    }

    // Test 7: Deployment Checklist Updates
    const checklistContent = checkFileExists(
      'WEB_DEPLOYMENT_CHECKLIST.md',
      'Web Deployment Checklist'
    );
    
    if (checklistContent) {
      checkFileFeatures(checklistContent, [
        'نظام تبديل اللغة المحسن',
        'نظام الحفاظ على الجلسة',
        'enhanced-session-manager',
        'enhanced-language-switcher',
        'session-persistence-integration'
      ], 'Web Deployment Checklist');
    }

    // Test 8: File Permissions and Structure
    try {
      const jsDir = path.join(PROJECT_ROOT, 'public', 'js');
      const jsFiles = fs.readdirSync(jsDir);
      
      const enhancedFiles = jsFiles.filter(file => 
        file.includes('enhanced') || file.includes('session-persistence')
      );
      
      const hasAllEnhancedFiles = enhancedFiles.length >= 3;
      recordTest('Enhanced Files - Directory Structure', hasAllEnhancedFiles,
        hasAllEnhancedFiles ? null : `Only found ${enhancedFiles.length} enhanced files, expected at least 3`);
    } catch (error) {
      recordTest('Enhanced Files - Directory Structure', false, error);
    }

  } catch (error) {
    console.error('Unexpected error during enhanced files tests:', error);
  }

  // Print summary
  console.log('\n📁 Enhanced Files Test Results 📁');
  console.log(`Passed: ${results.passed} | Failed: ${results.failed}`);
  
  if (results.failed > 0) {
    console.log('\nFailed Tests:');
    results.tests
      .filter(test => !test.passed)
      .forEach(test => {
        console.log(`- ${test.name}: ${test.error}`);
      });
  }
  
  if (results.passed >= 10) {
    console.log('\n🎉 Enhanced system files are properly set up! Most tests passed.');
  } else if (results.passed >= 6) {
    console.log('\n⚠️ Enhanced system files are mostly working but need some attention.');
  } else {
    console.log('\n❌ Enhanced system files need significant attention. Many tests failed.');
  }
}

// Run the tests
runEnhancedFilesTests().catch(console.error);