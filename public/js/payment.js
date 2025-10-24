// Payment page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load saved language preference immediately
    const savedLang = localStorage.getItem('preferredLanguage') || 'ar';
    if (savedLang === 'ar') {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ar';
    } else {
        document.documentElement.dir = 'ltr';
        document.documentElement.lang = savedLang;
    }
    
    // Payment functionality
    let selectedPaymentMethod = 'card';
    
    // Payment method selection
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', function() {
            document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
            this.classList.add('selected');
            selectedPaymentMethod = this.dataset.method;
            
            // Show/hide form fields based on payment method
            const form = document.getElementById('payment-form');
            if (selectedPaymentMethod === 'card') {
                form.style.display = 'block';
            } else {
                form.style.display = 'none';
            }
        });
    });
    
    // Format card number
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }
    
    // Format expiry date
    const expiryDateInput = document.getElementById('expiry-date');
    if (expiryDateInput) {
        expiryDateInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
    
    // Format CVV
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    }
    
    // Form submission
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const errorMessage = document.getElementById('error-message');
            const successMessage = document.getElementById('success-message');
            const paymentText = document.getElementById('payment-text');
            const loading = document.getElementById('loading');
            
            // Hide previous messages
            if (errorMessage) errorMessage.style.display = 'none';
            if (successMessage) successMessage.style.display = 'none';
            
            // Validate form
            const cardNumber = document.getElementById('card-number').value;
            const expiryDate = document.getElementById('expiry-date').value;
            const cvv = document.getElementById('cvv').value;
            const cardholderName = document.getElementById('cardholder-name').value;
            const billingEmail = document.getElementById('billing-email').value;
            
            if (!cardNumber || !expiryDate || !cvv || !cardholderName || !billingEmail) {
                if (errorMessage) {
                    errorMessage.textContent = 'يرجى ملء جميع الحقول المطلوبة';
                    errorMessage.style.display = 'block';
                }
                return;
            }
            
            if (cardNumber.replace(/\s/g, '').length < 16) {
                if (errorMessage) {
                    errorMessage.textContent = 'رقم البطاقة غير صحيح';
                    errorMessage.style.display = 'block';
                }
                return;
            }
            
            // Show loading
            if (paymentText) paymentText.style.display = 'none';
            if (loading) loading.style.display = 'block';
            
            try {
                // Get token from localStorage
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    throw new Error('لم يتم العثور على رمز التفويض. يرجى تسجيل الدخول مرة أخرى.');
                }

                // Send payment request to API
                const response = await fetch(CONFIG.getApiEndpoint('/api/payment/process'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        cardNumber: cardNumber.replace(/\s/g, ''),
                        expiryDate,
                        cvv,
                        cardholderName,
                        billingEmail,
                        plan: 'premium'
                    })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    // Update localStorage with new token and user data
                    if (result.data.accessToken) {
                        localStorage.setItem('accessToken', result.data.accessToken);
                    }
                    if (result.data.user) {
                        localStorage.setItem('user', JSON.stringify(result.data.user));
                    }

                    // Show success message
                    if (successMessage) {
                        successMessage.textContent = result.data.message || 'تم الدفع بنجاح! جاري تفعيل اشتراكك...';
                        successMessage.style.display = 'block';
                    }

                    // Redirect to appropriate dashboard after 2 seconds
                    setTimeout(() => {
                        // Check user subscription type for proper redirection
                        const userData = localStorage.getItem('user');
                        if (userData) {
                            try {
                                const user = JSON.parse(userData);
                                const userSubscription = user?.subscription || 'free';
                                console.log('Payment: User subscription type after payment:', userSubscription);
                                
                                if (userSubscription === 'premium' || userSubscription === 'paid') {
                                    console.log('Payment: Premium user, redirecting to AI dashboard...');
                                    window.location.href = 'ai-dashboard.html';
                                } else {
                                    console.log('Payment: Free user, redirecting to regular dashboard...');
                                    window.location.href = 'dashboard.html';
                                }
                            } catch (e) {
                                console.log('Payment: Error parsing user data, redirecting to dashboard...');
                                window.location.href = 'dashboard.html';
                            }
                        } else {
                            console.log('Payment: No user data found, redirecting to dashboard...');
                            window.location.href = 'dashboard.html';
                        }
                    }, 2000);
                } else {
                    throw new Error(result.message || result.error || 'حدث خطأ في معالجة الدفع');
                }

            } catch (error) {
                console.error('Payment error:', error);
                if (errorMessage) {
                    errorMessage.textContent = error.message || 'حدث خطأ في معالجة الدفع. يرجى المحاولة مرة أخرى.';
                    errorMessage.style.display = 'block';
                }
            } finally {
                // Hide loading
                if (paymentText) paymentText.style.display = 'block';
                if (loading) loading.style.display = 'none';
            }
        });
    }
    
    // Add visual effects to form fields
    document.querySelectorAll('.form-control').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
});