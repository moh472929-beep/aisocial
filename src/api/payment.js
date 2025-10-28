import express from "express";
import jwt from "jsonwebtoken";
import { initDB, getModel } from "../db/init.js";
import { authenticateToken, generateToken } from "../middleware/auth.js";

const router = express.Router();

// Process payment and upgrade subscription
router.post('/process', authenticateToken, async (req, res) => {
  try {
    const { 
      cardNumber, 
      expiryDate, 
      cvv, 
      cardholderName, 
      amount = 29.99,
      currency = 'USD',
      plan = 'premium' 
    } = req.body;

    // Validate required fields
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      return res.status(400).json({
        success: false,
        error: 'جميع بيانات الدفع مطلوبة',
        errorEn: 'All payment fields are required'
      });
    }

    const userModel = getModel('User');
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود',
        errorEn: 'User not found'
      });
    }

    // Simulate payment processing (in real app, integrate with payment gateway)
    console.log(`Processing payment for user ${user.email} - Plan: ${plan}`);
    
    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update user subscription to premium
    const updateData = {
      subscription: 'premium',
      role: 'user', // Keep role as user, only subscription changes
      aiEnabled: true,
      postsRemaining: -1, // Unlimited posts for premium
      subscriptionStartDate: new Date().toISOString(),
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      paymentMethod: 'card',
      lastPaymentDate: new Date().toISOString()
    };

    const updated = await userModel.update(req.user.userId, updateData);

    if (!updated) {
      return res.status(500).json({
        success: false,
        error: 'فشل في تحديث الاشتراك',
        errorEn: 'Failed to update subscription'
      });
    }

    // Get updated user data
    const updatedUser = await userModel.findById(req.user.userId);
    const { passwordHash: _, ...userWithoutPassword } = updatedUser;

    // Generate new token with updated subscription
    const newToken = generateToken(
      { 
        userId: updatedUser.id, 
        email: updatedUser.email, 
        role: updatedUser.role,
        subscription: updatedUser.subscription 
      },
      '24h'
    );

    console.log(`Successfully upgraded user ${user.email} to premium subscription`);

    res.json({
      success: true,
      message: 'تم الدفع بنجاح وترقية حسابك إلى المميز!',
      data: {
        user: userWithoutPassword,
        token: newToken,
        subscription: {
          type: 'premium',
          startDate: updateData.subscriptionStartDate,
          endDate: updateData.subscriptionEndDate,
          features: [
            'منشورات غير محدودة',
            'جميع أدوات الذكاء الاصطناعي',
            'إدارة صفحات متعددة',
            'تحليلات متقدمة',
            'دعم أولوية',
            'قوالب مخصصة',
            'جدولة متقدمة',
            'إنشاء صور بالذكاء الاصطناعي'
          ]
        }
      }
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في معالجة الدفع. يرجى المحاولة مرة أخرى.',
      errorEn: 'Payment processing failed'
    });
  }
});

// Get subscription status
router.get('/subscription', authenticateToken, async (req, res) => {
  try {
    const userModel = getModel('User');
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود',
        errorEn: 'User not found'
      });
    }

    const subscriptionInfo = {
      type: user.subscription || 'free',
      isActive: user.subscription === 'premium',
      startDate: user.subscriptionStartDate,
      endDate: user.subscriptionEndDate,
      postsRemaining: user.postsRemaining || (user.subscription === 'free' ? 10 : -1),
      aiEnabled: user.aiEnabled || false,
      features: user.subscription === 'premium' ? [
        'منشورات غير محدودة',
        'جميع أدوات الذكاء الاصطناعي',
        'إدارة صفحات متعددة',
        'تحليلات متقدمة',
        'دعم أولوية',
        'قوالب مخصصة',
        'جدولة متقدمة',
        'إنشاء صور بالذكاء الاصطناعي'
      ] : [
        'منشورات محدودة (10 شهرياً)',
        'أدوات أساسية للذكاء الاصطناعي',
        'إدارة صفحة واحدة'
      ]
    };

    res.json({
      success: true,
      data: subscriptionInfo
    });

  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في جلب معلومات الاشتراك',
      errorEn: 'Server error'
    });
  }
});

export default router;