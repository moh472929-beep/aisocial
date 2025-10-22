# دليل نشر المشروع على Render

## 🚀 خطوات النشر على Render

### 1. إعداد قاعدة البيانات MongoDB Atlas

قبل النشر على Render، تحتاج إلى إعداد قاعدة بيانات MongoDB Atlas:

1. اذهب إلى [MongoDB Atlas](https://www.mongodb.com/atlas)
2. أنشئ حساب جديد أو سجل الدخول
3. أنشئ cluster جديد (اختر المستوى المجاني)
4. أنشئ مستخدم قاعدة بيانات
5. احصل على connection string

### 2. إعداد المتغيرات البيئية في Render

في لوحة تحكم Render، أضف المتغيرات التالية:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/facebook-ai-manager?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-key-here
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FB_APP_ID=your-facebook-app-id
FB_APP_SECRET=your-facebook-app-secret
OPENAI_API_KEY=your-openai-api-key
SESSION_SECRET=your-session-secret-key
ENCRYPTION_KEY=your-encryption-key
```

### 3. تحديث إعدادات التطبيق

#### تحديث ملف config.js
تأكد من أن `IS_PRODUCTION` مضبوط على `true` في ملف `public/js/config.js`:

```javascript
IS_PRODUCTION: true,
PRODUCTION_API_BASE: 'https://your-app-name.onrender.com',
```

### 4. إعدادات Render

#### Build Command:
```bash
npm install
```

#### Start Command:
```bash
npm start
```

#### Root Directory:
```
.
```

### 5. ملفات مهمة للنشر

تأكد من وجود الملفات التالية:

- `package.json` - يحتوي على dependencies
- `index.js` - نقطة البداية للتطبيق
- `.env.production` - المتغيرات البيئية للإنتاج
- `src/server.mjs` - الخادم الرئيسي

### 6. اختبار النشر

بعد النشر، اختبر الوظائف التالية:

1. **تسجيل الدخول**: `https://your-app.onrender.com/login.html`
2. **لوحة التحكم**: `https://your-app.onrender.com/dashboard.html`
3. **API Endpoints**: 
   - `https://your-app.onrender.com/api/auth/login`
   - `https://your-app.onrender.com/api/auth/profile`

### 7. استكشاف الأخطاء

#### مشاكل شائعة وحلولها:

1. **خطأ CORS**:
   - تأكد من إعدادات CORS في `src/server.mjs`
   - تأكد من أن URL الصحيح مضاف في `origin`

2. **خطأ قاعدة البيانات**:
   - تحقق من صحة `MONGODB_URI`
   - تأكد من أن IP address مسموح في MongoDB Atlas

3. **خطأ 404 في API**:
   - تحقق من أن routes مسجلة بشكل صحيح
   - تأكد من أن `config.js` يشير إلى URL الصحيح

### 8. مراقبة الأداء

- استخدم Render Logs لمراقبة الأخطاء
- تحقق من استهلاك الذاكرة والمعالج
- راقب أوقات الاستجابة

## 🔧 إعدادات إضافية

### تحسين الأداء:
- استخدم caching للبيانات المتكررة
- ضغط الاستجابات باستخدام gzip
- تحسين استعلامات قاعدة البيانات

### الأمان:
- استخدم HTTPS دائماً
- قم بتشفير البيانات الحساسة
- استخدم rate limiting للحماية من الهجمات

## 📞 الدعم

إذا واجهت مشاكل في النشر:
1. تحقق من Render Logs
2. راجع إعدادات المتغيرات البيئية
3. تأكد من صحة connection string لقاعدة البيانات