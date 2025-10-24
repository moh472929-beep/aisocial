const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testPaymentAPI() {
  console.log('🧪 اختبار واجهة برمجة التطبيقات للدفع');
  console.log('====================================\n');

  try {
    // Test 1: Check if payment API is accessible
    console.log('📝 الاختبار 1: التحقق من إمكانية الوصول لواجهة الدفع');
    console.log('--------------------------------------------------');
    
    try {
      const healthResponse = await axios.get(`${BASE_URL}/api/payment/health`);
      console.log('✅ واجهة برمجة التطبيقات للدفع متاحة');
      console.log('📊 الاستجابة:', JSON.stringify(healthResponse.data, null, 2));
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ واجهة برمجة التطبيقات للدفع غير متاحة (404)');
      } else {
        console.log('⚠️  خطأ في الوصول:', error.message);
      }
    }
    console.log();

    // Test 2: Test payment processing without authentication
    console.log('📝 الاختبار 2: اختبار معالجة الدفع بدون مصادقة');
    console.log('---------------------------------------------');
    
    try {
      const paymentResponse = await axios.post(`${BASE_URL}/api/payment/process`, {
        cardNumber: '4111111111111111',
        expiryDate: '12/25',
        cvv: '123',
        cardholderName: 'Test User',
        amount: 29.99,
        currency: 'USD'
      });
      console.log('⚠️  تمت معالجة الدفع بدون مصادقة (قد تكون مشكلة أمنية)');
      console.log('📊 الاستجابة:', JSON.stringify(paymentResponse.data, null, 2));
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ تم رفض الدفع بدون مصادقة بشكل صحيح');
      } else {
        console.log('❌ خطأ غير متوقع:', error.response?.data || error.message);
      }
    }
    console.log();

    // Test 3: Test subscription status without authentication
    console.log('📝 الاختبار 3: اختبار حالة الاشتراك بدون مصادقة');
    console.log('--------------------------------------------');
    
    try {
      const subscriptionResponse = await axios.get(`${BASE_URL}/api/payment/subscription`);
      console.log('⚠️  تم الوصول لحالة الاشتراك بدون مصادقة (قد تكون مشكلة أمنية)');
      console.log('📊 الاستجابة:', JSON.stringify(subscriptionResponse.data, null, 2));
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ تم رفض الوصول لحالة الاشتراك بدون مصادقة بشكل صحيح');
      } else {
        console.log('❌ خطأ غير متوقع:', error.response?.data || error.message);
      }
    }
    console.log();

    // Test 4: Check API routes
    console.log('📝 الاختبار 4: التحقق من مسارات واجهة برمجة التطبيقات');
    console.log('------------------------------------------------');
    
    try {
      const apiResponse = await axios.get(`${BASE_URL}/api`);
      console.log('✅ واجهة برمجة التطبيقات الرئيسية متاحة');
      console.log('📊 المسارات المتاحة:', JSON.stringify(apiResponse.data, null, 2));
    } catch (error) {
      console.log('❌ خطأ في الوصول لواجهة برمجة التطبيقات:', error.message);
    }
    console.log();

    // Test 5: Test server health
    console.log('📝 الاختبار 5: اختبار صحة الخادم');
    console.log('-------------------------------');
    
    try {
      const healthResponse = await axios.get(`${BASE_URL}/api/health`);
      console.log('✅ الخادم يعمل بشكل صحيح');
      console.log('📊 حالة الخادم:', JSON.stringify(healthResponse.data, null, 2));
    } catch (error) {
      console.log('❌ خطأ في صحة الخادم:', error.message);
    }
    console.log();

    console.log('🎉 اكتمل اختبار واجهة برمجة التطبيقات للدفع!');
    console.log('==========================================');

  } catch (error) {
    console.error('\n❌ خطأ عام في الاختبار:', error.message);
    console.log('\n🏁 انتهى الاختبار');
  }
}

// Run the test
testPaymentAPI();