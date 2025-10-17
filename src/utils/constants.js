/**
 * Application constants
 */

const SUBSCRIPTION_TYPES = {
  FREE: 'free',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise',
};

const SUBSCRIPTION_LIMITS = {
  [SUBSCRIPTION_TYPES.FREE]: {
    postsPerDay: 10,
    pagesLimit: 1,
    aiRequestsPerDay: 50,
    analyticsHistory: 7, // days
    features: {
      basicAI: true,
      advancedAI: false,
      scheduling: false,
      analytics: true,
      competitorAnalysis: false,
      autoResponse: false,
      trendingTopics: false,
    },
  },
  [SUBSCRIPTION_TYPES.PREMIUM]: {
    postsPerDay: -1, // unlimited
    pagesLimit: 5,
    aiRequestsPerDay: 500,
    analyticsHistory: 90, // days
    features: {
      basicAI: true,
      advancedAI: true,
      scheduling: true,
      analytics: true,
      competitorAnalysis: true,
      autoResponse: true,
      trendingTopics: true,
    },
  },
  [SUBSCRIPTION_TYPES.ENTERPRISE]: {
    postsPerDay: -1, // unlimited
    pagesLimit: -1, // unlimited
    aiRequestsPerDay: -1, // unlimited
    analyticsHistory: 365, // days
    features: {
      basicAI: true,
      advancedAI: true,
      scheduling: true,
      analytics: true,
      competitorAnalysis: true,
      autoResponse: true,
      trendingTopics: true,
      customIntegrations: true,
      dedicatedSupport: true,
    },
  },
};

const POST_CATEGORIES = {
  MOTIVATIONAL: 'motivational',
  BUSINESS: 'business',
  LIFESTYLE: 'lifestyle',
  TECHNOLOGY: 'technology',
  HEALTH: 'health',
  ENTERTAINMENT: 'entertainment',
  EDUCATION: 'education',
  NEWS: 'news',
  SPORTS: 'sports',
  FOOD: 'food',
};

const POST_TONES = {
  PROFESSIONAL: 'professional',
  FRIENDLY: 'friendly',
  CASUAL: 'casual',
  FORMAL: 'formal',
  HUMOROUS: 'humorous',
  INSPIRATIONAL: 'inspirational',
  EDUCATIONAL: 'educational',
};

const POST_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  FAILED: 'failed',
  DELETED: 'deleted',
};

const ANALYTICS_PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
};

const AI_MODELS = {
  GPT_3_5_TURBO: 'gpt-3.5-turbo',
  GPT_4: 'gpt-4',
  GPT_4_TURBO: 'gpt-4-turbo-preview',
  DALL_E_2: 'dall-e-2',
  DALL_E_3: 'dall-e-3',
};

const IMAGE_SIZES = {
  SMALL: '256x256',
  MEDIUM: '512x512',
  LARGE: '1024x1024',
};

const ERROR_MESSAGES = {
  // Authentication
  UNAUTHORIZED: {
    en: 'Unauthorized access',
    ar: 'وصول غير مصرح به',
  },
  INVALID_TOKEN: {
    en: 'Invalid or expired token',
    ar: 'رمز غير صالح أو منتهي الصلاحية',
  },
  INVALID_CREDENTIALS: {
    en: 'Invalid email or password',
    ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  },

  // User
  USER_NOT_FOUND: {
    en: 'User not found',
    ar: 'المستخدم غير موجود',
  },
  USER_EXISTS: {
    en: 'User already exists',
    ar: 'المستخدم موجود بالفعل',
  },

  // Posts
  POST_NOT_FOUND: {
    en: 'Post not found',
    ar: 'المنشور غير موجود',
  },
  POSTS_LIMIT_REACHED: {
    en: 'Daily posts limit reached',
    ar: 'تم الوصول إلى حد المنشورات اليومية',
  },

  // Facebook
  FACEBOOK_NOT_CONNECTED: {
    en: 'Facebook account not connected',
    ar: 'حساب الفيسبوك غير متصل',
  },
  PAGE_NOT_FOUND: {
    en: 'Facebook page not found',
    ar: 'صفحة الفيسبوك غير موجودة',
  },

  // AI
  AI_PERMISSIONS_DISABLED: {
    en: 'AI permissions are disabled',
    ar: 'صلاحيات الذكاء الاصطناعي معطلة',
  },
  AI_REQUEST_FAILED: {
    en: 'AI request failed',
    ar: 'فشل ط��ب الذكاء الاصطناعي',
  },

  // Subscription
  SUBSCRIPTION_REQUIRED: {
    en: 'Premium subscription required',
    ar: 'يتطلب اشتراك مميز',
  },
  FEATURE_NOT_AVAILABLE: {
    en: 'Feature not available in your plan',
    ar: 'الميزة غير متاحة في خطتك',
  },

  // General
  INTERNAL_ERROR: {
    en: 'Internal server error',
    ar: 'خطأ في الخادم الداخلي',
  },
  VALIDATION_ERROR: {
    en: 'Validation error',
    ar: 'خطأ في التحقق من البيانات',
  },
  NOT_FOUND: {
    en: 'Resource not found',
    ar: 'المورد غير موجود',
  },
};

const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: {
    en: 'Logged in successfully',
    ar: 'تم تسجيل الدخول بنجاح',
  },
  SIGNUP_SUCCESS: {
    en: 'Account created successfully',
    ar: 'تم إنشاء الحساب بنجاح',
  },
  LOGOUT_SUCCESS: {
    en: 'Logged out successfully',
    ar: 'تم تسجيل الخروج بنجاح',
  },

  // Posts
  POST_CREATED: {
    en: 'Post created successfully',
    ar: 'تم إنشاء المنشور بنجاح',
  },
  POST_PUBLISHED: {
    en: 'Post published successfully',
    ar: 'تم نشر المنشور بنجاح',
  },
  POST_SCHEDULED: {
    en: 'Post scheduled successfully',
    ar: 'تم جدولة المنشور بنجاح',
  },
  POST_DELETED: {
    en: 'Post deleted successfully',
    ar: 'تم حذف المنشور بنجاح',
  },

  // Facebook
  FACEBOOK_CONNECTED: {
    en: 'Facebook account connected successfully',
    ar: 'تم ربط حساب الفيسبوك بنجاح',
  },
  PAGE_ADDED: {
    en: 'Facebook page added successfully',
    ar: 'تم إضافة صفحة الفيسبوك بنجاح',
  },

  // AI
  AI_ENABLED: {
    en: 'AI permissions enabled successfully',
    ar: 'تم تفعيل صلاحيات الذكاء الاصطناعي بنجاح',
  },
  AI_DISABLED: {
    en: 'AI permissions disabled successfully',
    ar: 'تم تعطيل صلاحيات الذكاء الاصطناعي بنجاح',
  },

  // Analytics
  ANALYTICS_FETCHED: {
    en: 'Analytics fetched successfully',
    ar: 'تم جلب التحليلات بنجاح',
  },
  ANALYTICS_UPDATED: {
    en: 'Analytics updated successfully',
    ar: 'تم تحديث التحليلات بنجاح',
  },
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
};

const CACHE_KEYS = {
  USER_PREFIX: 'user:',
  POST_PREFIX: 'post:',
  ANALYTICS_PREFIX: 'analytics:',
  FACEBOOK_PAGE_PREFIX: 'fb_page:',
  AI_RESPONSE_PREFIX: 'ai_response:',
};

const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
};

module.exports = {
  SUBSCRIPTION_TYPES,
  SUBSCRIPTION_LIMITS,
  POST_CATEGORIES,
  POST_TONES,
  POST_STATUS,
  ANALYTICS_PERIODS,
  AI_MODELS,
  IMAGE_SIZES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  HTTP_STATUS,
  CACHE_KEYS,
  CACHE_TTL,
};
