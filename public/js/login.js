// Login page functionality
document.addEventListener('DOMContentLoaded', function() {
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
                
                localStorage.setItem('user', user ? JSON.stringify(user) : '');
                localStorage.setItem('token', accessToken);
                if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
                
                showMsg('success', 'تم تسجيل الدخول بنجاح! جاري التوجيه...');
                setTimeout(() => { 
                    window.location.href = 'dashboard.html'; 
                }, 1200);
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