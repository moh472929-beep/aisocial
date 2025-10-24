const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

console.log('🧪 اختبار شامل لترقية الحساب وفتح الميزات المميزة');
console.log('='.repeat(60));

// Helper function to decode JWT (unsafe - for testing only)
function decodeJWTUnsafe(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

// Test complete premium upgrade flow
async function testCompleteUpgradeFlow() {
  const timestamp = Date.now();
  const testEmail = `test-upgrade-${timestamp}@example.com`;
  const testPassword = 'TestPassword123!';
  
  try {
    console.log('\n📝 الخطوة 1: إنشاء حساب جديد مجاني');
    console.log('-'.repeat(40));
    
    // Step 1: Register new user
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      fullName: 'Test Premium User',
      username: `testuser${timestamp}`,
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword
    });

    if (registerResponse.status === 201) {
      console.log('✅ تم إنشاء الحساب بنجاح');
      console.log(`📧 البريد الإلكتروني: ${testEmail}`);
    } else {
      throw new Error('فشل في إنشاء الحساب');
    }

    console.log('\n📝 الخطوة 2: تسجيل الدخول والحصول على الرمز المميز');
    console.log('-'.repeat(40));

    // Step 2: Login
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      identifier: testEmail,
      password: testPassword
    });

    if (loginResponse.status !== 200) {
      throw new Error('فشل في تسجيل الدخول');
    }

    const { accessToken, user } = loginResponse.data.data;
    console.log('✅ تم تسجيل الدخول بنجاح');
    console.log(`👤 المستخدم: ${user.fullName}`);
    console.log(`📊 نوع الاشتراك: ${user.subscription || 'free'}`);
    console.log(`🎯 المنشورات المتبقية: ${user.postsRemaining || 10}`);

    // Decode token to check subscription
    const tokenPayload = decodeJWTUnsafe(accessToken);
    console.log(`🔑 الاشتراك في الرمز المميز: ${tokenPayload?.subscription || 'غير محدد'}`);

    console.log('\n📝 الخطوة 3: اختبار الوصول للميزات المميزة (يجب أن يُرفض)');
    console.log('-'.repeat(40));

    // Step 3: Test premium endpoints before upgrade (should fail)
    const premiumEndpoints = [
      { path: '/api/analytics/fetch', method: 'POST' },
      { path: '/api/facebook/pages', method: 'GET' },
      { path: '/api/autoresponse/settings', method: 'GET' }
    ];

    let blockedCount = 0;
    for (const endpoint of premiumEndpoints) {
      try {
        const config = {
          method: endpoint.method,
          url: `${BASE_URL}${endpoint.path}`,
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        };

        if (endpoint.method === 'POST') {
          config.data = {};
        }

        const response = await axios(config);
        console.log(`❌ ${endpoint.path} - وصول غير متوقع (${response.status})`);
      } catch (error) {
        if (error.response?.status === 403) {
          console.log(`✅ ${endpoint.path} - تم حجب الوصول بشكل صحيح (403)`);
          blockedCount++;
        } else {
          console.log(`⚠️ ${endpoint.path} - خطأ غير متوقع (${error.response?.status})`);
        }
      }
    }

    console.log(`📊 تم حجب ${blockedCount}/${premiumEndpoints.length} من الميزات المميزة بشكل صحيح`);

    console.log('\n📝 الخطوة 4: ترقية الحساب إلى مميز');
    console.log('-'.repeat(40));

    // Step 4: Upgrade to premium
    const upgradeResponse = await axios.post(`${BASE_URL}/api/payment/process`, {
      cardNumber: '4111111111111111',
      expiryDate: '12/25',
      cvv: '123',
      cardholderName: 'Test User',
      billingEmail: testEmail,
      plan: 'premium'
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (upgradeResponse.status !== 200) {
      throw new Error(`فشل في ترقية الحساب: ${upgradeResponse.data?.message || upgradeResponse.data?.error}`);
    }

    const upgradeData = upgradeResponse.data.data;
    console.log('✅ تم ترقية الحساب بنجاح!');
    console.log(`💳 رسالة النجاح: ${upgradeData.message}`);
    console.log(`📊 نوع الاشتراك الجديد: ${upgradeData.user.subscription}`);
    console.log(`🎯 المنشورات المتبقية: ${upgradeData.user.postsRemaining === -1 ? 'غير محدود' : upgradeData.user.postsRemaining}`);
    console.log(`🤖 الذكاء الاصطناعي مفعل: ${upgradeData.user.aiEnabled ? 'نعم' : 'لا'}`);

    // Get new access token
    const newAccessToken = upgradeData.accessToken;
    const newTokenPayload = decodeJWTUnsafe(newAccessToken);
    console.log(`🔑 الاشتراك في الرمز المميز الجديد: ${newTokenPayload?.subscription}`);

    console.log('\n📝 الخطوة 5: اختبار الوصول للميزات المميزة بعد الترقية');
    console.log('-'.repeat(40));

    // Step 5: Test premium endpoints after upgrade (should succeed)
    let accessGrantedCount = 0;
    for (const endpoint of premiumEndpoints) {
      try {
        const config = {
          method: endpoint.method,
          url: `${BASE_URL}${endpoint.path}`,
          headers: {
            'Authorization': `Bearer ${newAccessToken}`,
            'Content-Type': 'application/json'
          }
        };

        if (endpoint.method === 'POST') {
          config.data = {};
        }

        const response = await axios(config);
        console.log(`✅ ${endpoint.path} - تم منح الوصول بنجاح (${response.status})`);
        accessGrantedCount++;
      } catch (error) {
        if (error.response?.status === 403) {
          console.log(`❌ ${endpoint.path} - لا يزال محجوباً (403) - مشكلة في النظام!`);
        } else {
          console.log(`⚠️ ${endpoint.path} - خطأ: ${error.response?.status} ${error.response?.data?.error || error.message}`);
        }
      }
    }

    console.log(`📊 تم منح الوصول لـ ${accessGrantedCount}/${premiumEndpoints.length} من الميزات المميزة`);

    console.log('\n📝 الخطوة 6: التحقق من حالة الاشتراك');
    console.log('-'.repeat(40));

    // Step 6: Check subscription status
    try {
      const statusResponse = await axios.get(`${BASE_URL}/api/payment/subscription-status`, {
        headers: {
          'Authorization': `Bearer ${newAccessToken}`
        }
      });

      if (statusResponse.status === 200) {
        const status = statusResponse.data.data;
        console.log('✅ تم جلب حالة الاشتراك بنجاح');
        console.log(`📊 نوع الاشتراك: ${status.type}`);
        console.log(`🟢 نشط: ${status.isActive ? 'نعم' : 'لا'}`);
        console.log(`📅 تاريخ البداية: ${status.startDate ? new Date(status.startDate).toLocaleDateString('ar') : 'غير محدد'}`);
        console.log(`📅 تاريخ الانتهاء: ${status.endDate ? new Date(status.endDate).toLocaleDateString('ar') : 'غير محدد'}`);
        console.log(`🎯 المنشورات المتبقية: ${status.postsRemaining === -1 ? 'غير محدود' : status.postsRemaining}`);
        console.log(`🤖 الذكاء الاصطناعي: ${status.aiEnabled ? 'مفعل' : 'غير مفعل'}`);
        console.log(`🎁 الميزات المتاحة: ${status.features.length} ميزة`);
      }
    } catch (error) {
      console.log(`❌ فشل في جلب حالة الاشتراك: ${error.response?.data?.error || error.message}`);
    }

    console.log('\n🎉 ملخص النتائج');
    console.log('='.repeat(40));
    console.log(`✅ إنشاء الحساب: نجح`);
    console.log(`✅ تسجيل الدخول: نجح`);
    console.log(`✅ حجب الميزات للحساب المجاني: ${blockedCount}/${premiumEndpoints.length}`);
    console.log(`✅ ترقية الحساب: نجح`);
    console.log(`✅ فتح الميزات للحساب المميز: ${accessGrantedCount}/${premiumEndpoints.length}`);

    if (blockedCount === premiumEndpoints.length && accessGrantedCount === premiumEndpoints.length) {
      console.log('\n🎊 جميع الاختبارات نجحت! النظام يعمل بشكل صحيح.');
    } else {
      console.log('\n⚠️ بعض الاختبارات فشلت. يرجى مراجعة النظام.');
    }

  } catch (error) {
    console.error('\n❌ خطأ في الاختبار:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.log('\n💡 اقتراحات لحل المشكلة:');
      console.log('1. تأكد من تشغيل الخادم على المنفذ 3000');
      console.log('2. تأكد من اتصال قاعدة البيانات');
      console.log('3. تحقق من متغيرات البيئة (JWT_SECRET, MONGODB_URI)');
    }
  }
}

// Run the test
console.log('🚀 بدء الاختبار الشامل...\n');
testCompleteUpgradeFlow().then(() => {
  console.log('\n🏁 انتهى الاختبار الشامل');
}).catch(error => {
  console.error('❌ فشل الاختبار:', error.message);
});