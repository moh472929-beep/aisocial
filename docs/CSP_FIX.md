# إصلاح مشكلة سياسة أمان المحتوى (CSP) في صفحة التسجيل

## المشكلة
كانت صفحة التسجيل تواجه مشكلة حيث تتم إعادة تحميل الصفحة دون حفظ المستخدم، مع ظهور خطأ CSP في وحدة تحكم المتصفح:
```
Refused to execute inline script because it violates the following Content Security Policy directive: 'script-src self'
```

## الحل المنفذ

### 1. نقل JavaScript المضمن إلى ملف خارجي
- تم إنشاء ملف `public/js/register.js` جديد
- تم نقل جميع وظائف JavaScript من صفحة `register.html` إلى الملف الخارجي
- تم تحديث `register.html` لاستدعاء الملف الخارجي بدلاً من استخدام الكود المضمن

### 2. تحديث تكوين CSP في الخادم
- تم تحديث تكوين Helmet في `src/server.mjs` للسماح بتنفيذ النصوص البرمجية من مصادر محددة
- تم تكوين توجيهات CSP للسماح بالنصوص البرمجية من 'self' و CDNs المطلوبة
- تم تطبيق نفس التغييرات على `netlify/functions/api.js` لضمان اتساق الإعدادات عبر بيئات النشر المختلفة

### 3. تكوين CSP المحدث
```javascript
// تكوين CSP المحدث
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.render.com"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
})
```

## الفوائد
- تحسين الأمان من خلال الالتزام بأفضل ممارسات CSP
- إزالة الأخطاء في وحدة تحكم المتصفح
- تحسين قابلية الصيانة من خلال فصل JavaScript عن HTML
- ضمان عمل وظيفة التسجيل بشكل صحيح

## الخطوات المستقبلية
- مراجعة جميع صفحات التطبيق للتأكد من عدم وجود JavaScript مضمن آخر
- تنفيذ نفس النهج لأي صفحات أخرى تستخدم JavaScript مضمن
- اختبار شامل عبر متصفحات وأجهزة مختلفة للتأكد من التوافق