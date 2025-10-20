// Login page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in and redirect to dashboard
    console.log('Login page: Checking for existing session...');
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        console.log('Login page: Found existing session, validating...');
        
        // Validate session with backend
        fetch('/.netlify/functions/api/auth/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                console.log('Login page: Session is valid, redirecting to dashboard...');
                window.location.href = 'dashboard.html';
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
            
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 15000);
            
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                cache: 'no-cache',
                credentials: 'same-origin',
                signal: ctrl.signal
            });
            
            clearTimeout(timer);
            loading.style.display = 'none';
            
            let body = {};
            try { 
                body = await res.json(); 
            } catch {}
            
            const data = body && body.data ? body.data : body;
            
            if (res.ok && body.success) {
                const user = data.user || body.user;
                const accessToken = data.accessToken || body.accessToken || body.token || '';
                const refreshToken = data.refreshToken || body.refreshToken || '';
                
                console.log('Login: Storing authentication data...');
                
                // CRITICAL: Preserve language preference during login
                const currentLanguage = localStorage.getItem('preferredLanguage');
                
                localStorage.setItem('user', user ? JSON.stringify(user) : '');
                localStorage.setItem('token', accessToken);
                if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
                
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
                
                showMsg('success', 'تم تسجيل الدخول بنجاح! جاري التوجيه...');
                
                // Increased delay to ensure localStorage operations complete
                setTimeout(() => { 
                    console.log('Login: Redirecting to dashboard...');
                    window.location.href = 'dashboard.html'; 
                }, 1500); // Increased from 1200ms to 1500ms
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