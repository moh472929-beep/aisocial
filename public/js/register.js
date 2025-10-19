// Helper UI functions
const showMsg = (id, text) => { 
    const el = document.getElementById(id); 
    el.textContent = text; 
    el.style.display = 'block'; 
};

const hideMsg = (id) => { 
    const el = document.getElementById(id); 
    el.style.display = 'none'; 
    el.textContent=''; 
};

// Add focus styling to form controls
document.addEventListener('DOMContentLoaded', () => {
    // Focus styling
    document.querySelectorAll('.form-control').forEach(inp => {
        const grp = inp.closest('.form-group');
        inp.addEventListener('focus', () => grp && grp.classList.add('focused'));
        inp.addEventListener('blur', () => grp && grp.classList.remove('focused'));
    });

    // Registration form submission
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMsg('error'); 
        hideMsg('success');
        
        const username = document.getElementById('username').value.trim().toLowerCase();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const fullName = document.getElementById('fullName').value.trim();
        
        if (!username || !email || !password || !fullName) { 
            showMsg('error', 'يرجى إدخال جميع الحقول المطلوبة'); 
            return; 
        }

        const btn = document.querySelector('#register-form button[type=submit]');
        const loading = document.getElementById('loading');

        try {
            btn.disabled = true;
            loading.style.display = 'block';
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 15000);
            
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, username, email, password }),
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
                showMsg('success', 'تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.');
                setTimeout(() => { 
                    window.location.href = 'login.html'; 
                }, 1200);
            } else {
                const err = body.errorAr || body.error || 'فشل إنشاء الحساب، يرجى المحاولة لاحقاً.';
                showMsg('error', err);
            }
        } catch (err) {
            loading.style.display = 'none';
            showMsg('error', 'حدث خطأ في الاتصال بالخادم أو انتهت مهلة الطلب.');
        } finally {
            btn.disabled = false;
        }
    });
});