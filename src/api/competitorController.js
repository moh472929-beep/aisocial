const express = require('express');
const axios = require('axios');
const dbInit = require('../db/init');
const config = require('../../config');
const { authenticateToken } = require('../middleware/auth');
const { checkSubscription } = require('../middleware/checkAIPermissions');

const router = express.Router();

// Use shared JWT authentication middleware
router.use(authenticateToken);

// Analyze competitor page
router.post('/analyze', checkSubscription('premium'), async (req, res) => {
  try {
    const { competitorPageId } = req.body;
    const userModel = dbInit.getModel('User');
    const competitorAnalyticsModel = dbInit.getModel('CompetitorAnalytics');

    if (!competitorPageId) {
      return res.status(400).json({
        success: false,
        error: 'معرف صفحة المنافس مطلوب',
      });
    }

    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود',
      });
    }

    // Check if user has Facebook pages connected
    if (!user.facebook || !user.facebook.pages || user.facebook.pages.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'لا توجد صفحات فيسبوك متصلة',
      });
    }

    // Use the first connected page's token for analysis
    const pageToken = user.facebook.pages[0].pageToken;

    // Fetch last 20 posts from competitor page
    const postsUrl = `https://graph.facebook.com/v18.0/${competitorPageId}/posts?access_token=${pageToken}&limit=20`;
    const postsResponse = await axios.get(postsUrl);

    const posts = [];

    // Process each post
    for (const post of postsResponse.data.data) {
      try {
        // Get detailed metrics for each post
        const postDetailsUrl = `https://graph.facebook.com/v18.0/${post.id}?access_token=${pageToken}&fields=id,message,created_time,likes.summary(true),shares,comments.summary(true),views`;
        const postDetailsResponse = await axios.get(postDetailsUrl);

        posts.push({
          id: postDetailsResponse.data.id,
          message: postDetailsResponse.data.message || '',
          created_time: postDetailsResponse.data.created_time,
          likes: postDetailsResponse.data.likes?.summary?.total_count || 0,
          shares: postDetailsResponse.data.shares?.count || 0,
          comments: postDetailsResponse.data.comments?.summary?.total_count || 0,
          views: postDetailsResponse.data.views?.count || 0,
        });
      } catch (postError) {
        console.error('Error fetching post details:', postError.message);
        // Continue with next post
      }
    }

    // Calculate engagement rate
    const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
    const totalShares = posts.reduce((sum, post) => sum + post.shares, 0);
    const totalComments = posts.reduce((sum, post) => sum + post.comments, 0);
    const totalEngagement = totalLikes + totalShares + totalComments;

    // Get page followers count (approximate)
    let followersCount = 0;
    try {
      const pageUrl = `https://graph.facebook.com/v18.0/${competitorPageId}?access_token=${pageToken}&fields=fan_count`;
      const pageResponse = await axios.get(pageUrl);
      followersCount = pageResponse.data.fan_count || 0;
    } catch (pageError) {
      console.error('Error fetching page followers:', pageError.message);
    }

    const engagementRate = followersCount > 0 ? (totalEngagement / followersCount) * 100 : 0;

    // Get top performing posts
    const topPosts = [...posts]
      .sort((a, b) => {
        const engagementA = a.likes + a.shares + a.comments;
        const engagementB = b.likes + b.shares + b.comments;
        return engagementB - engagementA;
      })
      .slice(0, 5);

    // Calculate average posting time
    const postingHours = posts.map(post => new Date(post.created_time).getHours());
    const averagePostingHour =
      postingHours.length > 0
        ? postingHours.reduce((sum, hour) => sum + hour, 0) / postingHours.length
        : 0;

    // Extract keywords/hashtags (simplified implementation)
    const allText = posts.map(post => post.message).join(' ');
    const hashtags = allText.match(/#\w+/g) || [];
    const keywordCounts = {};

    hashtags.forEach(tag => {
      keywordCounts[tag] = (keywordCounts[tag] || 0) + 1;
    });

    const topKeywords = Object.entries(keywordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([keyword]) => keyword);

    // Prepare analytics data
    const analyticsData = {
      user_id: req.user.userId,
      competitor_page_id: competitorPageId,
      summary: '',
      top_posts: topPosts,
      keywords: topKeywords,
      engagement_stats: {
        total_likes: totalLikes,
        total_shares: totalShares,
        total_comments: totalComments,
        total_engagement: totalEngagement,
        engagement_rate: parseFloat(engagementRate.toFixed(2)),
        average_posting_hour: parseFloat(averagePostingHour.toFixed(2)),
        followers_count: followersCount,
      },
    };

    // Generate AI summary
    try {
      analyticsData.summary = await generateAISummary(analyticsData, user);
    } catch (aiError) {
      console.error('AI summary generation error:', aiError.message);
      analyticsData.summary = 'تحليل تلقائي للمنافس بناءً على المنشورات والتفاعل';
    }

    // Save analytics results
    await competitorAnalyticsModel.updateByUserIdAndCompetitorPageId(
      req.user.userId,
      competitorPageId,
      analyticsData
    );

    res.json({
      success: true,
      message: 'تم تحليل صفحة المنافس بنجاح',
      analytics: analyticsData,
    });
  } catch (error) {
    console.error('Competitor analysis error:', error.response?.data || error.message);

    if (error.response?.status === 400) {
      return res.status(400).json({
        success: false,
        error: 'معرف صفحة غير صحيح',
      });
    }

    res.status(500).json({
      success: false,
      error: 'خطأ في تحليل صفحة المنافس',
    });
  }
});

// Fetch stored analysis results
router.get('/results', checkSubscription('premium'), async (req, res) => {
  try {
    const competitorAnalyticsModel = dbInit.getModel('CompetitorAnalytics');
    const analytics = await competitorAnalyticsModel.findByUserId(req.user.userId);

    res.json({
      success: true,
      analytics: analytics,
    });
  } catch (error) {
    console.error('Get competitor analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
    });
  }
});

// Generate AI summary using OpenAI
async function generateAISummary(analyticsData, user) {
  try {
    const openaiApiKey = config.ai.openaiApiKey;

    if (!openaiApiKey) {
      return 'تحليل تلقائي للمنافس بناءً على المنشورات والتفاعل';
    }

    const prompt = `
            قم بتحليل صفحة منافس على فيسبوك بناءً على البيانات التالية:
            
            معدل التفاعل: ${analyticsData.engagement_stats.engagement_rate}%
            إجمالي الإعجابات: ${analyticsData.engagement_stats.total_likes}
            إجمالي المشاركات: ${analyticsData.engagement_stats.total_shares}
            إجمالي التعليقات: ${analyticsData.engagement_stats.total_comments}
            
            أفضل المنشورات:
            ${analyticsData.top_posts
              .slice(0, 3)
              .map(
                post =>
                  `- ${post.message?.substring(0, 100)}... (${post.likes} إعجاب، ${post.shares} مشاركة، ${post.comments} تعليق)`
              )
              .join('\n')}
            
            الكلمات المفتاحية الأكثر استخداماً:
            ${analyticsData.keywords.slice(0, 5).join(', ')}
            
            قدم ملخصاً قصيراً يشرح:
            1. ما هي استراتيجية المحتوى التي يستخدمها هذا المنافس؟
            2. ما نوع المنشورات التي تحصل على أفضل تفاعل؟
            3. ما هي أوقات النشر المثلى بناءً على البيانات؟
            4. اقتراحات لتحسين أداء صفحتنا مقارنة بهذا المنافس.
            
            اكتب الإجابة بالعربية:
        `;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'أنت خبير في تحليل وسائل التواصل الاجتماعي والتسويق الرقمي. قدم تحليلاً مفصلاً ومفيداً.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('AI summary generation error:', error.message);
    return 'تحليل تلقائي للمنافس بناءً على المنشورات والتفاعل';
  }
}

module.exports = router;
