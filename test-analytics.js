const axios = require('axios');

const baseUrl = 'http://localhost:3000/api';

async function testAnalytics() {
  console.log('🔍 اختبار endpoint التحليلات...\n');

  // بيانات المستخدم للاختبار
  const userData = {
    fullName: 'Analytics Test User',
    username: `analyticstest${Date.now()}`,
    email: `analytics-test-${Date.now()}@example.com`,
    password: 'TestPassword123!'
  };

  let token = null;

  try {
    // 1. إنشاء مستخدم جديد
    console.log('1. إنشاء مستخدم جديد...');
    const registerResponse = await axios.post(`${baseUrl}/auth/register`, userData);
    console.log('✅ تم إنشاء المستخدم بنجاح');

    // 2. تسجيل الدخول
    console.log('\n2. تسجيل الدخول...');
    const loginResponse = await axios.post(`${baseUrl}/auth/login`, {
      email: userData.email,
      password: userData.password
    });
    
    token = loginResponse.data.data.token;
    console.log('✅ تم تسجيل الدخول بنجاح');

    // 3. ترقية الحساب إلى مميز
    console.log('\n3. ترقية الحساب إلى مميز...');
    const upgradeResponse = await axios.post(`${baseUrl}/payment/process`, {
      cardNumber: '4242424242424242',
      expiryDate: '12/25',
      cvv: '123',
      cardholderName: 'Test User',
      plan: 'premium'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ تم ترقية الحساب بنجاح');

    // 4. اختبار endpoint لوحة التحليلات
    console.log('\n4. اختبار endpoint لوحة التحليلات...');
    const analyticsResponse = await axios.get(`${baseUrl}/analytics/dashboard?period=daily`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('📊 نتيجة طلب التحليلات:');
    console.log('الحالة:', analyticsResponse.status);
    console.log('النجاح:', analyticsResponse.data.success);
    console.log('الرسالة:', analyticsResponse.data.message);
    console.log('عدد البيانات:', analyticsResponse.data.analytics?.length || 0);
    
    if (analyticsResponse.data.success) {
      console.log('✅ endpoint التحليلات يعمل بشكل صحيح');
    } else {
      console.log('❌ فشل في الوصول إلى التحليلات');
    }

    // 5. اختبار endpoint جلب البيانات
    console.log('\n5. اختبار endpoint جلب البيانات...');
    try {
      const fetchResponse = await axios.post(`${baseUrl}/analytics/fetch`, {
        period: 'daily'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📊 نتيجة جلب البيانات:');
      console.log('الحالة:', fetchResponse.status);
      console.log('النجاح:', fetchResponse.data.success);
      console.log('الرسالة:', fetchResponse.data.error || fetchResponse.data.message);
      
    } catch (fetchError) {
      console.log('📊 نتيجة جلب البيانات:');
      console.log('الحالة:', fetchError.response?.status);
      console.log('الخطأ:', fetchError.response?.data?.error);
    }

    // 6. اختبار endpoint معالجة البيانات
    console.log('\n6. اختبار endpoint معالجة البيانات...');
    try {
      const processResponse = await axios.post(`${baseUrl}/analytics/process`, {
        period: 'daily'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📊 نتيجة معالجة البيانات:');
      console.log('الحالة:', processResponse.status);
      console.log('النجاح:', processResponse.data.success);
      console.log('الرسالة:', processResponse.data.error || processResponse.data.message);
      
    } catch (processError) {
      console.log('📊 نتيجة معالجة البيانات:');
      console.log('الحالة:', processError.response?.status);
      console.log('الخطأ:', processError.response?.data?.error);
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.response?.data || error.message);
  }
}

testAnalytics();