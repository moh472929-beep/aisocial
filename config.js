// تكوين النظام - System Configuration
const config = {
    // بيئة التشغيل - Environment
    env: process.env.NODE_ENV || 'development',
    
    // عنوان الخادم - Server URL
    baseUrl: process.env.BASE_URL || process.env.RENDER_EXTERNAL_URL || '',
    
    // منفذ الخادم - Server Port
    port: process.env.PORT || 3000,
    
    // إعدادات CORS
    corsOptions: {
        origin: process.env.ALLOWED_ORIGINS
            ? process.env.ALLOWED_ORIGINS.split(',')
            : [
                process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000',
                'https://facebook-ai-manager.netlify.app',
              ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    },
    
    // إعدادات الجلسة - Session Settings
    session: {
        secret: process.env.SESSION_SECRET || 'facebook-ai-manager-secret-key-2025',
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 ساعة
        }
    },
    
    // مسارات API
    apiPath: '/api/v1',
    
    // قاعدة البيانات - Database
    database: {
        mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/facebook_ai_manager'
    },
    
    // إعدادات Facebook API
    facebook: {
        appId: process.env.FACEBOOK_APP_ID || process.env.FB_APP_ID || '',
        appSecret: process.env.FACEBOOK_APP_SECRET || process.env.FB_APP_SECRET || '',
        redirectUri:
            process.env.FACEBOOK_REDIRECT_URI ||
            (process.env.RENDER_EXTERNAL_URL
                ? `${process.env.RENDER_EXTERNAL_URL}/auth/facebook/callback`
                : 'http://localhost:3000/auth/facebook/callback')
    },
    
    // إعدادات الذكاء الاصطناعي
    ai: {
        openaiApiKey: process.env.OPENAI_API_KEY || '',
        huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY || '',
        maxTokens: 1000,
        temperature: 0.7
    }
};

module.exports = config;