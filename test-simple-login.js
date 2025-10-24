const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000';

console.log('🔍 اختبار تسجيل الدخول البسيط');
console.log('============================\n');

// Test with a real user - you need to update these credentials
const TEST_USER = {
  email: 'your-email@example.com',  // ضع إيميلك الحقيقي هنا
  password: 'your-password'         // ضع كلمة السر الحقيقية هنا
};

async function testLogin() {
  console.log('📧 محاولة تسجيل الدخول...');
  console.log(`الإيميل: ${TEST_USER.email}`);
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    }, {
      timeout: 10000,
      validateStatus: () => true // Don't throw on error status codes
    });
    
    console.log(`📊 حالة الاستجابة: ${response.status}`);
    
    if (response.status === 200 && response.data.success) {
      const { user } = response.data.data;
      console.log('✅ تم تسجيل الدخول بنجاح!');
      console.log('\n📋 بيانات المستخدم:');
      console.log(`   - الإيميل: ${user.email}`);
      console.log(`   - الاسم: ${user.fullName || user.username}`);
      console.log(`   - نوع الاشتراك: ${user.subscription}`);
      console.log(`   - الدور: ${user.role}`);
      console.log(`   - تاريخ الإنشاء: ${user.createdAt}`);
      console.log(`   - تاريخ التحديث: ${user.updatedAt}`);
      
      if (user.subscription === 'premium') {
        console.log('\n🎉 الحساب مميز! يمكنك الوصول للميزات المتقدمة');
      } else {
        console.log('\n⚠️  الحساب مجاني - تحتاج لترقية الاشتراك');
        console.log('\n💡 للترقية إلى مميز:');
        console.log('1. افتح MongoDB Compass أو MongoDB Shell');
        console.log('2. ابحث عن المستخدم باستخدام الإيميل:');
        console.log(`   db.users.findOne({email: "${user.email}"})`);
        console.log('3. حدث نوع الاشتراك:');
        console.log(`   db.users.updateOne({email: "${user.email}"}, {$set: {subscription: "premium"}})`);
        console.log('4. أعد تسجيل الدخول');
      }
      
    } else if (response.status === 429) {
      console.log('⏰ تم تجاوز حد المحاولات - انتظر قليلاً ثم حاول مرة أخرى');
      console.log('البيانات:', response.data);
    } else if (response.status === 401) {
      console.log('❌ بيانات تسجيل الدخول غير صحيحة');
      console.log('تأكد من الإيميل وكلمة السر');
    } else if (response.status === 500) {
      console.log('❌ خطأ في الخادم (500)');
      console.log('البيانات:', response.data);
    } else {
      console.log(`❌ خطأ غير متوقع (${response.status})`);
      console.log('البيانات:', response.data);
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ لا يمكن الاتصال بالخادم');
      console.log('تأكد من أن الخادم يعمل على المنفذ 3000');
      console.log('شغل الأمر: node index.js');
    } else {
      console.log('❌ خطأ في الشبكة:', error.message);
    }
  }
}

console.log('⚠️  تحديث مطلوب:');
console.log('قم بتحديث TEST_USER في بداية الملف بإيميلك وكلمة السر الحقيقية');
console.log('');

testLogin();