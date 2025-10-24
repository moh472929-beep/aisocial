const axios = require('axios');

console.log('🔍 اختبار الاتصال بقاعدة البيانات السحابية');
console.log('==========================================\n');

// Test configuration
const BASE_URL = 'http://localhost:3000';

// Test user credentials - update these with your real credentials
const TEST_USER = {
  email: 'your-email@example.com',  // ضع إيميلك الحقيقي هنا
  password: 'your-password'         // ضع كلمة السر الحقيقية هنا
};

async function testDatabaseConnection() {
  console.log('🔗 اختبار الاتصال بقاعدة البيانات من خلال التطبيق...');
  
  try {
    // First, try to register a test user to see if database is working
    console.log('📝 محاولة إنشاء مستخدم جديد للاختبار...');
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      fullName: 'Test User',
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword
    }, {
      timeout: 10000,
      validateStatus: () => true
    });
    
    console.log(`📊 حالة التسجيل: ${registerResponse.status}`);
    
    if (registerResponse.status === 201 || registerResponse.status === 200) {
      console.log('✅ تم إنشاء المستخدم بنجاح - قاعدة البيانات تعمل!');
      
      // Now try to login with the new user
      console.log('\n🔐 محاولة تسجيل الدخول بالمستخدم الجديد...');
      
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: testEmail,
        password: testPassword
      }, {
        timeout: 10000,
        validateStatus: () => true
      });
      
      if (loginResponse.status === 200 && loginResponse.data.success) {
        const { user } = loginResponse.data.data;
        console.log('✅ تم تسجيل الدخول بنجاح!');
        console.log('\n📋 بيانات المستخدم الجديد:');
        console.log(`   - الإيميل: ${user.email}`);
        console.log(`   - الاسم: ${user.fullName}`);
        console.log(`   - نوع الاشتراك: ${user.subscription}`);
        console.log(`   - الدور: ${user.role}`);
        
        console.log('\n🎯 قاعدة البيانات تعمل بشكل صحيح!');
        console.log('المشكلة قد تكون في:');
        console.log('1. التحديث لم يتم بشكل صحيح في قاعدة البيانات');
        console.log('2. التحديث تم على مستخدم مختلف');
        console.log('3. حاجة لإعادة تسجيل الدخول بعد التحديث');
        
        return { success: true, testUser: user };
      } else {
        console.log('❌ فشل في تسجيل الدخول بالمستخدم الجديد');
        return { success: false, error: 'Login failed' };
      }
      
    } else if (registerResponse.status === 400 && registerResponse.data.error?.includes('already exists')) {
      console.log('⚠️  المستخدم موجود بالفعل - قاعدة البيانات تعمل');
      return { success: true, message: 'Database working, user exists' };
    } else {
      console.log('❌ فشل في إنشاء المستخدم:', registerResponse.data);
      return { success: false, error: registerResponse.data };
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ لا يمكن الاتصال بالخادم');
      console.log('تأكد من أن الخادم يعمل: node index.js');
      return { success: false, error: 'Server not running' };
    } else {
      console.log('❌ خطأ في الشبكة:', error.message);
      return { success: false, error: error.message };
    }
  }
}

async function testExistingUserLogin() {
  console.log('\n🔐 اختبار تسجيل الدخول بالمستخدم الموجود...');
  console.log(`📧 الإيميل: ${TEST_USER.email}`);
  
  if (TEST_USER.email === 'your-email@example.com') {
    console.log('⚠️  يرجى تحديث بيانات TEST_USER في بداية الملف');
    return { success: false, error: 'Credentials not updated' };
  }
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    }, {
      timeout: 10000,
      validateStatus: () => true
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
      console.log(`   - تاريخ التحديث: ${user.updatedAt}`);
      
      return { success: true, user };
    } else if (response.status === 429) {
      console.log('⏰ تم تجاوز حد المحاولات - انتظر قليلاً');
      return { success: false, error: 'Rate limited' };
    } else {
      console.log('❌ فشل في تسجيل الدخول:', response.data);
      return { success: false, error: response.data };
    }
    
  } catch (error) {
    console.log('❌ خطأ:', error.message);
    return { success: false, error: error.message };
  }
}

async function provideSolutions(testResult, loginResult) {
  console.log('\n💡 التشخيص والحلول');
  console.log('===================');
  
  if (!testResult.success) {
    console.log('❌ مشكلة في قاعدة البيانات أو الخادم');
    console.log('الحلول:');
    console.log('1. تأكد من تشغيل الخادم: node index.js');
    console.log('2. تحقق من اتصال قاعدة البيانات');
    return;
  }
  
  if (!loginResult.success) {
    if (loginResult.error === 'Credentials not updated') {
      console.log('⚠️  يرجى تحديث بيانات تسجيل الدخول في الملف');
      return;
    } else if (loginResult.error === 'Rate limited') {
      console.log('⏰ انتظر 15 دقيقة ثم حاول مرة أخرى');
      return;
    } else {
      console.log('❌ مشكلة في بيانات تسجيل الدخول');
      console.log('تأكد من الإيميل وكلمة السر');
      return;
    }
  }
  
  const user = loginResult.user;
  
  if (user.subscription === 'premium') {
    console.log('✅ الحساب مميز بالفعل!');
    console.log('إذا كنت لا تزال ترى مشكلة، جرب:');
    console.log('1. مسح cache المتصفح');
    console.log('2. تسجيل الخروج وإعادة تسجيل الدخول');
    console.log('3. فتح المتصفح في وضع التصفح الخاص');
  } else {
    console.log('⚠️  الحساب لا يزال مجاني');
    console.log('\n🔧 خطوات الإصلاح:');
    console.log('1. افتح MongoDB Compass أو MongoDB Atlas');
    console.log('2. ابحث عن المستخدم:');
    console.log(`   البحث: {email: "${user.email}"}`);
    console.log('3. تأكد من وجود المستخدم');
    console.log('4. حدث الحقل subscription إلى "premium"');
    console.log('5. احفظ التغييرات');
    console.log('6. أعد تسجيل الدخول');
    
    console.log('\n📝 أمر MongoDB:');
    console.log(`db.users.updateOne({email: "${user.email}"}, {$set: {subscription: "premium", updatedAt: new Date()}})`);
  }
}

async function main() {
  console.log('⚠️  تحديث مطلوب:');
  console.log('قم بتحديث TEST_USER في بداية الملف بإيميلك وكلمة السر الحقيقية\n');
  
  // Test database connection
  const testResult = await testDatabaseConnection();
  
  // Test existing user login
  const loginResult = await testExistingUserLogin();
  
  // Provide solutions
  await provideSolutions(testResult, loginResult);
}

main().catch(console.error);