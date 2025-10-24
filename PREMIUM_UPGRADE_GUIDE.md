# 🚀 دليل ترقية الحساب إلى المميز
## Premium Account Upgrade Guide

---

## 📋 المحتويات / Contents

### العربية
1. [نظرة عامة](#نظرة-عامة)
2. [المتطلبات](#المتطلبات)
3. [خطوات الترقية](#خطوات-الترقية)
4. [التحقق من الترقية](#التحقق-من-الترقية)
5. [الميزات المتاحة](#الميزات-المتاحة)
6. [استكشاف الأخطاء](#استكشاف-الأخطاء)

### English
1. [Overview](#overview)
2. [Requirements](#requirements)
3. [Upgrade Steps](#upgrade-steps)
4. [Verification](#verification)
5. [Available Features](#available-features)
6. [Troubleshooting](#troubleshooting)

---

## نظرة عامة

يتيح لك النظام ترقية حسابك من المجاني إلى المميز للحصول على ميزات متقدمة وإمكانيات أكبر في إدارة صفحات الفيسبوك والذكاء الاصطناعي.

### الفروق بين الحسابات:

| الميزة | الحساب المجاني | الحساب المميز |
|--------|----------------|----------------|
| عدد المنشورات | 10 شهرياً | غير محدود |
| أدوات الذكاء الاصطناعي | أساسية | جميع الأدوات |
| إدارة الصفحات | صفحة واحدة | صفحات متعددة |
| التحليلات | أساسية | متقدمة |
| الدعم الفني | عادي | أولوية |
| القوالب | محدودة | مخصصة |
| الجدولة | أساسية | متقدمة |
| إنشاء الصور | محدود | بالذكاء الاصطناعي |

---

## المتطلبات

### المتطلبات الأساسية:
- ✅ حساب مسجل في النظام
- ✅ تسجيل دخول صحيح
- ✅ بيانات دفع صالحة
- ✅ اتصال إنترنت مستقر

### معلومات الدفع المطلوبة:
- رقم البطاقة الائتمانية (16 رقم)
- تاريخ انتهاء الصلاحية (MM/YY)
- رمز الأمان CVV (3 أرقام)
- اسم حامل البطاقة
- عنوان الفوترة

---

## خطوات الترقية

### الطريقة الأولى: من خلال واجهة الويب

#### 1. تسجيل الدخول
```
1. اذهب إلى: http://localhost:3000/login.html
2. أدخل بيانات تسجيل الدخول
3. انقر على "تسجيل الدخول"
```

#### 2. الانتقال إلى صفحة الدفع
```
1. اذهب إلى: http://localhost:3000/payment.html
2. أو انقر على "ترقية الحساب" من لوحة التحكم
```

#### 3. إدخال بيانات الدفع
```
1. أدخل رقم البطاقة: 4111111111111111 (للاختبار)
2. تاريخ الانتهاء: 12/25
3. رمز CVV: 123
4. اسم حامل البطاقة: Test User
5. المبلغ: 29.99 USD (شهرياً)
```

#### 4. تأكيد الدفع
```
1. راجع البيانات المدخلة
2. انقر على "تأكيد الدفع"
3. انتظر رسالة التأكيد
```

### الطريقة الثانية: من خلال API

#### 1. الحصول على رمز التفويض
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

#### 2. معالجة الدفع
```bash
curl -X POST http://localhost:3000/api/payment/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "cardNumber": "4111111111111111",
    "expiryDate": "12/25",
    "cvv": "123",
    "cardholderName": "Test User",
    "amount": 29.99,
    "currency": "USD"
  }'
```

---

## التحقق من الترقية

### 1. التحقق من حالة الاشتراك
```bash
curl -X GET http://localhost:3000/api/payment/subscription \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. التحقق من الميزات المتاحة
```javascript
// في المتصفح
fetch('/api/payment/subscription', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(response => response.json())
.then(data => {
  console.log('Subscription Status:', data);
  if (data.data.type === 'premium') {
    console.log('✅ Premium account activated!');
    console.log('Features:', data.data.features);
  }
});
```

### 3. علامات نجاح الترقية
- ✅ رسالة تأكيد: "تم الدفع بنجاح وترقية حسابك إلى المميز!"
- ✅ تحديث نوع الاشتراك إلى "premium"
- ✅ ظهور الميزات الجديدة في لوحة التحكم
- ✅ رمز JWT جديد يحتوي على بيانات الاشتراك المحدثة

---

## الميزات المتاحة

### بعد الترقية الناجحة، ستحصل على:

#### 🚀 ميزات المحتوى
- **منشورات غير محدودة**: لا توجد قيود على عدد المنشورات الشهرية
- **قوالب مخصصة**: إنشاء وحفظ قوالب مخصصة للمنشورات
- **جدولة متقدمة**: جدولة المنشورات لأوقات مختلفة وتواريخ مستقبلية

#### 🤖 ميزات الذكاء الاصطناعي
- **جميع أدوات الذكاء الاصطناعي**: وصول كامل لجميع أدوات AI
- **إنشاء صور بالذكاء الاصطناعي**: إنشاء صور مخصصة للمنشورات
- **تحليل المحتوى المتقدم**: تحليل أداء المحتوى بالذكاء الاصطناعي

#### 📊 ميزات التحليلات
- **تحليلات متقدمة**: تقارير مفصلة عن أداء الصفحات
- **إدارة صفحات متعددة**: ربط وإدارة عدة صفحات فيسبوك
- **تتبع المنافسين**: مراقبة وتحليل أداء المنافسين

#### 🎯 ميزات إضافية
- **دعم أولوية**: دعم فني سريع ومتخصص
- **ميزات تجريبية**: وصول مبكر للميزات الجديدة
- **تخصيص متقدم**: خيارات تخصيص أكثر للواجهة

---

## استكشاف الأخطاء

### المشاكل الشائعة والحلول:

#### ❌ خطأ: "رمز التفويض مطلوب"
**الحل:**
```javascript
// تأكد من وجود رمز التفويض
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/login.html';
}
```

#### ❌ خطأ: "بيانات الدفع غير صحيحة"
**الحل:**
- تأكد من صحة رقم البطاقة (16 رقم)
- تأكد من تاريخ الانتهاء (MM/YY)
- تأكد من رمز CVV (3 أرقام)

#### ❌ خطأ: "فشل في معالجة الدفع"
**الحل:**
1. تحقق من اتصال الإنترنت
2. تأكد من تشغيل الخادم على المنفذ 3000
3. تحقق من صحة بيانات الدفع
4. جرب مرة أخرى بعد دقيقة

#### ❌ خطأ: "المستخدم غير موجود"
**الحل:**
```bash
# تحقق من صحة رمز JWT
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### رموز الاستجابة:
- **200**: نجح الطلب
- **400**: بيانات غير صحيحة
- **401**: غير مصرح
- **404**: المورد غير موجود
- **500**: خطأ في الخادم

---

## Overview

The system allows you to upgrade your account from free to premium to access advanced features and greater capabilities in managing Facebook pages and AI tools.

### Account Differences:

| Feature | Free Account | Premium Account |
|---------|--------------|-----------------|
| Posts | 10 monthly | Unlimited |
| AI Tools | Basic | All tools |
| Page Management | Single page | Multiple pages |
| Analytics | Basic | Advanced |
| Support | Standard | Priority |
| Templates | Limited | Custom |
| Scheduling | Basic | Advanced |
| Image Generation | Limited | AI-powered |

---

## Requirements

### Basic Requirements:
- ✅ Registered account in the system
- ✅ Valid login credentials
- ✅ Valid payment information
- ✅ Stable internet connection

### Required Payment Information:
- Credit card number (16 digits)
- Expiration date (MM/YY)
- CVV security code (3 digits)
- Cardholder name
- Billing address

---

## Upgrade Steps

### Method 1: Through Web Interface

#### 1. Login
```
1. Go to: http://localhost:3000/login.html
2. Enter login credentials
3. Click "Login"
```

#### 2. Navigate to Payment Page
```
1. Go to: http://localhost:3000/payment.html
2. Or click "Upgrade Account" from dashboard
```

#### 3. Enter Payment Details
```
1. Card number: 4111111111111111 (for testing)
2. Expiration: 12/25
3. CVV: 123
4. Cardholder: Test User
5. Amount: 29.99 USD (monthly)
```

#### 4. Confirm Payment
```
1. Review entered data
2. Click "Confirm Payment"
3. Wait for confirmation message
```

### Method 2: Through API

#### 1. Get Authorization Token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

#### 2. Process Payment
```bash
curl -X POST http://localhost:3000/api/payment/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "cardNumber": "4111111111111111",
    "expiryDate": "12/25",
    "cvv": "123",
    "cardholderName": "Test User",
    "amount": 29.99,
    "currency": "USD"
  }'
```

---

## Verification

### 1. Check Subscription Status
```bash
curl -X GET http://localhost:3000/api/payment/subscription \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Verify Available Features
```javascript
// In browser
fetch('/api/payment/subscription', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(response => response.json())
.then(data => {
  console.log('Subscription Status:', data);
  if (data.data.type === 'premium') {
    console.log('✅ Premium account activated!');
    console.log('Features:', data.data.features);
  }
});
```

### 3. Success Indicators
- ✅ Confirmation message: "Payment successful and account upgraded to premium!"
- ✅ Subscription type updated to "premium"
- ✅ New features appear in dashboard
- ✅ New JWT token contains updated subscription data

---

## Available Features

### After successful upgrade, you get:

#### 🚀 Content Features
- **Unlimited Posts**: No monthly post limits
- **Custom Templates**: Create and save custom post templates
- **Advanced Scheduling**: Schedule posts for different times and future dates

#### 🤖 AI Features
- **All AI Tools**: Full access to all AI tools
- **AI Image Generation**: Create custom images for posts
- **Advanced Content Analysis**: AI-powered content performance analysis

#### 📊 Analytics Features
- **Advanced Analytics**: Detailed page performance reports
- **Multiple Page Management**: Connect and manage multiple Facebook pages
- **Competitor Tracking**: Monitor and analyze competitor performance

#### 🎯 Additional Features
- **Priority Support**: Fast and specialized technical support
- **Beta Features**: Early access to new features
- **Advanced Customization**: More interface customization options

---

## Troubleshooting

### Common Issues and Solutions:

#### ❌ Error: "Authorization token required"
**Solution:**
```javascript
// Ensure authorization token exists
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/login.html';
}
```

#### ❌ Error: "Invalid payment data"
**Solution:**
- Verify card number is correct (16 digits)
- Verify expiration date format (MM/YY)
- Verify CVV code (3 digits)

#### ❌ Error: "Payment processing failed"
**Solution:**
1. Check internet connection
2. Ensure server is running on port 3000
3. Verify payment data accuracy
4. Try again after a minute

#### ❌ Error: "User not found"
**Solution:**
```bash
# Verify JWT token validity
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response Codes:
- **200**: Request successful
- **400**: Invalid data
- **401**: Unauthorized
- **404**: Resource not found
- **500**: Server error

---

## 📞 الدعم الفني / Technical Support

إذا واجهت أي مشاكل، يرجى التواصل معنا:
If you encounter any issues, please contact us:

- **البريد الإلكتروني / Email**: support@facebook-ai-manager.com
- **الدعم الفوري / Live Chat**: متاح 24/7 للحسابات المميزة
- **الوثائق / Documentation**: [API Documentation](./docs/)

---

*آخر تحديث: 24 أكتوبر 2025*
*Last updated: October 24, 2025*