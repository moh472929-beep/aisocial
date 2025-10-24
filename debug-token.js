const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function debugToken() {
  try {
    console.log('🔍 اختبار إنشاء والتحقق من الرمز المميز...');

    // 1. إنشاء مستخدم جديد
    const timestamp = Date.now();
    const demoUserData = {
      name: 'Demo User',
      fullName: 'Demo User Test',
      email: `demo${timestamp}@example.com`,
      username: `demo${timestamp}`,
      password: 'DemoPassword123!',
      language: 'ar'
    };

    console.log('1. إنشاء مستخدم جديد...');
    const signupResponse = await axios.post(`${API_BASE}/auth/signup`, demoUserData);
    
    if (!signupResponse.data.success) {
      throw new Error('فشل في إنشاء المستخدم');
    }

    console.log('✅ تم إنشاء المستخدم بنجاح');

    // 2. تسجيل الدخول
    console.log('2. تسجيل الدخول...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: demoUserData.email,
      password: demoUserData.password
    });

    if (!loginResponse.data.success) {
      throw new Error('فشل في تسجيل الدخول');
    }

    const responseData = loginResponse.data.data || loginResponse.data;
    const token = responseData.token || responseData.accessToken;
    console.log('✅ تم تسجيل الدخول بنجاح');
    console.log('📋 Login Response:', JSON.stringify(loginResponse.data, null, 2));
    
    if (!token) {
      throw new Error('لم يتم العثور على الرمز المميز في الاستجابة');
    }
    
    console.log('🔑 الرمز المميز:', token.substring(0, 50) + '...');

    // 3. اختبار الرمز المميز مع endpoint محمي
    console.log('3. اختبار الرمز المميز مع profile endpoint...');
    const profileResponse = await axios.get(`${API_BASE}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (profileResponse.data.success) {
      console.log('✅ الرمز المميز يعمل مع profile endpoint');
      console.log('👤 بيانات المستخدم:', profileResponse.data.user);
    }

    // 4. اختبار الرمز المميز مع payment endpoint
    console.log('4. اختبار الرمز المميز مع payment endpoint...');
    try {
      const paymentResponse = await axios.post(`${API_BASE}/payment/process`, {
        cardNumber: '4111111111111111',
        expiryDate: '12/25',
        cvv: '123',
        cardholderName: 'Demo User',
        plan: 'premium',
        amount: 29.99,
        currency: 'USD'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (paymentResponse.data.success) {
        console.log('✅ الرمز المميز يعمل مع payment endpoint');
        console.log('💳 نتيجة الدفع:', paymentResponse.data);
      }
    } catch (paymentError) {
      console.log('❌ خطأ في payment endpoint:');
      console.log('Status:', paymentError.response?.status);
      console.log('Error:', paymentError.response?.data);
      
      // Let's check the headers being sent
      console.log('📋 Headers المرسلة:');
      console.log('Authorization:', `Bearer ${token.substring(0, 20)}...`);
    }

  } catch (error) {
    console.error('❌ خطأ في اختبار الرمز المميز:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

debugToken();