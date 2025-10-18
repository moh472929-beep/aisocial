// Simple feature access control for free vs paid pages
// Usage: set window.pageAccess = 'free' | 'paid' before DOMContentLoaded
(function() {
  function showUpgradeToast(message) {
    const existing = document.getElementById('upgrade-notice');
    if (existing) {
      existing.querySelector('.upgrade-text').textContent = message;
      existing.style.display = 'block';
      setTimeout(() => existing.style.display = 'none', 2500);
      return;
    }
    const notice = document.createElement('div');
    notice.id = 'upgrade-notice';
    notice.className = 'upgrade-notice';
    const icon = document.createElement('i');
    icon.className = 'fas fa-lock';
    const text = document.createElement('span');
    text.className = 'upgrade-text';
    text.textContent = message || 'هذه ميزة للمستخدمين المدفوعة فقط.';
    notice.appendChild(icon);
    notice.appendChild(text);
    document.body.appendChild(notice);
    setTimeout(() => notice.style.display = 'none', 2500);
  }

  function disableElement(el) {
    el.classList.add('disabled-feature');
    el.setAttribute('aria-disabled', 'true');
    // Disable nested form controls
    const controls = el.matches('button,input,select,textarea') ? [el] : el.querySelectorAll('button,input,select,textarea');
    controls.forEach(c => { try { c.disabled = true; } catch(_) {} });
    // Add lock badge
    if (!el.querySelector('.lock-badge')) {
      const badge = document.createElement('span');
      badge.className = 'lock-badge';
      badge.innerHTML = '<i class="fas fa-lock"></i>';
      el.appendChild(badge);
    }
    // Intercept clicks
    el.addEventListener('click', function(e) {
      // Allow navigating to logout/settings or language changes when not tagged
      e.preventDefault();
      e.stopPropagation();
      showUpgradeToast('الرجاء الترقية للوصول إلى هذه الميزة.');
    }, { once: true });
  }

  function enableElement(el) {
    el.classList.remove('disabled-feature');
    el.removeAttribute('aria-disabled');
    const controls = el.matches('button,input,select,textarea') ? [el] : el.querySelectorAll('button,input,select,textarea');
    controls.forEach(c => { try { c.disabled = false; } catch(_) {} });
    // Remove any previous click prevention
    // Note: We can't easily remove specific listeners; enabling pointer interactions is sufficient
  }

  function applyAccessControl() {
    const isPaid = (window.pageAccess || 'free') === 'paid';
    const paidEls = document.querySelectorAll('[data-required-plan="paid"]');
    paidEls.forEach(el => {
      if (!isPaid) disableElement(el); else enableElement(el);
    });
  }

  window.applyAccessControl = applyAccessControl;
  document.addEventListener('DOMContentLoaded', applyAccessControl);
})();