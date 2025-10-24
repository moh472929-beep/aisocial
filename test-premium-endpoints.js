const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

// Test configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const BASE_URL = 'http://localhost:3000';

console.log('🧪 Premium Endpoints Test');
console.log('=========================\n');

// Helper function to generate test token
function generateTestToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { 
        expiresIn: '1h',
        audience: 'facebook-ai-manager',
        issuer: 'facebook-ai-manager'
    });
}

// Test premium endpoint access
async function testPremiumEndpoint(endpoint, userType, subscription) {
    console.log(`🔍 Testing ${endpoint} with ${userType} user (${subscription} subscription)`);
    
    const token = generateTestToken({
        userId: `test-${userType}-user`,
        email: `${userType}@test.com`,
        role: 'user',
        subscription: subscription
    });
    
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const status = response.status;
        const statusText = response.statusText;
        
        if (subscription === 'premium' && status === 200) {
            console.log(`   ✅ Premium user granted access (${status})`);
            return true;
        } else if (subscription === 'free' && status === 403) {
            console.log(`   ✅ Free user correctly denied access (${status})`);
            return true;
        } else {
            console.log(`   ❌ Unexpected response: ${status} ${statusText}`);
            return false;
        }
        
    } catch (error) {
        console.log(`   ❌ Request failed: ${error.message}`);
        return false;
    }
}

// Test authentication endpoints
async function testAuthEndpoints() {
    console.log('🔐 Testing Authentication Endpoints');
    console.log('-----------------------------------');
    
    // Test signup endpoint
    console.log('Testing signup endpoint...');
    try {
        const signupResponse = await fetch(`${BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'testuser@example.com',
                password: 'testpassword123',
                fullName: 'Test User'
            })
        });
        
        if (signupResponse.ok) {
            const data = await signupResponse.json();
            console.log('   ✅ Signup endpoint accessible');
            
            // Check if JWT contains role and subscription
            if (data.accessToken) {
                const decoded = jwt.decode(data.accessToken);
                console.log('   JWT payload:', {
                    role: decoded?.role,
                    subscription: decoded?.subscription
                });
                
                if (decoded?.role && decoded?.subscription) {
                    console.log('   ✅ JWT contains role and subscription');
                } else {
                    console.log('   ❌ JWT missing role or subscription');
                }
            }
        } else {
            console.log(`   ⚠️  Signup response: ${signupResponse.status}`);
        }
    } catch (error) {
        console.log(`   ❌ Signup test failed: ${error.message}`);
    }
    
    console.log('');
}

// Main test function
async function runPremiumEndpointTests() {
    console.log('🚀 Starting Premium Endpoint Tests...\n');
    
    // Test authentication first
    await testAuthEndpoints();
    
    // List of premium endpoints to test
    const premiumEndpoints = [
        '/api/trending-topics/premium-feature',
        '/api/facebook-automation/premium-feature',
        '/api/analytics/premium-feature',
        '/api/competitor/premium-feature',
        '/api/autoresponse/premium-feature'
    ];
    
    let totalTests = 0;
    let passedTests = 0;
    
    for (const endpoint of premiumEndpoints) {
        console.log(`\n📊 Testing endpoint: ${endpoint}`);
        console.log('---'.repeat(endpoint.length / 3));
        
        // Test with free user (should be denied)
        totalTests++;
        const freeResult = await testPremiumEndpoint(endpoint, 'free', 'free');
        if (freeResult) passedTests++;
        
        // Test with premium user (should be allowed)
        totalTests++;
        const premiumResult = await testPremiumEndpoint(endpoint, 'premium', 'premium');
        if (premiumResult) passedTests++;
        
        console.log('');
    }
    
    console.log('📊 Test Results Summary');
    console.log('=======================');
    console.log(`🎯 Overall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All premium endpoint tests passed!');
    } else {
        console.log('⚠️  Some tests failed. Check server logs for details.');
    }
    
    return { passed: passedTests, total: totalTests };
}

// Export for use in other test files
module.exports = {
    runPremiumEndpointTests,
    testPremiumEndpoint,
    testAuthEndpoints,
    generateTestToken
};

// Run tests if this file is executed directly
if (require.main === module) {
    runPremiumEndpointTests().catch(console.error);
}