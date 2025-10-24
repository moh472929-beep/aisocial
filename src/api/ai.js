const express = require('express');
const axios = require('axios');
const dbInit = require('../db/init');
const config = require('../../config');
const { authenticateToken } = require('../middleware/auth');
const { checkAIPermissions } = require('../middleware/checkAIPermissions');
const ApiResponse = require('../utils/ApiResponse');
const { decryptToken } = require('../utils/crypto');
const ApiError = require('../utils/ApiError');
const cache = require('../utils/cache');
const { SUCCESS_MESSAGES, ERROR_MESSAGES, CACHE_KEYS, CACHE_TTL } = require('../utils/constants');
const validators = require('../utils/validators');
const openaiService = require('../services/openaiService');

const router = express.Router();

// التحقق من صلاحيات AI للمستخدم
async function hasAIPermissions(userId) {
  const userModel = dbInit.getModel('User');
  const user = await userModel.findById(userId);
  
  // التحقق من الاشتراك المميز أولاً
  if (!user || user.subscription !== 'premium') {
    return false;
  }
  
  // إذا كان المستخدم مميز، فهو يملك صلاحيات AI
  return true;
}

// تمكين صلاحيات AI للمستخدم مع دعم الصلاحيات المفصلة
router.post('/permissions/enable', authenticateToken, async (req, res, next) => {
  try {
    const userModel = dbInit.getModel('User');

    // تمكين صلاحيات AI مع الصلاحيات المفصلة
    const aiPermissions = {
      enabled: true,
      grantedAt: new Date().toISOString(),
      permissions: {
        fullAccess: false,
        autoPosting: false,
        trendPostCreation: false,
        analyticsAccess: false,
        interactionAccess: false,
      },
    };

    const updated = await userModel.update(req.user.userId, { aiPermissions });

    if (!updated) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND.en, ERROR_MESSAGES.USER_NOT_FOUND.ar);
    }

    const user = await userModel.findById(req.user.userId);
    const { password: _, ...userWithoutPassword } = user;

    // Invalidate cache
    cache.delete(`${CACHE_KEYS.USER_PREFIX}${req.user.userId}`);

    ApiResponse.success(
      res,
      {
        user: userWithoutPassword,
      },
      SUCCESS_MESSAGES.AI_ENABLED.ar
    );
  } catch (error) {
    console.error('Enable AI permissions error:', error);
    next(error);
  }
});

// تعطيل صلاحيات AI للمستخدم
router.post('/permissions/disable', authenticateToken, async (req, res, next) => {
  try {
    const userModel = dbInit.getModel('User');

    // تعطيل صلاحيات AI
    const aiPermissions = {
      enabled: false,
      disabledAt: new Date().toISOString(),
      permissions: {
        fullAccess: false,
        autoPosting: false,
        trendPostCreation: false,
        analyticsAccess: false,
        interactionAccess: false,
      },
    };

    const updated = await userModel.update(req.user.userId, { aiPermissions });

    if (!updated) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND.en, ERROR_MESSAGES.USER_NOT_FOUND.ar);
    }

    const user = await userModel.findById(req.user.userId);
    const { password: _, ...userWithoutPassword } = user;

    // Invalidate cache
    cache.delete(`${CACHE_KEYS.USER_PREFIX}${req.user.userId}`);

    ApiResponse.success(
      res,
      {
        user: userWithoutPassword,
      },
      SUCCESS_MESSAGES.AI_DISABLED.ar
    );
  } catch (error) {
    console.error('Disable AI permissions error:', error);
    next(error);
  }
});

// تحديث صلاحيات AI المفصلة للمستخدم
router.put('/permissions/update', authenticateToken, async (req, res, next) => {
  try {
    const userModel = dbInit.getModel('User');
    const { permissions } = req.body;

    // التحقق من صحة الصلاحيات المقدمة
    const validPermissions = {
      fullAccess:
        typeof permissions.fullAccess === 'boolean' ? permissions.fullAccess : undefined,
      autoPosting:
        typeof permissions.autoPosting === 'boolean' ? permissions.autoPosting : undefined,
      trendPostCreation:
        typeof permissions.trendPostCreation === 'boolean' ? permissions.trendPostCreation : undefined,
      analyticsAccess:
        typeof permissions.analyticsAccess === 'boolean' ? permissions.analyticsAccess : undefined,
      interactionAccess:
        typeof permissions.interactionAccess === 'boolean' ? permissions.interactionAccess : undefined,
    };

    // إزالة القيم غير المعرفة
    Object.keys(validPermissions).forEach(key => {
      if (validPermissions[key] === undefined) {
        delete validPermissions[key];
      }
    });

    // التحقق من وجود صلاحيات للتحديث
    if (Object.keys(validPermissions).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid permissions provided',
        errorAr: 'لم يتم تقديم صلاحيات صالحة',
      });
    }

    // الحصول على صلاحيات المستخدم الحالية
    const user = await userModel.findById(req.user.userId);
    if (!user) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND.en, ERROR_MESSAGES.USER_NOT_FOUND.ar);
    }

    // تحديث الصلاحيات
    const updatedPermissions = {
      ...user.aiPermissions,
      permissions: {
        ...user.aiPermissions?.permissions,
        ...validPermissions,
      },
    };

    const updated = await userModel.update(req.user.userId, { aiPermissions: updatedPermissions });

    if (!updated) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND.en, ERROR_MESSAGES.USER_NOT_FOUND.ar);
    }

    const updatedUser = await userModel.findById(req.user.userId);
    const { password: _, ...userWithoutPassword } = updatedUser;

    // Invalidate cache
    cache.delete(`${CACHE_KEYS.USER_PREFIX}${req.user.userId}`);

    ApiResponse.success(
      res,
      {
        user: userWithoutPassword,
      },
      'Permissions updated successfully'
    );
  } catch (error) {
    console.error('Update AI permissions error:', error);
    next(error);
  }
});

// الحصول على حالة صلاحيات AI للمستخدم
router.get('/permissions', authenticateToken, async (req, res) => {
  try {
    const userModel = dbInit.getModel('User');
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود',
      });
    }

    res.json({
      success: true,
      aiPermissions: user.aiPermissions || {
        enabled: false,
        permissions: {
          fullAccess: false,
          autoPosting: false,
          trendPostCreation: false,
          analyticsAccess: false,
          interactionAccess: false,
        },
      },
    });
  } catch (error) {
    console.error('Get AI permissions error:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
    });
  }
});

// دردشة AI باستخدام OpenAI
router.post(
  '/chat',
  authenticateToken,
  checkAIPermissions,
  validators.aiChat,
  async (req, res, next) => {
    try {
      const { message, context } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'الرسالة مطلوبة',
        });
      }

      const userModel = dbInit.getModel('User');
      const user = await userModel.findById(req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'المستخدم غير موجود',
        });
      }

      // التحقق من صلاحيات AI
      if (!(await hasAIPermissions(req.user.userId))) {
        return res.status(403).json({
          success: false,
          error: 'لا تملك صلاحيات AI مفعلة',
        });
      }

      // إعداد محادثة OpenAI
      const openaiApiKey = config.ai.openaiApiKey;

      // إعداد سياق المحادثة
      const messages = [
        {
          role: 'system',
          content: `أنت مساعد ذكي متخصص في إدارة صفحات الفيسبوك وإنشاء المحتوى لـ ${user.fullName}. يمكنك مساعدة المستخدم في إنشاء منشورات، جدولة المحتوى، وإدارة صفحاتهم على الفيسبوك بطريقة احترافية وجذابة.`,
        },
      ];

      // إضافة تفضيلات المستخدم
      if (user.aiMemory && user.aiMemory.preferences) {
        messages[0].content += `\nتفضيلات المستخدم: ${JSON.stringify(user.aiMemory.preferences)}`;
      }

      // إضافة السياق السابق إذا كان متوفرًا
      if (context && Array.isArray(context)) {
        messages.push(...context);
      }

      // إضافة رسالة المستخدم
      messages.push({
        role: 'user',
        content: message,
      });

      // استخدام خدمة OpenAI الجديدة
      const aiResponse = await openaiService.chat(messages);

      // حفظ التفاعل في ذاكرة AI (اختياري - لا يؤثر على النتيجة)
      try {
        await userModel.addInteractionToHistory(req.user.userId, {
          userMessage: message,
          aiResponse: aiResponse,
          context: context,
        });
      } catch (historyError) {
        console.warn('Failed to save interaction to history:', historyError.message);
      }

      res.json({
        success: true,
        response: aiResponse,
        messageId: Date.now().toString(),
      });
    } catch (error) {
      console.error('AI chat error:', error.response?.data || error.message);

      if (error.response?.status === 401) {
        return res.status(401).json({
          success: false,
          error: 'مفتاح API الخاص بـ OpenAI غير صحيح',
        });
      }

      if (error.response?.status === 429) {
        return res.status(429).json({
          success: false,
          error: 'تم تجاوز حد الاستخدام لـ OpenAI API',
        });
      }

      res.status(500).json({
        success: false,
        error: 'خطأ في الدردشة مع AI',
      });
    }
  }
);

// توليد صورة باستخدام DALL·E
router.post('/image', authenticateToken, async (req, res) => {
  try {
    const { prompt, size } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'وصف الصورة مطلوب',
      });
    }

    const userModel = dbInit.getModel('User');
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود',
      });
    }

    // التحقق من صلاحيات AI
    if (!(await hasAIPermissions(req.user.userId))) {
      return res.status(403).json({
        success: false,
        error: 'لا تملك صلاحيات AI مفعلة',
      });
    }

    // التحقق من الاشتراك (المستخدمون المجانيون قد يكون لديهم قيود)
    if (user.subscription === 'free') {
      // يمكننا إضافة قيود هنا إذا لزم الأمر
    }

    // إعداد مفتاح API
    const openaiApiKey = config.ai.openaiApiKey;

    // إرسال الطلب إلى DALL·E باستخدام خدمة OpenAI
    const imageUrl = await openaiService.generateImage(prompt, { size: size || '512x512' });

    // حفظ التفاعل في ذاكرة AI (اختياري - لا يؤثر على النتيجة)
    try {
      await userModel.addInteractionToHistory(req.user.userId, {
        action: 'generate_image',
        prompt: prompt,
        imageUrl: imageUrl,
      });
    } catch (historyError) {
      console.warn('Failed to save interaction to history:', historyError.message);
    }

    res.json({
      success: true,
      imageUrl: imageUrl,
      prompt: prompt,
    });
  } catch (error) {
    console.error('AI image generation error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        error: 'مفتاح API الخاص بـ OpenAI غير صحيح',
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'تم تجاوز حد الاستخدام لـ OpenAI API',
      });
    }

    res.status(500).json({
      success: false,
      error: 'خطأ في توليد الصورة',
    });
  }
});

// تحديث تفضيلات AI للمستخدم
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { preferences } = req.body;
    const userModel = dbInit.getModel('User');

    // تحديث تفضيلات AI
    const updated = await userModel.update(req.user.userId, {
      'aiMemory.preferences': preferences,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود',
      });
    }

    const user = await userModel.findById(req.user.userId);

    res.json({
      success: true,
      preferences: user.aiMemory.preferences,
    });
  } catch (error) {
    console.error('Update AI preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
    });
  }
});

// الحصول على ذاكرة AI للمستخدم
router.get('/memory', authenticateToken, async (req, res) => {
  try {
    const userModel = dbInit.getModel('User');
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود',
      });
    }

    res.json({
      success: true,
      aiMemory: user.aiMemory || {
        preferences: {},
        interactionHistory: [],
        learningData: {},
      },
    });
  } catch (error) {
    console.error('Get AI memory error:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
    });
  }
});

// Generate multiple AI post suggestions
router.post(
  '/generate-posts',
  authenticateToken,
  checkAIPermissions,
  async (req, res, next) => {
    try {
      const { topics = [], includeImages = false, count = 3, tone = 'friendly' } = req.body;
      const openaiApiKey = config.ai.openaiApiKey;
      if (!openaiApiKey) {
        return res.status(500).json({ success: false, error: 'Missing OpenAI API key' });
      }

      const prompt = `Generate ${count} concise Facebook post ideas in ${tone} tone about: ${
        Array.isArray(topics) ? topics.join(', ') : topics
      }. ${includeImages ? 'Include image suggestions where relevant.' : ''}`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'You are an assistant that generates short, engaging social media post ideas. Return as a numbered list.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
        },
        { headers: { Authorization: `Bearer ${openaiApiKey}` } }
      );

      const text = response.data.choices?.[0]?.message?.content || '';
      const suggestions = text
        .split(/\n+/)
        .map(s => s.replace(/^\d+\.?\s*/, ''))
        .filter(Boolean)
        .slice(0, count);

      ApiResponse.success(res, { suggestions }, 'Generated post suggestions');
    } catch (error) {
      next(error);
    }
  }
);

// Publish a post to a selected Facebook page
router.post('/publish', authenticateToken, checkAIPermissions, async (req, res, next) => {
  try {
    const { pageId, message, imageUrl, imageData } = req.body;
    if (!pageId || !message) {
      return ApiResponse.badRequest(res, 'pageId and message are required');
    }
    const userModel = dbInit.getModel('User');
    const user = await userModel.findById(req.user.userId);
    if (!user || !user.facebook || !user.facebook.pages) {
      return ApiResponse.notFound(res, null, 'No connected Facebook pages');
    }
    const page = user.facebook.pages.find(p => p.pageId === pageId);
    if (!page) return ApiResponse.notFound(res, null, 'Page not found');
    const pageToken = page.pageToken || decryptToken(page.pageAccessTokenEncrypted);

    let fbRes;
    if (imageData || imageUrl) {
      const photosUrl = `https://graph.facebook.com/v18.0/${pageId}/photos`;
      if (imageData) {
        const FormData = require('form-data');
        const form = new FormData();
        const base64 = imageData.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
        const buffer = Buffer.from(base64, 'base64');
        form.append('source', buffer, { filename: 'upload.jpg', contentType: 'image/jpeg' });
        form.append('caption', message);
        form.append('access_token', pageToken);
        fbRes = await axios.post(photosUrl, form, { headers: form.getHeaders() });
      } else {
        const payload = { caption: message, url: imageUrl, access_token: pageToken };
        fbRes = await axios.post(photosUrl, payload);
      }
    } else {
      const feedUrl = `https://graph.facebook.com/v18.0/${pageId}/feed`;
      const payload = { message, access_token: pageToken };
      fbRes = await axios.post(feedUrl, payload);
    }

    ApiResponse.success(
      res,
      { postId: fbRes?.data?.post_id || fbRes?.data?.id },
      'Post published'
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;
