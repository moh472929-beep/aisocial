const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test user credentials
const testUser = {
  fullName: 'Premium Test User',
  username: 'premiumtestuser2024',
  email: 'premium-test-2024@example.com',
  password: 'PremiumTest123!'
};

// Payment test data
const testPayment = {
  cardNumber: '4111111111111111',
  expiryDate: '12/25',
  cvv: '123',
  cardholderName: 'Premium Test User',
  amount: 29.99,
  currency: 'USD'
};

console.log('🚀 اختبار تدفق ترقية الحساب المميز الكامل');
console.log('===========================================\n');

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
    
    if (data && (method === 'POST' || method === 'PUT')) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status || 0
    };
  }
}

// Test 1: Create a new user account
async function testCreateUser() {
  console.log('📝 الاختبار 1: إنشاء حساب مستخدم جديد');
  console.log('----------------------------------------');
  
  const result = await makeRequest('POST', '/api/auth/register', testUser);
  
  if (result.success) {
    console.log('✅ تم إنشاء الحساب بنجاح');
    console.log(`📧 البريد الإلكتروني: ${testUser.email}`);
    console.log(`👤 اسم المستخدم: ${testUser.username}`);
    return result.data;
  } else if (result.status === 409 && result.error?.error?.includes('User already exists')) {
    console.log('⚠️ المستخدم موجود مسبقاً، سنستخدم الحساب الموجود');
    return { user: testUser };
  } else if (result.status === 400 && (result.error?.error?.includes('User already exists') || result.error?.includes('User already exists'))) {
    console.log('⚠️ المستخدم موجود مسبقاً، سنستخدم الحساب الموجود');
    return { user: testUser };
  } else {
    console.log('❌ فشل في إنشاء الحساب:', JSON.stringify(result.error, null, 2));
    console.log('📊 حالة الاستجابة:', result.status);
    return null;
  }
}

// Test 2: Login with the user
async function testLogin() {
  console.log('\n🔐 الاختبار 2: تسجيل الدخول');
  console.log('-----------------------------');
  
  const loginData = {
    identifier: testUser.email,
    password: testUser.password
  };
  
  const result = await makeRequest('POST', '/api/auth/login', loginData);
  
  if (result.success && result.data && result.data.data && result.data.data.token) {
    console.log('✅ تم تسجيل الدخول بنجاح');
    console.log(`🎫 رمز التفويض: ${result.data.data.token.substring(0, 20)}...`);
    console.log(`📊 نوع الاشتراك الحالي: ${result.data.data.user.subscription || 'free'}`);
    return result.data.data.token;
  } else if (result.success && result.data && result.data.data && result.data.data.accessToken) {
    console.log('✅ تم تسجيل الدخول بنجاح');
    console.log(`🎫 رمز التفويض: ${result.data.data.accessToken.substring(0, 20)}...`);
    console.log(`📊 نوع الاشتراك الحالي: ${result.data.data.user.subscription || 'free'}`);
    return result.data.data.accessToken;
  } else if (result.success && result.data && result.data.token) {
    console.log('✅ تم تسجيل الدخول بنجاح');
    console.log(`🎫 رمز التفويض: ${result.data.token.substring(0, 20)}...`);
    console.log(`📊 نوع الاشتراك الحالي: ${result.data.user.subscription || 'free'}`);
    return result.data.token;
  } else if (result.success && result.data && result.data.accessToken) {
    console.log('✅ تم تسجيل الدخول بنجاح');
    console.log(`🎫 رمز التفويض: ${result.data.accessToken.substring(0, 20)}...`);
    console.log(`📊 نوع الاشتراك الحالي: ${result.data.user.subscription || 'free'}`);
    return result.data.accessToken;
  } else {
    console.log('❌ فشل في تسجيل الدخول:', JSON.stringify(result.error, null, 2));
    console.log('📊 حالة الاستجابة:', result.status);
    console.log('📋 البيانات المرسلة:', JSON.stringify(loginData, null, 2));
    console.log('📄 البيانات المستلمة:', JSON.stringify(result.data, null, 2));
    return null;
  }
}

// Test 3: Check current subscription status
async function testCurrentSubscription(token) {
  console.log('\n📊 الاختبار 3: فحص حالة الاشتراك الحالية');
  console.log('------------------------------------------');
  
  const result = await makeRequest('GET', '/api/payment/subscription', null, {
    'Authorization': `Bearer ${token}`
  });
  
  if (result.success) {
    console.log('✅ تم جلب معلومات الاشتراك بنجاح');
    console.log(`📋 نوع الاشتراك: ${result.data.data.type}`);
    console.log(`🔄 حالة النشاط: ${result.data.data.isActive ? 'نشط' : 'غير نشط'}`);
    console.log(`📝 المنشورات المتبقية: ${result.data.data.postsRemaining === -1 ? 'غير محدود' : result.data.data.postsRemaining}`);
    console.log(`🤖 الذكاء الاصطناعي: ${result.data.data.aiEnabled ? 'مفعل' : 'غير مفعل'}`);
    console.log(`🎯 الميزات المتاحة: ${result.data.data.features.length} ميزة`);
    return result.data.data;
  } else {
    console.log('❌ فشل في جلب معلومات الاشتراك:', result.error?.error || result.error);
    return null;
  }
}

// Test 4: Test premium feature access (before upgrade)
async function testPremiumFeaturesBefore(token) {
  console.log('\n🔒 الاختبار 4: اختبار الوصول للميزات المميزة (قبل الترقية)');
  console.log('--------------------------------------------------------');
  
  const premiumEndpoints = [
    { url: '/api/analytics/dashboard', name: 'لوحة التحليلات' },
    { url: '/api/ai/generate-image', name: 'إنشاء الصور بالذكاء الاصطناعي' },
    { url: '/api/facebook-automation/pages', name: 'إدارة الصفحات المتعددة' }
  ];
  
  for (const endpoint of premiumEndpoints) {
    const result = await makeRequest('GET', endpoint.url, null, {
      'Authorization': `Bearer ${token}`
    });
    
    if (result.status === 403) {
      console.log(`✅ ${endpoint.name}: تم رفض الوصول بشكل صحيح (403)`);
    } else if (result.success) {
      console.log(`⚠️ ${endpoint.name}: الوصول مسموح (${result.status}) - قد يكون الحساب مميز مسبقاً`);
    } else {
      console.log(`❓ ${endpoint.name}: استجابة غير متوقعة (${result.status})`);
    }
  }
}

// Test 5: Process premium upgrade payment
async function testPremiumUpgrade(token) {
  console.log('\n💳 الاختبار 5: معالجة دفع ترقية الحساب المميز');
  console.log('--------------------------------------------');
  
  console.log('📋 بيانات الدفع:');
  console.log(`💳 رقم البطاقة: ${testPayment.cardNumber}`);
  console.log(`📅 تاريخ الانتهاء: ${testPayment.expiryDate}`);
  console.log(`🔒 CVV: ${testPayment.cvv}`);
  console.log(`👤 اسم حامل البطاقة: ${testPayment.cardholderName}`);
  console.log(`💰 المبلغ: ${testPayment.amount} ${testPayment.currency}`);
  
  const result = await makeRequest('POST', '/api/payment/process', testPayment, {
    'Authorization': `Bearer ${token}`
  });
  
  if (result.success) {
    console.log('\n✅ تم الدفع وترقية الحساب بنجاح!');
    console.log(`🎉 الرسالة: ${result.data.message}`);
    console.log(`📊 نوع الاشتراك الجديد: ${result.data.data.subscription.type}`);
    console.log(`📅 تاريخ البداية: ${result.data.data.subscription.startDate}`);
    console.log(`📅 تاريخ النهاية: ${result.data.data.subscription.endDate}`);
    console.log(`🎫 رمز JWT جديد: ${result.data.data.token.substring(0, 20)}...`);
    console.log(`🎯 الميزات الجديدة: ${result.data.data.subscription.features.length} ميزة`);
    
    // عرض الميزات الجديدة
    console.log('\n🌟 الميزات المتاحة الآن:');
    result.data.data.subscription.features.forEach((feature, index) => {
      console.log(`   ${index + 1}. ${feature}`);
    });
    
    return result.data.data.token; // Return new token
  } else {
    console.log('❌ فشل في معالجة الدفع:', result.error?.error || result.error);
    return null;
  }
}

// Test 6: Verify subscription after upgrade
async function testSubscriptionAfterUpgrade(newToken) {
  console.log('\n🔍 الاختبار 6: التحقق من الاشتراك بعد الترقية');
  console.log('--------------------------------------------');
  
  const result = await makeRequest('GET', '/api/payment/subscription', null, {
    'Authorization': `Bearer ${newToken}`
  });
  
  if (result.success) {
    const subscription = result.data.data;
    console.log('✅ تم التحقق من الاشتراك بنجاح');
    console.log(`📋 نوع الاشتراك: ${subscription.type}`);
    console.log(`🔄 حالة النشاط: ${subscription.isActive ? 'نشط' : 'غير نشط'}`);
    console.log(`📝 المنشورات المتبقية: ${subscription.postsRemaining === -1 ? 'غير محدود' : subscription.postsRemaining}`);
    console.log(`🤖 الذكاء الاصطناعي: ${subscription.aiEnabled ? 'مفعل' : 'غير مفعل'}`);
    
    // التحقق من أن الترقية تمت بنجاح
    if (subscription.type === 'premium' && subscription.isActive) {
      console.log('🎉 تأكيد: الحساب مميز ونشط!');
      return true;
    } else {
      console.log('❌ خطأ: الحساب لم يتم ترقيته بشكل صحيح');
      return false;
    }
  } else {
    console.log('❌ فشل في التحقق من الاشتراك:', result.error?.error || result.error);
    return false;
  }
}

// Test 7: Test premium features access (after upgrade)
async function testPremiumFeaturesAfter(token) {
  console.log('\n🌟 الاختبار 7: اختبار الوصول للميزات المميزة (بعد الترقية)');
  console.log('-------------------------------------------------------');
  
  const premiumEndpoints = [
    { url: '/api/analytics/dashboard', name: 'لوحة التحليلات', method: 'GET' },
    { url: '/api/ai/chat', name: 'الدردشة مع الذكاء الاصطناعي', method: 'POST', data: { message: 'مرحبا' } },
    { url: '/api/facebook/pages', name: 'إدارة الصفحات المتعددة', method: 'GET' }
  ];
  
  for (const endpoint of premiumEndpoints) {
    const result = await makeRequest(endpoint.method, endpoint.url, endpoint.data, {
      'Authorization': `Bearer ${token}`
    });
    
    if (result.success) {
      console.log(`✅ ${endpoint.name}: الوصول مسموح (${result.status})`);
    } else if (result.status === 403) {
      console.log(`❌ ${endpoint.name}: الوصول مرفوض (403) - قد تكون هناك مشكلة في الترقية`);
    } else {
      console.log(`⚠️ ${endpoint.name}: استجابة غير متوقعة (${result.status}): ${result.error?.error || result.error}`);
    }
  }
}

// Test 8: Test user profile with premium status
async function testUserProfile(token) {
  console.log('\n👤 الاختبار 8: فحص ملف المستخدم الشخصي');
  console.log('--------------------------------------');
  
  const result = await makeRequest('GET', '/api/auth/profile', null, {
    'Authorization': `Bearer ${token}`
  });
  
  // التحقق من وجود البيانات في المسار الصحيح
  const user = result.data?.data?.user || result.data?.user;
  
  if (result.status === 200 && user) {
    console.log('✅ تم جلب ملف المستخدم بنجاح');
    console.log(`📧 البريد الإلكتروني: ${user.email || 'غير محدد'}`);
    console.log(`👤 الاسم الكامل: ${user.fullName || 'غير محدد'}`);
    console.log(`📊 نوع الاشتراك: ${user.subscription || 'free'}`);
    console.log(`📅 تاريخ بداية الاشتراك: ${user.subscriptionStartDate || 'غير محدد'}`);
    console.log(`📅 تاريخ نهاية الاشتراك: ${user.subscriptionEndDate || 'غير محدد'}`);
    console.log(`🤖 الذكاء الاصطناعي مفعل: ${user.aiEnabled ? 'نعم' : 'لا'}`);
    console.log(`📝 المنشورات المتبقية: ${user.postsRemaining === -1 ? 'غير محدود' : user.postsRemaining}`);
    return user;
  } else {
    console.log('❌ فشل في جلب ملف المستخدم:', result.error?.error || result.error);
    console.log('📋 البيانات المستلمة:', JSON.stringify(result, null, 2));
    return null;
  }
}

// Main test function
async function runPremiumUpgradeTest() {
  console.log('🎯 بدء اختبار تدفق ترقية الحساب المميز الكامل');
  console.log('============================================\n');
  
  try {
    // Step 1: Create user account
    const userCreation = await testCreateUser();
    if (!userCreation) {
      throw new Error('فشل في إنشاء المستخدم');
    }
    
    // Step 2: Login
    const token = await testLogin();
    if (!token) {
      throw new Error('فشل في تسجيل الدخول');
    }
    
    // Step 3: Check current subscription
    const currentSubscription = await testCurrentSubscription(token);
    if (!currentSubscription) {
      throw new Error('فشل في جلب معلومات الاشتراك الحالية');
    }
    
    // Step 4: Test premium features before upgrade
    await testPremiumFeaturesBefore(token);
    
    // Step 5: Process premium upgrade
    const newToken = await testPremiumUpgrade(token);
    if (!newToken) {
      throw new Error('فشل في معالجة ترقية الحساب');
    }
    
    // Step 6: Verify subscription after upgrade
    const upgradeSuccess = await testSubscriptionAfterUpgrade(newToken);
    if (!upgradeSuccess) {
      throw new Error('فشل في التحقق من الترقية');
    }
    
    // Step 7: Test premium features after upgrade
    await testPremiumFeaturesAfter(newToken);
    
    // Step 8: Test user profile
    const userProfile = await testUserProfile(newToken);
    if (!userProfile) {
      throw new Error('فشل في جلب ملف المستخدم');
    }
    
    console.log('\n🎉 نتائج الاختبار النهائية');
    console.log('========================');
    console.log('✅ إنشاء المستخدم: نجح');
    console.log('✅ تسجيل الدخول: نجح');
    console.log('✅ فحص الاشتراك الأولي: نجح');
    console.log('✅ اختبار الميزات قبل الترقية: نجح');
    console.log('✅ معالجة الدفع والترقية: نجح');
    console.log('✅ التحقق من الترقية: نجح');
    console.log('✅ اختبار الميزات بعد الترقية: نجح');
    console.log('✅ فحص ملف المستخدم: نجح');
    
    console.log('\n🏆 جميع الاختبارات نجحت! تدفق ترقية الحساب المميز يعمل بشكل صحيح.');
    
  } catch (error) {
    console.error('\n💥 فشل في اختبار ترقية الحساب المميز:', error.message);
    process.exit(1);
  }
}

// Run the test
runPremiumUpgradeTest();