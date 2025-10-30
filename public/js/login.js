// Login page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in and redirect to dashboard
    console.log('Login page: Checking for existing session...');
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        console.log('🔍 [LOGIN] Found existing session, validating...');
        console.log('🔍 [LOGIN] Token:', token.substring(0, 20) + '...');
        console.log('🔍 [LOGIN] User data:', user);
        
        try {
            const apiEndpoint = CONFIG.getApiEndpoint('/api/auth/profile');
            
            fetch(apiEndpoint, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    console.log('Login page: Session is valid, checking user subscription...');
                    
                    // Get user data to check subscription
                    const userData = localStorage.getItem('user');
                    if (userData) {
                        try {
                            const user = JSON.parse(userData);
                            const userSubscription = user?.subscription || 'free';
                            const userRole = user?.role || 'user';
                            console.log('Login page: User subscription type:', userSubscription);
                            console.log('Login page: User role:', userRole);
                            
                            if (userSubscription === 'premium' || userSubscription === 'paid' || userRole === 'premium' || userRole === 'admin') {
                                console.log('Login page: Premium user, redirecting to premium dashboard...');
                                window.location.href = '/premium/ai-dashboard';
                            } else {
                                console.log('Login page: Free user, redirecting to regular dashboard...');
                                window.location.href = 'dashboard.html';
                            }
                        } catch (e) {
                            console.log('Login page: Error parsing user data, redirecting to dashboard...');
                            window.location.href = 'dashboard.html';
                        }
                    } else {
                        console.log('Login page: No user data found, redirecting to dashboard...');
                        window.location.href = 'dashboard.html';
                    }
                    return;
                } else {
                    console.log('Login page: Session is invalid, clearing and staying on login page');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('refreshToken');
                }
            })
            .catch(error => {
                console.log('Login page: Session validation error, clearing session');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('refreshToken');
            });
        } catch (error) {
            console.log('Login page: Error during session validation setup:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('refreshToken');
        }
    } else {
        console.log('Login page: No existing session found, staying on login page');
    }

    // Helper UI functions
    const showMsg = (id, text) => { 
        const el = document.getElementById(id); 
        el.textContent = text; 
        el.style.display = 'block'; 
    };
    
    const hideMsg = (id) => { 
        const el = document.getElementById(id); 
        el.style.display = 'none'; 
        el.textContent = ''; 
    };

    // Focus styling for form controls
    document.querySelectorAll('.form-control').forEach(inp => {
        const grp = inp.closest('.form-group');
        inp.addEventListener('focus', () => grp && grp.classList.add('focused'));
        inp.addEventListener('blur', () => grp && grp.classList.remove('focused'));
    });

    // Login form submission handler
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMsg('error'); 
        hideMsg('success');
        
        const identifier = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (!identifier || !password) { 
            showMsg('error', 'يرجى إدخال جميع الحقول المطلوبة'); 
            return; 
        }

        const isEmail = identifier.includes('@');
        const payload = isEmail ? { email: identifier, password } : { username: identifier.toLowerCase(), password };

        const btn = document.querySelector('#login-form button[type=submit]');
        const loading = document.getElementById('loading');

        try {
            btn.disabled = true;
            loading.style.display = 'block';
            
            // Use enhanced fetch with retry logic
            const apiEndpoint = CONFIG.getApiEndpoint('/api/auth/login');
            console.log('🔐 [LOGIN] Attempting login to:', apiEndpoint);
            
            const res = await CONFIG.fetchWithRetry(apiEndpoint, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload),
                cache: 'no-cache',
                credentials: 'same-origin'
            });
            
            loading.style.display = 'none';
            
            let body = {};
            try { 
                const responseText = await res.text();
                console.log('🔐 [LOGIN] Raw response:', responseText);
                body = responseText ? JSON.parse(responseText) : {};
            } catch (parseError) {
                console.error('🔐 [LOGIN] Failed to parse response:', parseError);
                showMsg('error', 'خطأ في تحليل استجابة الخادم');
                return;
            }
            
            const data = body && body.data ? body.data : body;
            
            if (res.ok && body.success) {
                const user = data.user || body.user;
                const accessToken = data.accessToken || body.accessToken || body.token || '';
                const refreshToken = data.refreshToken || body.refreshToken || '';
                
                console.log('🔐 [LOGIN] Login successful, storing authentication data...');
                
                // CRITICAL: Preserve language preference during login
                const currentLanguage = localStorage.getItem('preferredLanguage');
                
                // Ensure access token exists before proceeding
                if (!accessToken) {
                    console.error('🔐 [LOGIN] No access token in response');
                    showMsg('error', 'لم يتم استلام رمز الوصول من الخادم. يرجى المحاولة مرة أخرى.');
                    return;
                }
                
                // Synchronously persist auth data
                localStorage.setItem('token', accessToken);
                if (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                }
                if (refreshToken) {
                    localStorage.setItem('refreshToken', refreshToken);
                }
                localStorage.setItem('sessionTimestamp', String(Date.now()));
                localStorage.setItem('lastActivity', String(Date.now()));
                localStorage.setItem('sessionReady', 'true');
                
                // Restore language preference if it was set
                if (currentLanguage) {
                    localStorage.setItem('preferredLanguage', currentLanguage);
                }
                
                // Verify data was stored correctly
                const storedUser = localStorage.getItem('user');
                const storedToken = localStorage.getItem('token');
                console.log('Login: Auth data stored successfully', { 
                    hasUser: !!storedUser, 
                    hasToken: !!storedToken,
                    preservedLanguage: currentLanguage
                });
                
                // If user is not yet stored, refresh profile using the token
                if (!storedUser && typeof window.sessionManager !== 'undefined') {
                    console.log('🔐 [LOGIN] User not present, refreshing profile via session manager...');
                    try {
                        const ok = await window.sessionManager.validateSession();
                        if (ok && window.sessionManager.currentUser) {
                            localStorage.setItem('user', JSON.stringify(window.sessionManager.currentUser));
                        }
                    } catch (e) {
                        console.warn('🔐 [LOGIN] Session validation after login failed:', e);
                    }
                }
                
                showMsg('success', 'تم تسجيل الدخول بنجاح! جاري التوجيه...');
                
                // Add a small delay to ensure all data is properly stored
                await new Promise(resolve => setTimeout(resolve, 200));
                
                // Check if user is premium based on role or subscription and redirect accordingly
                const userSubscription = user?.subscription || 'free';
                const userRole = user?.role || 'user';
                console.log('Login: User subscription type:', userSubscription, 'User role:', userRole);
                
                if (userSubscription === 'premium' || userSubscription === 'paid' || userRole === 'premium') {
                    console.log('Login: Premium user detected, redirecting to AI dashboard...');
                    window.location.href = '/premium/ai-dashboard';
                } else {
                    console.log('Login: Free user, redirecting to regular dashboard...');
                    window.location.href = 'dashboard.html';
                }
            } else {
                if (res.status === 429) {
                    showMsg('error', 'عدد محاولات تسجيل الدخول كبير، يرجى الانتظار قليلاً');
                } else {
                    const err = body.errorAr || body.error || 'فشل تسجيل الدخول، يرجى المحاولة لاحقاً.';
                    showMsg('error', err);
                }
            }
        } catch (err) {
            loading.style.display = 'none';
            showMsg('error', 'حدث خطأ في الاتصال بالخادم أو انتهت مهلة الطلب.');
        } finally {
            btn.disabled = false;
        }
    });
});