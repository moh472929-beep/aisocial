const axios = require('axios');
const jwt = require('jsonwebtoken');

// Test configuration
const BASE_URL = 'http://localhost:3000';

// Test user credentials - replace with your actual test user
const TEST_USER = {
  email: 'test@example.com',  // استبدل هذا بالإيميل الخاص بك
  password: 'TestPassword123!'  // استبدل هذا بكلمة السر الخاصة بك
};

console.log('🔍 اختبار تحديث الاشتراك المميز');
console.log('===============================\n');

// Helper function to decode JWT token
function decodeJWT(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('خطأ في فك تشفير الرمز المميز:', error);
    return null;
  }
}

// Test 1: Login and check current subscription status
async function testCurrentSubscription() {
  console.log('🔐 الاختبار 1: تسجيل الدخول وفحص حالة الاشتراك الحالية');
  console.log('--------------------------------------------------');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    if (response.data.success) {
      const { user, accessToken } = response.data.data;
      
      console.log('✅ تم تسجيل الدخول بنجاح');
      console.log('📋 بيانات المستخدم من قاعدة البيانات:');
      console.log(`   - الإيميل: ${user.email}`);
      console.log(`   - الاسم: ${user.fullName}`);
      console.log(`   - الدور: ${user.role}`);
      console.log(`   - نوع الاشتراك: ${user.subscription}`);
      console.log(`   - تاريخ التحديث: ${user.updatedAt}`);
      
      // Decode JWT to see what's in the token
      const decodedToken = decodeJWT(accessToken);
      console.log('\n🎫 محتويات الرمز المميز (JWT):');
      console.log(`   - معرف المستخدم: ${decodedToken?.userId}`);
      console.log(`   - الإيميل: ${decodedToken?.email}`);
      console.log(`   - الدور: ${decodedToken?.role}`);
      console.log(`   - نوع الاشتراك: ${decodedToken?.subscription}`);
      
      // Check if database and JWT match
      if (user.subscription === decodedToken?.subscription) {
        console.log('✅ نوع الاشتراك متطابق بين قاعدة البيانات والرمز المميز');
      } else {
        console.log('❌ عدم تطابق نوع الاشتراك:');
        console.log(`   - قاعدة البيانات: ${user.subscription}`);
        console.log(`   - الرمز المميز: ${decodedToken?.subscription}`);
      }
      
      return { user, accessToken };
    } else {
      console.log('❌ فشل في تسجيل الدخول:', response.data.error);
      return null;
    }
  } catch (error) {
    console.log('❌ خطأ في تسجيل الدخول:', error.response?.data?.error || error.message);
    return null;
  }
}

// Test 2: Test premium endpoint access
async function testPremiumAccess(accessToken) {
  console.log('\n🎯 الاختبار 2: اختبار الوصول للميزات المميزة');
  console.log('--------------------------------------------');
  
  const premiumEndpoints = [
    '/api/facebook/pages',
    '/api/analytics/fetch',
    '/api/autoresponse/settings'
  ];
  
  for (const endpoint of premiumEndpoints) {
    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        validateStatus: () => true // Don't throw on 4xx/5xx
      });
      
      if (response.status === 200) {
        console.log(`✅ ${endpoint} - وصول مسموح (200)`);
      } else if (response.status === 401) {
        console.log(`❌ ${endpoint} - غير مصرح (401) - مشكلة في الرمز المميز`);
      } else if (response.status === 403) {
        console.log(`⚠️  ${endpoint} - ممنوع (403) - حساب مجاني`);
      } else {
        console.log(`❓ ${endpoint} - حالة غير متوقعة (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - خطأ: ${error.message}`);
    }
  }
}

// Test 3: Check profile endpoint for fresh data
async function testProfileEndpoint(accessToken) {
  console.log('\n👤 الاختبار 3: فحص بيانات الملف الشخصي المحدثة');
  console.log('---------------------------------------------');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (response.data.success) {
      const user = response.data.user;
      console.log('✅ تم جلب بيانات الملف الشخصي بنجاح');
      console.log('📋 البيانات المحدثة:');
      console.log(`   - الإيميل: ${user.email}`);
      console.log(`   - نوع الاشتراك: ${user.subscription}`);
      console.log(`   - تاريخ التحديث: ${user.updatedAt}`);
      
      return user;
    } else {
      console.log('❌ فشل في جلب بيانات الملف الشخصي:', response.data.error);
      return null;
    }
  } catch (error) {
    console.log('❌ خطأ في جلب الملف الشخصي:', error.response?.data?.error || error.message);
    return null;
  }
}

// Test 4: Suggest solutions
function suggestSolutions(loginUser, profileUser) {
  console.log('\n💡 الحلول المقترحة');
  console.log('------------------');
  
  if (!loginUser || !profileUser) {
    console.log('❌ لا يمكن تقديم حلول بدون بيانات كاملة');
    return;
  }
  
  if (loginUser.subscription === 'free' && profileUser.subscription === 'free') {
    console.log('🔍 المشكلة: الحساب ما زال مجاني في قاعدة البيانات');
    console.log('');
    console.log('الحلول الممكنة:');
    console.log('1. تأكد من أن التحديث تم بشكل صحيح في MongoDB');
    console.log('2. تحقق من اسم الحقل في قاعدة البيانات (subscription)');
    console.log('3. تأكد من أن التحديث تم على المستخدم الصحيح');
    console.log('4. جرب إعادة تشغيل الخادم لتحديث الاتصال بقاعدة البيانات');
    console.log('');
    console.log('أوامر MongoDB للتحقق:');
    console.log(`db.users.findOne({email: "${loginUser.email}"})`);
    console.log(`db.users.updateOne({email: "${loginUser.email}"}, {$set: {subscription: "premium"}})`);
  } else if (loginUser.subscription === 'premium') {
    console.log('✅ الحساب محدث بنجاح إلى مميز!');
    console.log('يمكنك الآن الوصول للميزات المميزة');
  }
}

// Main test function
async function runSubscriptionTest() {
  try {
    console.log('📝 ملاحظة: تأكد من تحديث TEST_USER في بداية الملف');
    console.log(`📧 الإيميل المستخدم: ${TEST_USER.email}`);
    console.log('');
    
    // Test 1: Login and check subscription
    const loginResult = await testCurrentSubscription();
    if (!loginResult) {
      console.log('❌ فشل في تسجيل الدخول - توقف الاختبار');
      return;
    }
    
    const { user: loginUser, accessToken } = loginResult;
    
    // Test 2: Test premium access
    await testPremiumAccess(accessToken);
    
    // Test 3: Check profile endpoint
    const profileUser = await testProfileEndpoint(accessToken);
    
    // Test 4: Suggest solutions
    suggestSolutions(loginUser, profileUser);
    
    console.log('\n📋 ملخص الاختبار');
    console.log('----------------');
    console.log('✅ تم إكمال جميع الاختبارات');
    console.log('راجع النتائج أعلاه لتحديد المشكلة والحل المناسب');
    
  } catch (error) {
    console.error('❌ فشل في تشغيل الاختبار:', error.message);
  }
}

// Run the test
runSubscriptionTest();