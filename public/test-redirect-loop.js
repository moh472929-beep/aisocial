const puppeteer = require('puppeteer');

async function testRedirectLoop() {
    console.log('Starting redirect loop test...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    try {
        console.log('\n=== Testing Login Page Redirect Logic ===');
        
        // Clear any existing session data
        await page.evaluateOnNewDocument(() => {
            localStorage.clear();
        });
        
        // Test 1: Login page without session (should stay on login page)
        console.log('\n1. Testing login page without session...');
        await page.goto('http://localhost:3000/login.html', { waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const currentUrl1 = page.url();
        console.log(`Current URL: ${currentUrl1}`);
        
        if (currentUrl1.includes('login.html')) {
            console.log('✅ PASS: Login page stays on login when no session exists');
        } else {
            console.log('❌ FAIL: Login page redirected when no session exists');
        }
        
        // Test 2: Simulate login and check redirect
        console.log('\n2. Simulating login process...');
        
        // Fill login form
        await page.type('#username', 'test@example.com');
        await page.type('#password', 'testpassword');
        
        // Mock successful login response
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (request.url().includes('/api/auth/login')) {
                request.respond({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: true,
                        user: { id: 1, email: 'test@example.com', name: 'Test User' },
                        accessToken: 'mock-token-123',
                        refreshToken: 'mock-refresh-token-123'
                    })
                });
            } else {
                request.continue();
            }
        });
        
        // Submit login form
        await page.click('button[type="submit"]');
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for redirect
        
        const currentUrl2 = page.url();
        console.log(`URL after login: ${currentUrl2}`);
        
        if (currentUrl2.includes('dashboard.html')) {
            console.log('✅ PASS: Login redirects to dashboard after successful login');
        } else {
            console.log('❌ FAIL: Login did not redirect to dashboard after successful login');
        }
        
        // Test 3: Check if dashboard validates session properly
        console.log('\n3. Testing dashboard session validation...');
        
        // Mock profile validation response
        page.removeAllListeners('request');
        page.on('request', (request) => {
            if (request.url().includes('/api/auth/profile')) {
                request.respond({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: true,
                        user: { id: 1, email: 'test@example.com', name: 'Test User' }
                    })
                });
            } else {
                request.continue();
            }
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for session validation
        
        const currentUrl3 = page.url();
        console.log(`URL after dashboard session validation: ${currentUrl3}`);
        
        if (currentUrl3.includes('dashboard.html')) {
            console.log('✅ PASS: Dashboard stays on dashboard with valid session');
        } else {
            console.log('❌ FAIL: Dashboard redirected away with valid session');
        }
        
        // Test 4: Test login page with existing valid session
        console.log('\n4. Testing login page with existing valid session...');
        
        await page.goto('http://localhost:3000/login.html', { waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const currentUrl4 = page.url();
        console.log(`URL when visiting login with existing session: ${currentUrl4}`);
        
        if (currentUrl4.includes('dashboard.html')) {
            console.log('✅ PASS: Login page redirects to dashboard when session exists');
        } else {
            console.log('❌ FAIL: Login page did not redirect to dashboard when session exists');
        }
        
        console.log('\n=== Test Summary ===');
        console.log('Redirect loop test completed. Check the results above.');
        
    } catch (error) {
        console.error('Test error:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testRedirectLoop().catch(console.error);