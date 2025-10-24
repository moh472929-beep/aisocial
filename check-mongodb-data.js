const { MongoClient } = require('mongodb');
require('dotenv').config();

console.log('🔍 فحص بيانات MongoDB مباشرة');
console.log('===============================\n');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/facebook-ai-manager';

async function checkMongoDBData() {
  let client;
  
  try {
    console.log('🔗 الاتصال بقاعدة البيانات...');
    console.log(`📍 رابط قاعدة البيانات: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح\n');
    
    // Get all users to see the structure
    console.log('📋 جميع المستخدمين في قاعدة البيانات:');
    console.log('=====================================');
    
    const allUsers = await usersCollection.find({}).toArray();
    
    if (allUsers.length === 0) {
      console.log('❌ لا توجد مستخدمين في قاعدة البيانات');
      return;
    }
    
    allUsers.forEach((user, index) => {
      console.log(`\n👤 المستخدم ${index + 1}:`);
      console.log(`   📧 الإيميل: ${user.email}`);
      console.log(`   👤 الاسم: ${user.fullName || user.username || 'غير محدد'}`);
      console.log(`   🎫 نوع الاشتراك: ${user.subscription || 'غير محدد'}`);
      console.log(`   🔑 الدور: ${user.role || 'غير محدد'}`);
      console.log(`   📅 تاريخ الإنشاء: ${user.createdAt || 'غير محدد'}`);
      console.log(`   🔄 تاريخ التحديث: ${user.updatedAt || 'غير محدد'}`);
      console.log(`   🆔 معرف المستخدم: ${user._id}`);
    });
    
    // Check for premium users specifically
    console.log('\n\n🎯 البحث عن المستخدمين المميزين:');
    console.log('==================================');
    
    const premiumUsers = await usersCollection.find({ subscription: 'premium' }).toArray();
    
    if (premiumUsers.length === 0) {
      console.log('❌ لا توجد حسابات مميزة في قاعدة البيانات');
      console.log('\n💡 لترقية حساب إلى مميز:');
      console.log('1. اختر إيميل المستخدم من القائمة أعلاه');
      console.log('2. استخدم هذا الأمر في MongoDB:');
      console.log('   db.users.updateOne({email: "الإيميل_هنا"}, {$set: {subscription: "premium"}})');
    } else {
      console.log(`✅ تم العثور على ${premiumUsers.length} حساب مميز:`);
      premiumUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} - ${user.fullName || user.username}`);
      });
    }
    
    // Check for free users
    console.log('\n\n🆓 المستخدمين المجانيين:');
    console.log('========================');
    
    const freeUsers = await usersCollection.find({ 
      $or: [
        { subscription: 'free' },
        { subscription: { $exists: false } }
      ]
    }).toArray();
    
    console.log(`📊 عدد الحسابات المجانية: ${freeUsers.length}`);
    freeUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} - ${user.subscription || 'غير محدد'}`);
    });
    
    // Provide update commands
    console.log('\n\n🛠️  أوامر التحديث المفيدة:');
    console.log('==========================');
    console.log('لترقية مستخدم معين إلى مميز:');
    console.log('db.users.updateOne({email: "user@example.com"}, {$set: {subscription: "premium"}})');
    console.log('\nلترقية جميع المستخدمين إلى مميز (للاختبار):');
    console.log('db.users.updateMany({}, {$set: {subscription: "premium"}})');
    console.log('\nللتحقق من التحديث:');
    console.log('db.users.find({subscription: "premium"})');
    
  } catch (error) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error.message);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 حلول محتملة:');
      console.log('1. تأكد من أن MongoDB يعمل');
      console.log('2. تحقق من رابط قاعدة البيانات في ملف .env');
      console.log('3. تأكد من صحة بيانات الاعتماد');
    }
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔒 تم إغلاق الاتصال بقاعدة البيانات');
    }
  }
}

// Function to update a specific user to premium
async function updateUserToPremium(email) {
  let client;
  
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    const result = await usersCollection.updateOne(
      { email: email },
      { 
        $set: { 
          subscription: 'premium',
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      console.log(`❌ لم يتم العثور على مستخدم بالإيميل: ${email}`);
    } else if (result.modifiedCount === 0) {
      console.log(`⚠️  المستخدم ${email} مميز بالفعل`);
    } else {
      console.log(`✅ تم ترقية المستخدم ${email} إلى مميز بنجاح`);
    }
    
  } catch (error) {
    console.error('❌ خطأ في تحديث المستخدم:', error.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length > 0 && args[0] === 'update' && args[1]) {
    console.log(`🔄 ترقية المستخدم ${args[1]} إلى مميز...`);
    await updateUserToPremium(args[1]);
  } else {
    await checkMongoDBData();
    
    console.log('\n\n📝 ملاحظة:');
    console.log('لترقية مستخدم معين، استخدم:');
    console.log('node check-mongodb-data.js update user@example.com');
  }
}

main().catch(console.error);