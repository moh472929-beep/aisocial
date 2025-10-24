const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function createDemoUser() {
  try {
    console.log('🚀 إنشاء مستخدم تجريبي...\n');

    // بيانات المستخدم التجريبي
    const timestamp = Date.now();
    const demoUserData = {
      fullName: 'مستخدم تجريبي',
      username: `demo_user_${timestamp}`,
      email: `demo_${timestamp}@example.com`,
      password: 'DemoPassword123!',
      language: 'ar'
    };

    // 1. إنشاء المستخدم
    console.log('1. إنشاء حساب المستخدم التجريبي...');
    try {
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, demoUserData);
      console.log('✅ تم إنشاء المستخدم بنجاح');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️ المستخدم موجود بالفعل، سيتم استخدام الحساب الموجود');
      } else {
        throw error;
      }
    }

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
    
    if (!token) {
      throw new Error('لم يتم العثور على الرمز المميز في الاستجابة');
    }
    
    console.log('✅ تم تسجيل الدخول بنجاح');

    // 3. ترقية الحساب إلى مميز
    console.log('3. ترقية الحساب إلى مميز...');
    const upgradeResponse = await axios.post(`${API_BASE}/payment/process`, {
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

    if (!upgradeResponse.data.success) {
      throw new Error('فشل في ترقية الحساب');
    }

    console.log('✅ تم ترقية الحساب إلى مميز بنجاح');

    // 4. التحقق من حالة المستخدم
    console.log('4. التحقق من حالة المستخدم...');
    const userResponse = await axios.get(`${API_BASE}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const userData = userResponse.data.data || userResponse.data;
    const user = userData.user || userData;
    console.log('📊 معلومات المستخدم التجريبي:');
    console.log(`   الاسم: ${user.fullName || user.name || 'غير محدد'}`);
    console.log(`   البريد الإلكتروني: ${user.email}`);
    console.log(`   نوع الاشتراك: ${user.subscription}`);
    console.log(`   الذكاء الاصطناعي مفعل: ${user.aiEnabled ? 'نعم' : 'لا'}`);
    console.log(`   اللغة: ${user.language || 'غير محدد'}`);

    // 5. اختبار الوصول للميزات المميزة
    console.log('\n5. اختبار الوصول للميزات المميزة...');
    
    // اختبار الذكاء الاصطناعي
    try {
      const aiResponse = await axios.post(`${API_BASE}/ai/chat`, {
        message: 'مرحبا، هذا اختبار للذكاء الاصطناعي'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ الذكاء الاصطناعي يعمل بشكل صحيح');
    } catch (error) {
      console.log('❌ خطأ في الذكاء الاصطناعي:', error.response?.data?.error || error.message);
    }

    // اختبار التحليلات
    try {
      const analyticsResponse = await axios.get(`${API_BASE}/analytics/dashboard?period=daily`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ لوحة التحليلات تعمل بشكل صحيح');
    } catch (error) {
      console.log('❌ خطأ في التحليلات:', error.response?.data?.error || error.message);
    }

    console.log('\n🎉 تم إنشاء المستخدم التجريبي بنجاح!');
    console.log('\n📝 بيانات تسجيل الدخول:');
    console.log(`   البريد الإلكتروني: ${demoUserData.email}`);
    console.log(`   كلمة المرور: ${demoUserData.password}`);
    console.log('\n🌐 يمكنك الآن تسجيل الدخول على: http://localhost:3000/login.html');

  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدم التجريبي:', error.response?.data || error.message);
    process.exit(1);
  }
}

// تشغيل الدالة
createDemoUser();