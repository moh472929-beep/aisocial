const { runAuthTests } = require('./tests/auth.test');
const { runUserTests } = require('./tests/users.test');
const { runFacebookTests } = require('./tests/facebook.test');
const { runAiTests } = require('./tests/ai.test');
const { runAnalyticsTests } = require('./tests/analytics.test');
const { runAutoResponseTests } = require('./tests/autoresponse.test');

async function runAllTests() {
    console.log('🚀 Starting Facebook AI Manager Test Suite...\n');
    
    let totalPassed = 0;
    let totalTests = 0;
    
    try {
        // Run Authentication Tests
        console.log('🔐 Authentication Tests');
        console.log('====================');
        const authResult = await runAuthTests();
        totalTests += 3; // We know auth tests run 3 tests
        totalPassed += authResult ? 3 : 0;
        console.log('\n');
        
        // Run User Management Tests
        console.log('👥 User Management Tests');
        console.log('======================');
        const userResult = await runUserTests();
        totalTests += 3; // We know user tests run 3 tests
        totalPassed += userResult ? 3 : 0;
        console.log('\n');
        
        // Run Facebook Integration Tests
        console.log('📘 Facebook Integration Tests');
        console.log('============================');
        const facebookResult = await runFacebookTests();
        totalTests += 2; // We know facebook tests run 2 tests
        totalPassed += facebookResult ? 2 : 0;
        console.log('\n');
        
        // Run AI Functionality Tests
        console.log('🤖 AI Functionality Tests');
        console.log('========================');
        const aiResult = await runAiTests();
        totalTests += 2; // We know AI tests run 2 tests
        totalPassed += aiResult ? 2 : 0;
        console.log('\n');
        
        // Run Analytics Tests
        console.log('📊 Analytics Tests');
        console.log('=================');
        const analyticsResult = await runAnalyticsTests();
        totalTests += 3; // Analytics tests run 3 tests
        totalPassed += analyticsResult ? 3 : 0;
        console.log('\n');
        
        // Run Auto-Response and Competitor Analysis Tests
        console.log('💬 Auto-Response & Competitor Analysis Tests');
        console.log('============================================');
        const autoResponseResult = await runAutoResponseTests();
        totalTests += 3; // Auto-response tests run 3 tests
        totalPassed += autoResponseResult ? 3 : 0;
        console.log('\n');
        
        // Final Summary
        console.log('📋 Test Suite Summary');
        console.log('====================');
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${totalPassed}`);
        console.log(`Failed: ${totalTests - totalPassed}`);
        console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
        
        if (totalPassed === totalTests) {
            console.log('\n🎉 All tests passed! The application is working correctly.');
            process.exit(0);
        } else {
            console.log('\n❌ Some tests failed. Please check the output above.');
            process.exit(1);
        }
    } catch (error) {
        console.error('💥 Test suite failed with an unexpected error:', error);
        process.exit(1);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests();
}

module.exports = { runAllTests };