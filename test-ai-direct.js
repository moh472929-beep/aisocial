const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Helper function to make HTTP requests
async function makeRequest(method, url, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 500,
      error: error.response?.data || error.message,
      data: error.response?.data
    };
  }
}

async function testAIDirectly() {
  console.log('🧪 اختبار مباشر للذكاء الاصطناعي');
  console.log('================================');

  // First, create a user and get token
  console.log('\n1. إنشاء مستخدم جديد...');
  const userData = {
    username: `aitest${Date.now()}`,
    fullName: 'AI Test User',
    email: `ai-test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    language: 'ar'
  };

  const registerResult = await makeRequest('POST', '/api/auth/register', userData);
  if (!registerResult.success) {
    console.log('❌ فشل في إنشاء المستخدم:', registerResult.error);
    return;
  }

  console.log('✅ تم إنشاء المستخدم بنجاح');

  // Login to get token
  console.log('\n2. تسجيل الدخول...');
  const loginResult = await makeRequest('POST', '/api/auth/login', {
    email: userData.email,
    password: userData.password
  });

  if (!loginResult.success) {
    console.log('❌ فشل في تسجيل الدخول:', loginResult.error);
    return;
  }

  const token = loginResult.data.data?.token || loginResult.data.token;
  console.log('✅ تم تسجيل الدخول بنجاح');
  console.log('🔑 Token:', token ? 'موجود' : 'غير موجود');
  console.log('📊 بيانات تسجيل الدخول:', JSON.stringify(loginResult.data, null, 2));

  // Upgrade to premium
  console.log('\n3. ترقية الحساب إلى مميز...');
  const upgradeResult = await makeRequest('POST', '/api/payment/process', {
    cardNumber: '4111111111111111',
    expiryDate: '12/25',
    cvv: '123',
    cardholderName: 'Test User',
    plan: 'premium'
  }, {
    'Authorization': `Bearer ${token}`
  });

  if (!upgradeResult.success) {
    console.log('❌ فشل في ترقية الحساب:', upgradeResult.error);
    return;
  }

  console.log('✅ تم ترقية الحساب بنجاح');

  // Test AI chat
  console.log('\n4. اختبار الدردشة مع الذكاء الاصطناعي...');
  const aiResult = await makeRequest('POST', '/api/ai/chat', {
    message: 'مرحبا، كيف حالك؟'
  }, {
    'Authorization': `Bearer ${token}`
  });

  console.log('📊 نتيجة طلب الذكاء الاصطناعي:');
  console.log('الحالة:', aiResult.status);
  console.log('النجاح:', aiResult.success);
  
  if (aiResult.success) {
    console.log('✅ الذكاء الاصطناعي يعمل بشكل صحيح');
    console.log('الرد:', aiResult.data);
  } else {
    console.log('❌ فشل في الوصول للذكاء الاصطناعي');
    console.log('الخطأ:', aiResult.error);
    console.log('البيانات الكاملة:', JSON.stringify(aiResult, null, 2));
  }

  // Check user data to verify subscription
  console.log('\n5. فحص بيانات المستخدم...');
  const userResult = await makeRequest('GET', '/api/users/profile', null, {
    'Authorization': `Bearer ${token}`
  });

  if (userResult.success) {
    const user = userResult.data?.data?.user || userResult.data?.user;
    console.log('📊 بيانات المستخدم:');
    console.log('البيانات الكاملة:', JSON.stringify(userResult.data, null, 2));
    console.log('نوع الاشتراك:', user?.subscription?.type);
    console.log('حالة النشاط:', user?.subscription?.isActive);
    console.log('صلاحيات الذكاء الاصطناعي:', user?.aiPermissions?.enabled);
  } else {
    console.log('❌ فشل في جلب بيانات المستخدم:', userResult.error);
  }
}

// Run the test
testAIDirectly().catch(console.error);