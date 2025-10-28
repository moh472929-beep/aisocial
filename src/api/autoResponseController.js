import express from "express";
import axios from "axios";
import { initDB, getModel } from "../db/init.js";
import config from "../../config.js";
import { authenticateToken  } from "../middleware/auth.js";
import { checkSubscription  } from "../middleware/checkAIPermissions.js";

const router = express.Router();

// Use shared JWT authentication middleware
router.use(authenticateToken);

// Save user's auto-reply settings
router.post('/settings', checkSubscription('premium'), async (req, res) => {
  try {
    const { rules, enabled } = req.body;
    const userModel = getModel('User');

    // Update user's auto-response settings
    const updated = await userModel.update(req.user.userId, {
      autoResponseSettings: {
        rules: rules || [],
        enabled: enabled !== undefined ? enabled : true,
        updatedAt: new Date().toISOString(),
      },
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
      settings: user.autoResponseSettings,
      message: 'تم حفظ إعدادات الرد التلقائي بنجاح',
    });
  } catch (error) {
    console.error('Save auto-response settings error:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
    });
  }
});

// Fetch saved settings
router.get('/settings', checkSubscription('premium'), async (req, res) => {
  try {
    const userModel = getModel('User');
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود',
      });
    }

    res.json({
      success: true,
      settings: user.autoResponseSettings || {
        rules: [],
        enabled: false,
      },
    });
  } catch (error) {
    console.error('Get auto-response settings error:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
    });
  }
});

// Handle comments and messages using AI
router.post('/process', checkSubscription('premium'), async (req, res) => {
  try {
    const userModel = getModel('User');
    const autoResponseModel = getModel('AutoResponse');
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود',
      });
    }

    // Check if auto-response is enabled
    if (!user.autoResponseSettings || !user.autoResponseSettings.enabled) {
      return res.status(400).json({
        success: false,
        error: 'الرد التلقائي غير مفعل',
      });
    }

    // Check if user has Facebook pages connected
    if (!user.facebook || !user.facebook.pages || user.facebook.pages.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'لا توجد صفحات فيسبوك متصلة',
      });
    }

    const results = [];

    // Process each connected Facebook page
    for (const page of user.facebook.pages) {
      try {
        // Fetch comments from Facebook API
        const commentsUrl = `https://graph.facebook.com/v18.0/${page.pageId}/comments?access_token=${page.pageToken}&limit=50`;
        const commentsResponse = await axios.get(commentsUrl);

        // Process each comment
        for (const comment of commentsResponse.data.data) {
          try {
            // Skip if comment is already processed
            const existingResponse = await autoResponseModel.findByCommentId(comment.id);
            if (existingResponse) {
              continue;
            }

            // Check if comment matches any user-defined rules
            let matchedRule = null;
            for (const rule of user.autoResponseSettings.rules) {
              const keywords = rule.keywords || [];
              const commentText = comment.message.toLowerCase();

              for (const keyword of keywords) {
                if (commentText.includes(keyword.toLowerCase())) {
                  matchedRule = rule;
                  break;
                }
              }

              if (matchedRule) break;
            }

            // If a rule matches, generate AI response and reply
            if (matchedRule) {
              // Generate personalized AI response
              const aiResponse = await generateAIResponse(
                comment.message,
                matchedRule.response,
                user
              );

              // Reply to comment via Facebook Graph API
              const replyUrl = `https://graph.facebook.com/v18.0/${comment.id}/comments`;
              await axios.post(replyUrl, {
                message: aiResponse,
                access_token: page.pageToken,
              });

              // Save auto-response record
              const responseRecord = {
                user_id: req.user.userId,
                page_id: page.pageId,
                comment_id: comment.id,
                keyword_triggered: matchedRule.keywords.join(', '),
                ai_response: aiResponse,
                original_comment: comment.message,
              };

              await autoResponseModel.create(responseRecord);
              results.push(responseRecord);
            }
          } catch (commentError) {
            console.error('Error processing comment:', commentError.message);
            // Continue with next comment
          }
        }
      } catch (pageError) {
        console.error('Error fetching page comments:', pageError.message);
        // Continue with next page
      }
    }

    res.json({
      success: true,
      message: 'تم معالجة الردود التلقائية بنجاح',
      responses: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Process auto-response error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'خطأ في معالجة الردود التلقائية',
    });
  }
});

// Get recent auto replies
router.get('/recent', checkSubscription('premium'), async (req, res) => {
  try {
    const autoResponseModel = getModel('AutoResponse');
    const responses = await autoResponseModel.findByUserId(req.user.userId);

    // Limit to last 50 responses
    const recentResponses = responses.slice(0, 50);

    res.json({
      success: true,
      responses: recentResponses,
    });
  } catch (error) {
    console.error('Get recent auto-responses error:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
    });
  }
});

// Generate AI response using OpenAI
async function generateAIResponse(comment, templateResponse, user) {
  try {
    const openaiApiKey = config.ai.openaiApiKey;

    if (!openaiApiKey) {
      // If no API key, return template response
      return templateResponse;
    }

    // Customize response based on user preferences
    const userPreferences = user.aiMemory?.preferences || {};

    const prompt = `
            أنت مساعد ذكي لصفحة فيسبوك. 
            لقد تلقيت التعليق التالي: "${comment}"
            يجب أن ترد برسالة تشبه: "${templateResponse}"
            لكن قم بتخصيصها لتكون شخصية ومناسبة للتعليق.
            استخدم النبرة التالية: ${userPreferences.tone || 'ودية ومفيدة'}
            استخدم اللغة التالية: ${userPreferences.language || 'العربية'}
            
            رد برسالة قصيرة ومباشرة:
        `;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'أنت مساعد ذكي لصفحة فيسبوك. قدم ردودًا مفيدة ومختصرة.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 150,
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
    console.error('AI response generation error:', error.message);
    // Return template response if AI fails
    return templateResponse;
  }
}

export default router;
