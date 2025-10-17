const express = require('express');
const axios = require('axios');
const dbInit = require('../db/init');
const config = require('../../config');
const { authenticateToken } = require('../middleware/auth');
const { checkSubscription } = require('../middleware/checkAIPermissions');

const router = express.Router();

// Use shared JWT authentication middleware
router.use(authenticateToken);

// Fetch post data from Facebook API for each connected page
router.post('/fetch', checkSubscription('premium'), async (req, res) => {
  try {
    const { period = 'daily' } = req.body;
    const userModel = dbInit.getModel('User');
    const postModel = dbInit.getModel('Post');
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود',
      });
    }

    if (!user.facebook || !user.facebook.pages || user.facebook.pages.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'لا توجد صفحات فيسبوك متصلة',
      });
    }

    const results = [];

    // Fetch data for each page connected by the user
    for (const page of user.facebook.pages) {
      try {
        // Get posts from Facebook API
        const postsUrl = `https://graph.facebook.com/v18.0/${page.pageId}/posts?access_token=${page.pageToken}&limit=50`;
        const postsResponse = await axios.get(postsUrl);

        // Process each post
        for (const post of postsResponse.data.data) {
          try {
            // Get detailed metrics for each post
            const postDetailsUrl = `https://graph.facebook.com/v18.0/${post.id}?access_token=${page.pageToken}&fields=id,message,created_time,likes.summary(true),shares,comments.summary(true),views`;
            const postDetailsResponse = await axios.get(postDetailsUrl);

            const postData = {
              postId: postDetailsResponse.data.id,
              pageId: page.pageId,
              userId: req.user.userId,
              content: postDetailsResponse.data.message || '',
              type: postDetailsResponse.data.message ? 'text' : 'media',
              createdAt: new Date(postDetailsResponse.data.created_time),
              likes: postDetailsResponse.data.likes?.summary?.total_count || 0,
              shares: postDetailsResponse.data.shares?.count || 0,
              comments: postDetailsResponse.data.comments?.summary?.total_count || 0,
              views: postDetailsResponse.data.views?.count || 0,
            };

            // Save post data to database
            await postModel.create(postData);
            results.push(postData);
          } catch (postError) {
            console.error('Error fetching post details:', postError.message);
            // Continue with next post
          }
        }
      } catch (pageError) {
        console.error('Error fetching page posts:', pageError.message);
        // Continue with next page
      }
    }

    res.json({
      success: true,
      message: 'تم جلب البيانات بنجاح',
      posts: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Fetch analytics error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'خطأ في جلب البيانات التحليلية',
    });
  }
});

// Calculate analytics metrics
router.post('/process', checkSubscription('premium'), async (req, res) => {
  try {
    const { period = 'daily' } = req.body;
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

    if (!user.facebook || !user.facebook.pages || user.facebook.pages.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'لا توجد صفحات فيسبوك متصلة',
      });
    }

    const results = [];

    // Calculate metrics for each page
    for (const page of user.facebook.pages) {
      try {
        // Get all posts for this page
        const posts = await postModel.findByPageId(page.pageId);

        if (posts.length === 0) {
          continue;
        }

        // Calculate total metrics
        let totalLikes = 0;
        let totalShares = 0;
        let totalComments = 0;
        let totalViews = 0;
        let totalFollowers = 0;

        posts.forEach(post => {
          totalLikes += post.likes || 0;
          totalShares += post.shares || 0;
          totalComments += post.comments || 0;
          totalViews += post.views || 0;
        });

        // Get page followers count
        try {
          const pageUrl = `https://graph.facebook.com/v18.0/${page.pageId}?access_token=${page.pageToken}&fields=fan_count`;
          const pageResponse = await axios.get(pageUrl);
          totalFollowers = pageResponse.data.fan_count || 0;
        } catch (pageError) {
          console.error('Error fetching page followers:', pageError.message);
        }

        // Calculate engagement rate
        const engagementRate =
          totalFollowers > 0
            ? ((totalLikes + totalShares + totalComments) / totalFollowers) * 100
            : 0;

        // Get top performing posts
        const topPosts = await postModel.getTopPostsByEngagement(req.user.userId, 5);

        // Calculate best posting times (simplified implementation)
        const bestPostTimes = calculateBestPostingTimes(posts);

        // Calculate follower growth (simplified implementation)
        const followerGrowth = calculateFollowerGrowth(posts, totalFollowers);

        // Prepare analytics data
        const analyticsData = {
          userId: req.user.userId,
          pageId: page.pageId,
          period,
          totalPosts: posts.length,
          totalLikes,
          totalShares,
          totalComments,
          totalViews,
          totalFollowers,
          engagementRate: parseFloat(engagementRate.toFixed(2)),
          followerGrowth: parseFloat(followerGrowth.toFixed(2)),
          topPosts,
          bestPostTimes,
          createdAt: new Date().toISOString(),
        };

        // Save analytics results
        await analyticsModel.updateByUserIdAndPageId(req.user.userId, page.pageId, analyticsData);

        results.push(analyticsData);
      } catch (pageError) {
        console.error('Error processing page analytics:', pageError.message);
        // Continue with next page
      }
    }

    // Update AI memory with analytics insights
    if (results.length > 0) {
      const insights = results.map(result => ({
        pageId: result.pageId,
        engagementRate: result.engagementRate,
        topPostTypes: result.topPosts.map(post => post.type),
        bestPostingTimes: result.bestPostTimes,
      }));

      await userModel.update(req.user.userId, {
        'aiMemory.analyticsInsights': insights,
      });
    }

    res.json({
      success: true,
      message: 'تم حساب المقاييس التحليلية بنجاح',
      analytics: results,
    });
  } catch (error) {
    console.error('Process analytics error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'خطأ في حساب المقاييس التحليلية',
    });
  }
});

// Return analytics data to frontend
router.get('/dashboard', checkSubscription('premium'), async (req, res) => {
  try {
    const { period = 'daily' } = req.query;
    const userModel = dbInit.getModel('User');
    const analyticsModel = dbInit.getModel('Analytics');
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود',
      });
    }

    if (!user.facebook || !user.facebook.pages || user.facebook.pages.length === 0) {
      return res.json({
        success: true,
        analytics: [],
      });
    }

    const analyticsData = [];

    // Get analytics data for each page
    for (const page of user.facebook.pages) {
      try {
        const pageAnalytics = await analyticsModel.findByUserIdAndPageId(
          req.user.userId,
          page.pageId
        );

        if (pageAnalytics) {
          analyticsData.push(pageAnalytics);
        }
      } catch (error) {
        console.error('Error fetching page analytics:', error.message);
        // Continue with next page
      }
    }

    res.json({
      success: true,
      analytics: analyticsData,
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'خطأ في جلب البيانات التحليلية',
    });
  }
});

// Helper function to calculate best posting times
function calculateBestPostingTimes(posts) {
  const timeSlots = {};

  posts.forEach(post => {
    const hour = new Date(post.createdAt).getHours();
    const engagement = (post.likes || 0) + (post.shares || 0) + (post.comments || 0);

    if (!timeSlots[hour]) {
      timeSlots[hour] = { count: 0, totalEngagement: 0 };
    }

    timeSlots[hour].count++;
    timeSlots[hour].totalEngagement += engagement;
  });

  // Calculate average engagement per time slot
  const bestTimes = Object.keys(timeSlots)
    .map(hour => ({
      hour: parseInt(hour),
      averageEngagement: timeSlots[hour].totalEngagement / timeSlots[hour].count,
    }))
    .sort((a, b) => b.averageEngagement - a.averageEngagement)
    .slice(0, 5); // Top 5 best times

  return bestTimes;
}

// Helper function to calculate follower growth
function calculateFollowerGrowth(posts, currentFollowers) {
  if (posts.length < 2) {
    return 0;
  }

  // Simplified calculation - in a real implementation, you would track follower count over time
  // For now, we'll estimate based on post engagement growth
  const firstPost = posts[posts.length - 1]; // Oldest post
  const lastPost = posts[0]; // Newest post

  const firstEngagement =
    (firstPost.likes || 0) + (firstPost.shares || 0) + (firstPost.comments || 0);
  const lastEngagement = (lastPost.likes || 0) + (lastPost.shares || 0) + (lastPost.comments || 0);

  if (firstEngagement === 0) {
    return 0;
  }

  return ((lastEngagement - firstEngagement) / firstEngagement) * 100;
}

module.exports = router;
