const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test configuration
const testConfig = {
  // Use existing test user to avoid rate limiting
  email: 'test@example.com',
  password: 'password123',
  paymentDetails: {
    cardNumber: '4111111111111111',
    expiryDate: '12/25',
    cvv: '123',
    cardholderName: 'Test User'
  }
};

async function testPremiumUpgrade() {
  console.log('🧪 اختبار ترقية الحساب إلى مميز');
  console.log('=====================================\n');

  try {
    // Step 1: Login with existing user
    console.log('📝 الخطوة 1: تسجيل الدخول');
    console.log('---------------------------');
    
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      identifier: testConfig.email,
      password: testConfig.password
    });

    if (!loginResponse.data.success) {
      throw new Error('فشل تسجيل الدخول');
    }

    const { token, user } = loginResponse.data.data;
    console.log('✅ تم تسجيل الدخول بنجاح');
    console.log(`👤 المستخدم: ${user.fullName} (${user.email})`);
    console.log(`📊 الاشتراك الحالي: ${user.subscription}`);
    console.log(`🤖 الذكاء الاصطناعي: ${user.aiEnabled ? 'مفعل' : 'غير مفعل'}\n`);

    // Step 2: Check current subscription status
    console.log('📝 الخطوة 2: التحقق من حالة الاشتراك');
    console.log('----------------------------------');
    
    const subscriptionResponse = await axios.get(`${BASE_URL}/api/payment/subscription`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('📊 حالة الاشتراك الحالية:');
    console.log(JSON.stringify(subscriptionResponse.data, null, 2));
    console.log();

    // Step 3: Test premium feature access (before upgrade)
    console.log('📝 الخطوة 3: اختبار الوصول للميزات المميزة (قبل الترقية)');
    console.log('--------------------------------------------------------');
    
    try {
      const premiumTestResponse = await axios.get(`${BASE_URL}/api/ai/generate`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { prompt: 'Test premium feature' }
      });
      console.log('⚠️  تم الوصول للميزة المميزة بدون ترقية (قد تكون مشكلة)');
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.log('✅ تم منع الوصول للميزة المميزة بشكل صحيح');
      } else {
        console.log('❌ خطأ غير متوقع:', error.message);
      }
    }
    console.log();

    // Step 4: Upgrade account to premium
    console.log('📝 الخطوة 4: ترقية الحساب إلى مميز');
    console.log('----------------------------------');
    
    const upgradeResponse = await axios.post(`${BASE_URL}/api/payment/process`, {
      ...testConfig.paymentDetails,
      amount: 29.99,
      currency: 'USD'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!upgradeResponse.data.success) {
      throw new Error('فشل ترقية الحساب');
    }

    console.log('✅ تم ترقية الحساب بنجاح!');
    console.log('📊 تفاصيل الترقية:');
    console.log(JSON.stringify(upgradeResponse.data, null, 2));
    
    // Update token with new subscription info
    const newToken = upgradeResponse.data.data.token;
    console.log();

    // Step 5: Verify subscription status after upgrade
    console.log('📝 الخطوة 5: التحقق من حالة الاشتراك بعد الترقية');
    console.log('----------------------------------------------');
    
    const newSubscriptionResponse = await axios.get(`${BASE_URL}/api/payment/subscription`, {
      headers: { Authorization: `Bearer ${newToken}` }
    });

    console.log('📊 حالة الاشتراك الجديدة:');
    console.log(JSON.stringify(newSubscriptionResponse.data, null, 2));
    console.log();

    // Step 6: Test premium feature access (after upgrade)
    console.log('📝 الخطوة 6: اختبار الوصول للميزات المميزة (بعد الترقية)');
    console.log('-------------------------------------------------------');
    
    try {
      const premiumTestResponse = await axios.get(`${BASE_URL}/api/ai/generate`, {
        headers: { Authorization: `Bearer ${newToken}` },
        params: { prompt: 'Test premium feature after upgrade' }
      });
      console.log('✅ تم الوصول للميزة المميزة بنجاح بعد الترقية!');
      console.log('📊 استجابة الميزة المميزة:');
      console.log(JSON.stringify(premiumTestResponse.data, null, 2));
    } catch (error) {
      console.log('❌ فشل الوصول للميزة المميزة بعد الترقية:', error.response?.data || error.message);
    }
    console.log();

    // Step 7: Test other premium features
    console.log('📝 الخطوة 7: اختبار ميزات مميزة أخرى');
    console.log('------------------------------------');
    
    const premiumEndpoints = [
      '/api/analytics/premium',
      '/api/facebook-automation/analyze',
      '/api/trending-topics/generate'
    ];

    for (const endpoint of premiumEndpoints) {
      try {
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${newToken}` }
        });
        console.log(`✅ ${endpoint}: متاح`);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          console.log(`❌ ${endpoint}: محجوب (قد تكون مشكلة)`);
        } else {
          console.log(`⚠️  ${endpoint}: خطأ - ${error.response?.status || error.message}`);
        }
      }
    }

    console.log('\n🎉 اكتمل اختبار ترقية الحساب بنجاح!');
    console.log('=====================================');

  } catch (error) {
    console.error('\n❌ خطأ في الاختبار:', error.response?.data || error.message);
    
    if (error.response?.status === 429) {
      console.log('\n💡 اقتراحات لحل مشكلة Rate Limiting:');
      console.log('1. انتظر بضع دقائق قبل إعادة المحاولة');
      console.log('2. استخدم مستخدم موجود بدلاً من إنشاء مستخدم جديد');
      console.log('3. قم بإعادة تشغيل الخادم لإعادة تعيين العدادات');
    }
    
    console.log('\n🏁 انتهى الاختبار');
  }
}

// Run the test
testPremiumUpgrade();