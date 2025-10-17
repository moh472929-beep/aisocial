# 💡 أمثلة عملية - Facebook AI Manager

## 📚 جدول المحتويات
1. [أمثلة API Endpoints](#أمثلة-api-endpoints)
2. [أمثلة استخدام Utilities](#أمثلة-استخدام-utilities)
3. [أمثلة Middleware](#أمثلة-middleware)
4. [أمثلة Error Handling](#أمثلة-error-handling)
5. [أمثلة Cache](#أمثلة-cache)
6. [أمثلة كاملة](#أمثلة-كاملة)

---

## 🌐 أمثلة API Endpoints

### 1. التسجيل (Signup)

**Request:**
```bash
curl -X POST http://localhost:3000/.netlify/functions/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "أحمد محمد",
    "username": "ahmed123",
    "email": "ahmed@example.com",
    "password": "Password123"
  }'
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "fullName": "أحمد محمد",
      "username": "ahmed123",
      "email": "ahmed@example.com",
      "subscription": "free",
      "postsRemaining": 10,
      "createdAt": "2025-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**Response (Error - Email exists):**
```json
{
  "success": false,
  "error": "User already exists",
  "errorAr": "المستخدم موجود بالفعل",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 2. تسجيل الدخول (Login)

**Request:**
```bash
curl -X POST http://localhost:3000/.netlify/functions/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed@example.com",
    "password": "Password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "fullName": "أحمد محمد",
      "email": "ahmed@example.com",
      "subscription": "free",
      "postsRemaining": 8
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2025-01-15T10:35:00.000Z"
}
```

### 3. الحصول على الملف الشخصي

**Request:**
```bash
curl -X GET http://localhost:3000/.netlify/functions/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "fullName": "أحمد محمد",
      "username": "ahmed123",
      "email": "ahmed@example.com",
      "subscription": "free",
      "postsRemaining": 8,
      "aiPermissions": {
        "enabled": true,
        "permissions": {
          "createPosts": true,
          "schedulePosts": true,
          "generateContent": true
        }
      },
      "facebookPages": [
        {
          "pageId": "123456789",
          "pageName": "صفحتي على الفيسبوك",
          "category": "Business"
        }
      ]
    }
  },
  "timestamp": "2025-01-15T10:40:00.000Z"
}
```

### 4. تفعيل صلاحيات AI

**Request:**
```bash
curl -X POST http://localhost:3000/.netlify/functions/api/ai/permissions/enable \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "message": "تم تمكين صلاحيات AI بنجاح",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "aiPermissions": {
        "enabled": true,
        "grantedAt": "2025-01-15T10:45:00.000Z",
        "permissions": {
          "createPosts": true,
          "schedulePosts": true,
          "manageFacebookPages": true,
          "generateContent": true,
          "generateImages": true
        }
      }
    }
  },
  "timestamp": "2025-01-15T10:45:00.000Z"
}
```

### 5. دردشة مع AI

**Request:**
```bash
curl -X POST http://localhost:3000/.netlify/functions/api/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "اقترح لي أفكار لمنشورات تحفيزية",
    "context": []
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "بالتأكيد! إليك بعض الأفكار لمنشورات تحفيزية:\n\n1. 'النجاح ليس نهاية الطريق، والفشل ليس نهاية العالم. الشجاعة للاستمرار هي ما يهم.'\n\n2. 'كل يوم جديد هو فرصة لتحقيق شيء رائع. ابدأ اليوم بطاقة إيجابية!'\n\n3. 'لا تنتظر الفرصة المثالية، اصنعها بنفسك!'\n\nهل تريد المزيد من الأفكار؟",
    "messageId": "1705315500000"
  },
  "timestamp": "2025-01-15T10:50:00.000Z"
}
```

### 6. توليد صورة بالـ AI

**Request:**
```bash
curl -X POST http://localhost:3000/.netlify/functions/api/ai/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "منظر طبيعي جميل مع شروق الشمس",
    "size": "512x512"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://oaidalleapiprodscus.blob.core.windows.net/...",
    "prompt": "منظر طبيعي جميل مع شروق الشمس"
  },
  "timestamp": "2025-01-15T10:55:00.000Z"
}
```

### 7. إنشاء منشور

**Request:**
```bash
curl -X POST http://localhost:3000/.netlify/functions/api/facebook/generate-post \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pageId": "123456789",
    "category": "motivational",
    "tone": "friendly",
    "customPrompt": "عن أهمية التعلم المستمر"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "تم إنشاء المنشور بنجاح",
  "data": {
    "post": {
      "id": "1705315800000",
      "content": "التعلم المستمر هو مفتاح النجاح في عصرنا الحالي! 📚\n\nكل يوم تتعلم فيه شيئاً جديداً هو يوم لم يضع هباءً. استثمر في نفسك، اقرأ كتاباً، شاهد دورة تدريبية، أو تعلم مهارة جديدة.\n\nتذكر: المعرفة هي القوة الحقيقية! 💪\n\n#التعلم_المستمر #تطوير_الذات #النجاح",
      "category": "motivational",
      "tone": "friendly",
      "createdAt": "2025-01-15T11:00:00.000Z",
      "status": "draft",
      "pageId": "123456789"
    },
    "postsRemaining": 7
  },
  "timestamp": "2025-01-15T11:00:00.000Z"
}
```

### 8. نشر منشور على Facebook

**Request:**
```bash
curl -X POST http://localhost:3000/.netlify/functions/api/facebook/publish-post \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "1705315800000",
    "pageId": "123456789"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "تم نشر المنشور بنجاح",
  "data": {
    "post": {
      "id": "1705315800000",
      "status": "published",
      "publishedAt": "2025-01-15T11:05:00.000Z",
      "facebookPostId": "123456789_987654321"
    },
    "facebookPostId": "123456789_987654321"
  },
  "timestamp": "2025-01-15T11:05:00.000Z"
}
```

### 9. جدولة منشور

**Request:**
```bash
curl -X POST http://localhost:3000/.netlify/functions/api/facebook/schedule-post \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "1705315800000",
    "pageId": "123456789",
    "scheduledTime": "2025-01-16T10:00:00.000Z"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "تم جدولة المنشور بنجاح",
  "data": {
    "post": {
      "id": "1705315800000",
      "status": "scheduled",
      "scheduledAt": "2025-01-15T11:10:00.000Z",
      "scheduledTime": "2025-01-16T10:00:00.000Z",
      "facebookPostId": "123456789_987654322"
    }
  },
  "timestamp": "2025-01-15T11:10:00.000Z"
}
```

### 10. الحصول على التحليلات

**Request:**
```bash
curl -X GET "http://localhost:3000/.netlify/functions/api/facebook/analytics/123456789" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analytics": {
      "userId": "507f1f77bcf86cd799439011",
      "pageId": "123456789",
      "period": "daily",
      "totalPosts": 25,
      "totalLikes": 1250,
      "totalShares": 85,
      "totalComments": 320,
      "totalViews": 5600,
      "totalFollowers": 2500,
      "engagementRate": 66.2,
      "followerGrowth": 12.5,
      "topPosts": [
        {
          "postId": "123456789_111",
          "content": "منشور رائع...",
          "likes": 250,
          "shares": 20,
          "comments": 45,
          "totalEngagement": 315
        }
      ],
      "bestPostTimes": [
        { "hour": 10, "averageEngagement": 85.5 },
        { "hour": 14, "averageEngagement": 78.2 },
        { "hour": 20, "averageEngagement": 92.1 }
      ],
      "page": {
        "fanCount": 2500,
        "followersCount": 2480
      },
      "fetchedAt": "2025-01-15T11:15:00.000Z"
    }
  },
  "timestamp": "2025-01-15T11:15:00.000Z"
}
```

---

## 🛠️ أمثلة استخدام Utilities

### 1. ApiError

```javascript
const ApiError = require('../utils/ApiError');

// مثال 1: Not Found
if (!user) {
  throw ApiError.notFound('User not found', 'المستخدم غير موجود');
}

// مثال 2: Unauthorized
if (!token) {
  throw ApiError.unauthorized('Token required', 'الرمز مطلوب');
}

// مثال 3: Bad Request
if (!email || !password) {
  throw ApiError.badRequest('Missing required fields', 'حقول مطلوبة مفقودة');
}

// مثال 4: Forbidden
if (user.subscription === 'free' && feature === 'premium') {
  throw ApiError.forbidden('Premium feature', 'ميزة مميزة');
}

// مثال 5: Conflict
if (existingUser) {
  throw ApiError.conflict('User already exists', 'المستخدم موجود بالفعل');
}

// مثال 6: Too Many Requests
if (requestCount > limit) {
  throw ApiError.tooManyRequests('Rate limit exceeded', 'تم تجاوز الحد');
}

// مثال 7: Internal Error
try {
  await riskyOperation();
} catch (error) {
  throw ApiError.internal('Operation failed', 'فشلت العملية');
}
```

### 2. ApiResponse

```javascript
const ApiResponse = require('../utils/ApiResponse');

// مثال 1: Success
ApiResponse.success(res, userData, 'User fetched successfully');

// مثال 2: Created
ApiResponse.created(res, newPost, 'Post created successfully');

// مثال 3: No Content
ApiResponse.noContent(res);

// مثال 4: Error
ApiResponse.error(res, 'Invalid data', 400);

// مثال 5: Paginated
const posts = await Post.find().skip(skip).limit(limit);
const total = await Post.countDocuments();
ApiResponse.paginated(res, posts, page, limit, total, 'Posts fetched');
```

### 3. Cache

```javascript
const cache = require('../utils/cache');

// مثال 1: Set and Get
cache.set('user:123', userData, 300); // 5 minutes
const user = cache.get('user:123');

// مثال 2: Get or Set
const analytics = await cache.getOrSet(
  'analytics:page123',
  async () => {
    return await fetchAnalyticsFromFacebook('page123');
  },
  3600 // 1 hour
);

// مثال 3: Delete
cache.delete('user:123');

// مثال 4: Delete Pattern
cache.deletePattern('user:*'); // حذف جميع مفاتيح المستخدمين

// مثال 5: Clear All
cache.clear();

// مثال 6: Check if exists
if (cache.has('user:123')) {
  console.log('User in cache');
}

// مثال 7: Get Stats
const stats = cache.stats();
console.log(`Cache size: ${stats.size}, Keys: ${stats.keys}`);
```

### 4. Helpers

```javascript
const {
  formatDate,
  timeAgo,
  calculateEngagementRate,
  parsePagination,
  truncateText,
  sanitizeInput,
  isValidEmail,
  generateSlug,
  retryWithBackoff
} = require('../utils/helpers');

// مثال 1: Format Date
const arabicDate = formatDate(new Date(), 'ar-SA');
// "١٥ يناير ٢٠٢٥، ١١:٣٠"

// مثال 2: Time Ago
const timeString = timeAgo(post.createdAt, 'ar');
// "منذ 5 دقائق"

// مثال 3: Calculate Engagement Rate
const engagement = calculateEngagementRate(
  post.likes,    // 100
  post.comments, // 20
  post.shares,   // 10
  page.followers // 1000
);
// 13.0%

// مثال 4: Parse Pagination
const { page, limit, skip } = parsePagination(req.query.page, req.query.limit);
// { page: 2, limit: 10, skip: 10 }

// مثال 5: Truncate Text
const shortText = truncateText(longText, 100);
// "This is a long text that will be truncated..."

// مثال 6: Sanitize Input
const cleanInput = sanitizeInput(userInput);
// Removes <script>, javascript:, etc.

// مثال 7: Validate Email
if (isValidEmail('test@example.com')) {
  console.log('Valid email');
}

// مثال 8: Generate Slug
const slug = generateSlug('مقال رائع عن البرمجة');
// "مقال-رائع-عن-البرمجة"

// مثال 9: Retry with Backoff
const result = await retryWithBackoff(
  async () => await fetchFromAPI(),
  3,    // max retries
  1000  // base delay (ms)
);
```

### 5. Constants

```javascript
const {
  SUBSCRIPTION_TYPES,
  SUBSCRIPTION_LIMITS,
  POST_CATEGORIES,
  POST_TONES,
  POST_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  HTTP_STATUS,
  CACHE_KEYS,
  CACHE_TTL
} = require('../utils/constants');

// مثال 1: Subscription Types
if (user.subscription === SUBSCRIPTION_TYPES.FREE) {
  console.log('Free user');
}

// مثال 2: Subscription Limits
const limits = SUBSCRIPTION_LIMITS[user.subscription];
if (user.postsToday >= limits.postsPerDay) {
  throw ApiError.forbidden(ERROR_MESSAGES.POSTS_LIMIT_REACHED.ar);
}

// مثال 3: Post Categories
const validCategories = Object.values(POST_CATEGORIES);
if (!validCategories.includes(category)) {
  throw ApiError.badRequest('Invalid category');
}

// مثال 4: Error Messages
return res.status(HTTP_STATUS.NOT_FOUND).json({
  error: ERROR_MESSAGES.USER_NOT_FOUND.en,
  errorAr: ERROR_MESSAGES.USER_NOT_FOUND.ar
});

// مثال 5: Cache Keys
const cacheKey = `${CACHE_KEYS.USER_PREFIX}${userId}`;
cache.set(cacheKey, userData, CACHE_TTL.LONG);
```

### 6. Validators

```javascript
const validators = require('../utils/validators');

// مثال 1: Signup
router.post('/signup', validators.signup, signupHandler);

// مثال 2: Login
router.post('/login', validators.login, loginHandler);

// مثال 3: Create Post
router.post('/posts', validators.createPost, createPostHandler);

// مثال 4: AI Chat
router.post('/ai/chat', validators.aiChat, chatHandler);

// مثال 5: Generate Image
router.post('/ai/image', validators.generateImage, imageHandler);

// مثال 6: Pagination
router.get('/posts', validators.pagination, getPostsHandler);

// مثال 7: MongoDB ID
router.get('/users/:id', validators.mongoId, getUserHandler);
```

---

## 🔐 أمثلة Middleware

### 1. Authentication

```javascript
const { authenticateToken } = require('../middleware/auth');

// مثال 1: Protect Route
router.get('/profile', authenticateToken, (req, res) => {
  // req.user متاح هنا
  const userId = req.user.userId;
  // ...
});

// مثال 2: Optional Authentication
router.get('/posts', optionalAuth, (req, res) => {
  if (req.user) {
    // User is authenticated
  } else {
    // User is not authenticated
  }
});
```

### 2. Check AI Permissions

```javascript
const { checkAIPermissions } = require('../middleware/checkAIPermissions');

// مثال 1: Require AI Permissions
router.post('/generate-content',
  authenticateToken,
  checkAIPermissions,
  generateContentHandler
);

// مثال 2: في الـ handler
async function generateContentHandler(req, res) {
  // req.userData متاح هنا مع بيانات المستخدم الكاملة
  const user = req.userData;
  
  if (user.aiPermissions.enabled) {
    // Generate content
  }
}
```

### 3. Check Subscription

```javascript
const { checkSubscription } = require('../middleware/checkAIPermissions');

// مثال 1: Require Premium
router.post('/premium-feature',
  authenticateToken,
  checkSubscription('premium'),
  premiumFeatureHandler
);

// مثال 2: Require Enterprise
router.post('/enterprise-feature',
  authenticateToken,
  checkSubscription('enterprise'),
  enterpriseFeatureHandler
);
```

### 4. Check Posts Remaining

```javascript
const { checkPostsRemaining } = require('../middleware/checkAIPermissions');

// ��ثال: Check before creating post
router.post('/create-post',
  authenticateToken,
  checkPostsRemaining,
  createPostHandler
);
```

---

## 🚨 أمثلة Error Handling

### 1. Try-Catch مع ApiError

```javascript
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

router.post('/create-user', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      throw ApiError.badRequest('Missing required fields', 'حقول مطلوبة مفقودة');
    }
    
    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw ApiError.conflict('User already exists', 'المستخدم موجود بالفعل');
    }
    
    // Create user
    const user = await User.create({ email, password });
    
    // Success response
    ApiResponse.created(res, user, 'User created successfully');
    
  } catch (error) {
    next(error); // Pass to error handler middleware
  }
});
```

### 2. Error Handler Middleware

```javascript
// في netlify/functions/api.js
const ApiError = require('../../src/utils/ApiError');
const { logger } = require('../../src/middleware/errorHandler');

app.use((err, req, res, next) => {
  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.userId
  });
  
  // Handle ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      errorAr: err.messageAr,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
  
  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errorAr: 'فشل التحقق من البيانات',
      details: Object.values(err.errors).map(e => e.message)
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      errorAr: 'رمز غير صالح'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired',
      errorAr: 'انتهت صلاحية الرمز'
    });
  }
  
  // Default error
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Something went wrong' 
    : err.message;
    
  res.status(statusCode).json({
    success: false,
    error: message,
    errorAr: 'حدث خطأ ما',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

---

## 💾 أمثلة Cache

### 1. Cache للمستخدمين

```javascript
const cache = require('../utils/cache');
const { CACHE_KEYS, CACHE_TTL } = require('../utils/constants');

async function getUserById(userId) {
  const cacheKey = `${CACHE_KEYS.USER_PREFIX}${userId}`;
  
  // Try cache first
  const cachedUser = cache.get(cacheKey);
  if (cachedUser) {
    return cachedUser;
  }
  
  // Fetch from database
  const user = await User.findById(userId);
  
  // Cache for 1 hour
  cache.set(cacheKey, user, CACHE_TTL.LONG);
  
  return user;
}
```

### 2. Cache للتحليلات

```javascript
async function getAnalytics(pageId) {
  const cacheKey = `${CACHE_KEYS.ANALYTICS_PREFIX}${pageId}`;
  
  return await cache.getOrSet(
    cacheKey,
    async () => {
      // Fetch from Facebook API
      const analytics = await fetchAnalyticsFromFacebook(pageId);
      return analytics;
    },
    CACHE_TTL.LONG // 1 hour
  );
}
```

### 3. Invalidate Cache عند التحديث

```javascript
async function updateUser(userId, updateData) {
  // Update in database
  await User.updateOne({ _id: userId }, updateData);
  
  // Invalidate cache
  const cacheKey = `${CACHE_KEYS.USER_PREFIX}${userId}`;
  cache.delete(cacheKey);
  
  // Or invalidate all user caches
  cache.deletePattern(`${CACHE_KEYS.USER_PREFIX}*`);
}
```

---

## 🎯 أمثلة كاملة

### مثال 1: API كامل مع جميع التحسينات

```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { checkAIPermissions, checkPostsRemaining } = require('../middleware/checkAIPermissions');
const validators = require('../utils/validators');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const cache = require('../utils/cache');
const { 
  CACHE_KEYS, 
  CACHE_TTL,
  SUCCESS_MESSAGES,
  POST_STATUS
} = require('../utils/constants');
const { 
  parsePagination,
  buildPaginationResponse,
  sanitizeInput
} = require('../utils/helpers');
const dbInit = require('../db/init');

// Get all posts with pagination and caching
router.get('/posts',
  authenticateToken,
  validators.pagination,
  async (req, res, next) => {
    try {
      const { page, limit, skip } = parsePagination(
        req.query.page,
        req.query.limit
      );
      
      const cacheKey = `${CACHE_KEYS.POST_PREFIX}${req.user.userId}:${page}:${limit}`;
      
      // Try cache first
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return ApiResponse.success(res, cachedData, 'Posts from cache');
      }
      
      // Fetch from database
      const postModel = dbInit.getModel('Post');
      const posts = await postModel.findByUserId(req.user.userId);
      const paginatedPosts = posts.slice(skip, skip + limit);
      const total = posts.length;
      
      const response = buildPaginationResponse(paginatedPosts, page, limit, total);
      
      // Cache for 5 minutes
      cache.set(cacheKey, response, CACHE_TTL.MEDIUM);
      
      ApiResponse.success(res, response, 'Posts fetched successfully');
      
    } catch (error) {
      next(error);
    }
  }
);

// Create new post with all checks
router.post('/posts',
  authenticateToken,
  checkAIPermissions,
  checkPostsRemaining,
  validators.createPost,
  async (req, res, next) => {
    try {
      const { pageId, category, tone, customPrompt, imageUrl } = req.body;
      
      // Sanitize input
      const sanitizedPrompt = customPrompt ? sanitizeInput(customPrompt) : null;
      
      // Generate content using AI
      const content = await generateAIContent(
        category,
        tone,
        sanitizedPrompt,
        req.userData
      );
      
      // Create post
      const postModel = dbInit.getModel('Post');
      const post = await postModel.create({
        userId: req.user.userId,
        pageId,
        content,
        category,
        tone,
        imageUrl,
        status: POST_STATUS.DRAFT,
        createdAt: new Date()
      });
      
      // Update user's posts remaining (for free users)
      if (req.userData.subscription === 'free') {
        const userModel = dbInit.getModel('User');
        await userModel.update(req.user.userId, {
          postsRemaining: req.userData.postsRemaining - 1
        });
      }
      
      // Invalidate cache
      cache.deletePattern(`${CACHE_KEYS.POST_PREFIX}${req.user.userId}:*`);
      
      ApiResponse.created(res, post, SUCCESS_MESSAGES.POST_CREATED.ar);
      
    } catch (error) {
      next(error);
    }
  }
);

// Get single post
router.get('/posts/:id',
  authenticateToken,
  validators.mongoId,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const cacheKey = `${CACHE_KEYS.POST_PREFIX}${id}`;
      
      // Try cache
      const cachedPost = cache.get(cacheKey);
      if (cachedPost) {
        return ApiResponse.success(res, cachedPost, 'Post from cache');
      }
      
      // Fetch from database
      const postModel = dbInit.getModel('Post');
      const post = await postModel.findById(id);
      
      if (!post) {
        throw ApiError.notFound('Post not found', 'المنشور غير موجود');
      }
      
      // Check ownership
      if (post.userId !== req.user.userId) {
        throw ApiError.forbidden('Access denied', 'الوصول مرفوض');
      }
      
      // Cache for 5 minutes
      cache.set(cacheKey, post, CACHE_TTL.MEDIUM);
      
      ApiResponse.success(res, post, 'Post fetched successfully');
      
    } catch (error) {
      next(error);
    }
  }
);

// Update post
router.put('/posts/:id',
  authenticateToken,
  validators.mongoId,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { content, imageUrl } = req.body;
      
      // Sanitize input
      const sanitizedContent = content ? sanitizeInput(content) : null;
      
      // Find post
      const postModel = dbInit.getModel('Post');
      const post = await postModel.findById(id);
      
      if (!post) {
        throw ApiError.notFound('Post not found', 'المنشور غير موجود');
      }
      
      // Check ownership
      if (post.userId !== req.user.userId) {
        throw ApiError.forbidden('Access denied', 'الوصول مرفوض');
      }
      
      // Update post
      const updateData = {};
      if (sanitizedContent) updateData.content = sanitizedContent;
      if (imageUrl) updateData.imageUrl = imageUrl;
      updateData.updatedAt = new Date();
      
      await postModel.update(id, updateData);
      
      // Invalidate cache
      cache.delete(`${CACHE_KEYS.POST_PREFIX}${id}`);
      cache.deletePattern(`${CACHE_KEYS.POST_PREFIX}${req.user.userId}:*`);
      
      // Get updated post
      const updatedPost = await postModel.findById(id);
      
      ApiResponse.success(res, updatedPost, 'Post updated successfully');
      
    } catch (error) {
      next(error);
    }
  }
);

// Delete post
router.delete('/posts/:id',
  authenticateToken,
  validators.mongoId,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Find post
      const postModel = dbInit.getModel('Post');
      const post = await postModel.findById(id);
      
      if (!post) {
        throw ApiError.notFound('Post not found', 'المنشور غير موجود');
      }
      
      // Check ownership
      if (post.userId !== req.user.userId) {
        throw ApiError.forbidden('Access denied', 'الوصول مرفوض');
      }
      
      // Delete post
      await postModel.delete(id);
      
      // Invalidate cache
      cache.delete(`${CACHE_KEYS.POST_PREFIX}${id}`);
      cache.deletePattern(`${CACHE_KEYS.POST_PREFIX}${req.user.userId}:*`);
      
      ApiResponse.success(res, null, SUCCESS_MESSAGES.POST_DELETED.ar);
      
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
```

---

## 🎓 الخلاصة

هذه الأمثلة توضح:
1. ✅ كيفية استخدام جميع الـ utilities الجديدة
2. ✅ أفضل الممارسات في كتابة APIs
3. ✅ معالجة الأخطاء بشكل صحيح
4. ✅ استخدام Cache بفعالية
5. ✅ Validation شامل
6. ✅ استجابات موحدة

**نصيحة:** استخدم هذه الأمثلة كمرجع عند كتابة كود جديد! 🚀

---

**آخر تحديث:** يناير 2025  
**الإصدار:** 1.0
