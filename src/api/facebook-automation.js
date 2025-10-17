const express = require('express');
const axios = require('axios');
const { encryptToken, decryptToken } = require('../utils/crypto');
const dbInit = require('../db/init');
const config = require('../../config');
const { authenticateToken } = require('../middleware/auth');
const { checkSubscription } = require('../middleware/checkAIPermissions');

const router = express.Router();

// Use shared JWT authentication middleware
router.use(authenticateToken);

// التحقق من صلاحيات AI للمستخدم
async function hasAIPermissions(userId) {
  const userModel = dbInit.getModel('User');
  const user = await userModel.findById(userId);
  return user && user.aiPermissions && user.aiPermissions.enabled === true;
}

// Facebook OAuth توجيه المستخدم لتسجيل الدخول
router.get('/auth', checkSubscription('premium'), (req, res) => {
  const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${config.facebook.appId}&redirect_uri=${config.facebook.redirectUri}&scope=pages_manage_posts,pages_read_engagement,pages_show_list&response_type=code`;
  res.redirect(facebookAuthUrl);
});

// New alias for OAuth connect (Render-friendly path)
router.get('/connect', checkSubscription('premium'), (req, res) => {
  const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${config.facebook.appId}&redirect_uri=${config.facebook.redirectUri}&scope=pages_manage_posts,pages_read_engagement,pages_show_list&response_type=code`;
  res.redirect(facebookAuthUrl);
});

// Facebook OAuth معالجة رد الاتصال
router.get('/auth/callback', checkSubscription('premium'), async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'رمز التفويض مفقود',
      });
    }

    // الحصول على رمز الوصول
    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${config.facebook.appId}&redirect_uri=${config.facebook.redirectUri}&client_secret=${config.facebook.appSecret}&code=${code}`;

    const tokenResponse = await axios.get(tokenUrl);
    const accessToken = tokenResponse.data.access_token;

    // الحصول على معلومات المستخدم
    const userUrl = `https://graph.facebook.com/v18.0/me?access_token=${accessToken}&fields=id,name`;
    const userResponse = await axios.get(userUrl);
    const facebookUserId = userResponse.data.id;
    const facebookUserName = userResponse.data.name;

    // الحصول على صفحات المستخدم
    const pagesUrl = `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`;
    const pagesResponse = await axios.get(pagesUrl);
    const facebookPages = pagesResponse.data.data;

    // تحديث معلومات المستخدم في قاعدة البيانات
    const userModel = dbInit.getModel('User');
    const facebookPageModel = dbInit.getModel('FacebookPage');

    // حفظ صفحات الفيسبوك
    for (const page of facebookPages) {
      try {
        await facebookPageModel.create({
          userId: req.user.userId,
          pageId: page.id,
          pageToken: page.access_token,
          pageName: page.name,
          category: page.category,
          connectedAt: new Date().toISOString(),
        });
      } catch (error) {
        // Page might already be connected, continue
        console.log('Page already connected or error:', error.message);
      }
    }

    // تحديث معلومات الفيسبوك للمستخدم مع تخزين التوكنات بشكل مشفر
    const facebookData = {
      userId: facebookUserId,
      userName: facebookUserName,
      accessToken: undefined, // deprecated
      userAccessTokenEncrypted: encryptToken(accessToken),
      pages: facebookPages.map(page => ({
        pageId: page.id,
        pageName: page.name,
        pageToken: page.access_token, // legacy for backward compatibility
        pageAccessTokenEncrypted: encryptToken(page.access_token),
        category: page.category,
        connectedAt: new Date().toISOString(),
      })),
      connectedAt: new Date().toISOString(),
    };

    await userModel.update(req.user.userId, { facebook: facebookData });

    res.json({
      success: true,
      message: 'تم الاتصال بفيسبوك بنجاح',
      facebook: facebookData,
    });
  } catch (error) {
    console.error('Facebook OAuth error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'خطأ في الاتصال بفيسبوك',
    });
  }
});

// New alias for callback (Render-friendly path)
router.get('/callback', checkSubscription('premium'), async (req, res) => {
  req.url = '/auth/callback';
  router._router.stack.find(r => r.route && r.route.path === '/auth/callback').route.stack[0].handle(
    req,
    res
  );
});

// الحصول على صفحات فيسبوك المتصلة
router.get('/pages', checkSubscription('premium'), async (req, res) => {
  try {
    const userModel = dbInit.getModel('User');
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود',
      });
    }

    if (!user.facebook || !user.facebook.pages) {
      return res.json({
        success: true,
        pages: [],
      });
    }

    const safePages = user.facebook.pages.map(p => ({
      pageId: p.pageId,
      pageName: p.pageName,
      category: p.category,
      connectedAt: p.connectedAt,
    }));
    res.json({ success: true, pages: safePages });
  } catch (error) {
    console.error('Get Facebook pages error:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في الحصول على صفحات فيسبوك',
    });
  }
});

// الحصول على تحليلات صفحة فيسبوك
router.get('/analytics/:pageId', checkSubscription('premium'), async (req, res) => {
  try {
    const { pageId } = req.params;
    const userModel = dbInit.getModel('User');
    const postModel = dbInit.getModel('Post');
    const analyticsModel = dbInit.getModel('Analytics');
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود',
      });
    }

    // البحث عن صفحة الفيس بوك
    const facebookPage = user.facebook?.pages?.find(p => p.pageId === pageId);
    if (!facebookPage) {
      return res.status(404).json({
        success: false,
        error: 'صفحة الفيس بوك غير موجودة',
      });
    }

    // الحصول على معلومات الصفحة
    const pageToken = facebookPage.pageToken || decryptToken(facebookPage.pageAccessTokenEncrypted);
    const pageUrl = `https://graph.facebook.com/v18.0/${pageId}?access_token=${pageToken}&fields=fan_count,followers_count`;
    const pageResponse = await axios.get(pageUrl);

    // الحصول على منشورات الصفحة
    const postsUrl = `https://graph.facebook.com/v18.0/${pageId}/posts?access_token=${pageToken}&limit=50`;
    const postsResponse = await axios.get(postsUrl);

    // تحليل التفاعل وحفظ البيانات
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalViews = 0;

    // معالجة كل منشور وحفظه في قاعدة البيانات
    for (const post of postsResponse.data.data) {
      try {
        const postUrl = `https://graph.facebook.com/v18.0/${post.id}?access_token=${pageToken}&fields=id,message,created_time,likes.summary(true),comments.summary(true),shares,views`;
        const postResponse = await axios.get(postUrl);

        const postData = {
          postId: postResponse.data.id,
          pageId: pageId,
          userId: req.user.userId,
          content: postResponse.data.message || '',
          type: postResponse.data.message ? 'text' : 'media',
          createdAt: new Date(postResponse.data.created_time),
          likes: postResponse.data.likes?.summary?.total_count || 0,
          shares: postResponse.data.shares?.count || 0,
          comments: postResponse.data.comments?.summary?.total_count || 0,
          views: postResponse.data.views?.count || 0,
        };

        // حفظ المنشور في قاعدة البيانات
        await postModel.create(postData);

        totalLikes += postData.likes;
        totalComments += postData.comments;
        totalShares += postData.shares;
        totalViews += postData.views || 0;
      } catch (error) {
        // Continue with next post if one fails
        console.log('Error getting post details:', error.message);
      }
    }

    // حساب معدل التفاعل
    const totalFollowers = pageResponse.data.fan_count || 0;
    const engagementRate =
      totalFollowers > 0 ? ((totalLikes + totalShares + totalComments) / totalFollowers) * 100 : 0;

    // الحصول على أفضل المنشورات
    const topPosts = await postModel.getTopPostsByEngagement(req.user.userId, 5);

    // حساب أفضل أوقات النشر (مimplified implementation)
    const bestPostTimes = [];

    const analytics = {
      userId: req.user.userId,
      pageId: pageId,
      period: 'daily',
      totalPosts: postsResponse.data.data.length,
      totalLikes,
      totalShares,
      totalComments,
      totalViews,
      totalFollowers,
      engagementRate: parseFloat(engagementRate.toFixed(2)),
      followerGrowth: 0, // سيتم حسابه لاحقاً
      topPosts,
      bestPostTimes,
      page: {
        fanCount: pageResponse.data.fan_count || 0,
        followersCount: pageResponse.data.followers_count || 0,
      },
      posts: {
        count: postsResponse.data.data.length,
        totalLikes,
        totalComments,
        totalShares,
        averageEngagement:
          postsResponse.data.data.length > 0
            ? (totalLikes + totalComments + totalShares) / postsResponse.data.data.length
            : 0,
      },
      fetchedAt: new Date().toISOString(),
    };

    // حفظ التحليلات في قاعدة البيانات
    await analyticsModel.updateByUserIdAndPageId(req.user.userId, pageId, analytics);

    // حفظ التحليلات في بيانات المستخدم
    await userModel.updateEngagementMetrics(req.user.userId, {
      page: analytics.page,
      posts: analytics.posts,
    });

    res.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error('Get Facebook analytics error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'خطأ في الحصول على تحليلات فيسبوك',
    });
  }
});

// إنشاء منشور جديد باستخدام الذكاء الاصطناعي
router.post('/generate-post', checkSubscription('premium'), async (req, res) => {
  try {
    const { pageId, category, tone, customPrompt, imageUrl } = req.body;

    const userModel = dbInit.getModel('User');
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود',
      });
    }

    // التحقق من صلاحيات AI إذا كان الطلب من AI
    const isAIRequest = req.headers['x-ai-request'] === 'true';
    if (isAIRequest && !(await hasAIPermissions(req.user.userId))) {
      return res.status(403).json({
        success: false,
        error: 'لا تملك صلاحيات AI مفعلة',
      });
    }

    // التحقق من عدد المنشورات المتبقية
    if (user.subscription === 'free' && user.postsRemaining <= 0) {
      return res.status(403).json({
        success: false,
        error: 'لقد استنفدت عدد المنشورات المجانية اليوم. ترق إلى الخطة المميزة للمزيد.',
      });
    }

    // إنشاء المحتوى باستخدام الذكاء الاصطناعي
    const postContent = await generateAIContent(category, tone, customPrompt, user);

    // إنشاء المنشور
    const newPost = {
      id: Date.now().toString(),
      content: postContent,
      category,
      tone,
      imageUrl,
      createdAt: new Date().toISOString(),
      status: 'draft',
      pageId,
    };

    // حفظ المنشور في بيانات المستخدم
    await userModel.addPostToHistory(req.user.userId, newPost);

    // تقليل عدد المنشورات المتبقية للمستخدمين المجانيين
    if (user.subscription === 'free') {
      const newPostsRemaining = Math.max(0, user.postsRemaining - 1);
      await userModel.update(req.user.userId, { postsRemaining: newPostsRemaining });
    }

    res.json({
      success: true,
      post: newPost,
      postsRemaining:
        user.subscription === 'free'
          ? Math.max(0, (user.postsRemaining || 10) - 1)
          : user.postsRemaining,
    });
  } catch (error) {
    console.error('Generate post error:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في إنشاء المنشور',
    });
  }
});

// نشر المنشور على الفيس بوك
router.post('/publish-post', checkSubscription('premium'), async (req, res) => {
  try {
    const { postId, pageId } = req.body;
    const userModel = dbInit.getModel('User');
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود',
      });
    }

    // التحقق من صلاحيات AI إذا كان الطلب من AI
    const isAIRequest = req.headers['x-ai-request'] === 'true';
    if (isAIRequest && !(await hasAIPermissions(req.user.userId))) {
      return res.status(403).json({
        success: false,
        error: 'لا تملك صلاحيات AI مفعلة',
      });
    }

    // البحث عن المنشور
    const post = user.postsHistory?.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'المنشور غير موجود',
      });
    }

    // البحث عن صفحة الفيس بوك
    const facebookPage = user.facebook?.pages?.find(p => p.pageId === pageId);
    if (!facebookPage) {
      return res.status(404).json({
        success: false,
        error: 'صفحة الفيس بوك غير موجودة',
      });
    }

    // نشر المنشور على الفيس بوك
    const publishResult = await publishToFacebook(facebookPage.pageToken, post);

    if (publishResult.success) {
      // تحديث حالة المنشور
      post.status = 'published';
      post.publishedAt = new Date().toISOString();
      post.facebookPostId = publishResult.postId;

      // حفظ المنشور المحدث
      await userModel.addPostToHistory(req.user.userId, post);

      res.json({
        success: true,
        post,
        facebookPostId: publishResult.postId,
      });
    } else {
      res.status(400).json({
        success: false,
        error: publishResult.error,
      });
    }
  } catch (error) {
    console.error('Publish post error:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في نشر المنشور',
    });
  }
});

// جدولة المنشور على الفيس بوك
router.post('/schedule-post', checkSubscription('premium'), async (req, res) => {
  try {
    const { postId, pageId, scheduledTime } = req.body;
    const userModel = dbInit.getModel('User');
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود',
      });
    }

    // التحقق من صلاحيات AI إذا كان الطلب من AI
    const isAIRequest = req.headers['x-ai-request'] === 'true';
    if (isAIRequest && !(await hasAIPermissions(req.user.userId))) {
      return res.status(403).json({
        success: false,
        error: 'لا تملك صلاحيات AI مفعلة',
      });
    }

    // البحث عن المنشور
    const post = user.postsHistory?.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'المنشور غير موجود',
      });
    }

    // البحث عن صفحة الفيس بوك
    const facebookPage = user.facebook?.pages?.find(p => p.pageId === pageId);
    if (!facebookPage) {
      return res.status(404).json({
        success: false,
        error: 'صفحة الفيس بوك غير موجودة',
      });
    }

    // جدولة المنشور على الفيس بوك
    const scheduleResult = await schedulePostOnFacebook(
      facebookPage.pageToken,
      post,
      scheduledTime
    );

    if (scheduleResult.success) {
      // تحديث حالة المنشور
      post.status = 'scheduled';
      post.scheduledAt = new Date().toISOString();
      post.scheduledTime = scheduledTime;
      post.facebookPostId = scheduleResult.postId;

      // حفظ المنشور المحدث
      await userModel.addPostToHistory(req.user.userId, post);

      res.json({
        success: true,
        post,
        facebookPostId: scheduleResult.postId,
      });
    } else {
      res.status(400).json({
        success: false,
        error: scheduleResult.error,
      });
    }
  } catch (error) {
    console.error('Schedule post error:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في جدولة المنشور',
    });
  }
});

// الحصول على منشورات المستخدم
router.get('/posts', checkSubscription('premium'), async (req, res) => {
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
      posts: user.postsHistory || [],
      postsRemaining: user.postsRemaining || (user.subscription === 'free' ? 10 : -1),
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في الحصول على المنشورات',
    });
  }
});

// دالة إنشاء المحتوى بالذكاء الاصطناعي
async function generateAIContent(category, tone, customPrompt, user) {
  try {
    // محتوى افتراضي بناءً على الفئة والنبرة
    const contentTemplates = {
      motivational: {
        professional:
          'تذكر أن النجاح ليس وصولاً بل رحلة مستمرة من التعلم والنمو. استمر في السعي نحو أهدافك! 💪',
        friendly: 'يا صديقي، كل يوم جديد هو فرصة لتحقيق شيء رائع! لا تستسلم أبداً 🌟',
        casual: 'صباح الخير! اليوم سيكون يوم رائع، فقط آمن بذلك! ☀️',
      },
      business: {
        professional:
          'في عالم الأعمال المتغير، الابتكار هو المفتاح للبقاء في المقدمة. استثمر في أفكارك! 🚀',
        friendly:
          'الأعمال الناجحة مبنية على العلاقات القوية والثقة المتبادلة. ابني شبكة علاقاتك! 🤝',
        casual: 'نصيحة اليوم: استمع لعملائك أكثر من حديثك! 👂',
      },
      lifestyle: {
        professional: 'التوازن بين العمل والحياة الشخصية هو أساس السعادة الحقيقية. اعتن بنفسك! ⚖️',
        friendly: 'الحياة جميلة عندما نستمتع باللحظات الصغيرة! شاركنا لحظاتك المميزة 📸',
        casual: 'أحياناً أفضل قرار هو أخذ استراحة! 😌',
      },
    };

    let content = contentTemplates[category]?.[tone] || contentTemplates.motivational.friendly;

    // إذا كان هناك طلب مخصص، أضفه
    if (customPrompt) {
      content = `${content}\n\n${customPrompt}`;
    }

    // استخدام تفضيلات المستخدم إذا كانت متوفرة
    if (user && user.aiMemory && user.aiMemory.preferences) {
      const preferences = user.aiMemory.preferences;
      // يمكننا تخصيص المحتوى بناءً على تفضيلات المستخدم
    }

    return content;
  } catch (error) {
    console.error('AI content generation error:', error);
    return 'منشور مثير للاهتمام! شاركنا أفكارك في التعليقات 💭';
  }
}

// دالة نشر المنشور على الفيس بوك
async function publishToFacebook(pageToken, post) {
  try {
    const facebookApiUrl = 'https://graph.facebook.com/v18.0/me/feed';

    const postData = {
      message: post.content,
      access_token: pageToken,
    };

    // إذا كان هناك صورة، أضفها
    if (post.imageUrl) {
      postData.link = post.imageUrl;
    }

    const response = await axios.post(facebookApiUrl, postData);

    return {
      success: true,
      postId: response.data.id,
    };
  } catch (error) {
    console.error('Facebook publish error:', error.response?.data || error.message);
    return {
      success: false,
      error: 'خطأ في نشر المنشور على الفيس بوك',
    };
  }
}

// دالة جدولة المنشور على الفيس بوك
async function schedulePostOnFacebook(pageToken, post, scheduledTime) {
  try {
    const facebookApiUrl = 'https://graph.facebook.com/v18.0/me/feed';

    const postData = {
      message: post.content,
      access_token: pageToken,
      scheduled_publish_time: Math.floor(new Date(scheduledTime).getTime() / 1000),
      published: false,
    };

    // إذا كان هناك صورة، أضفها
    if (post.imageUrl) {
      postData.link = post.imageUrl;
    }

    const response = await axios.post(facebookApiUrl, postData);

    return {
      success: true,
      postId: response.data.id,
    };
  } catch (error) {
    console.error('Facebook schedule error:', error.response?.data || error.message);
    return {
      success: false,
      error: 'خطأ في جدولة المنشور على الفيس بوك',
    };
  }
}

module.exports = router;
