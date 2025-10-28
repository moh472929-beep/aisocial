import { initDB, getModel } from "../db/init.js";
import ApiError from "../utils/ApiError.js";

/**
 * Middleware to check if user has AI permissions enabled
 */
const checkAIPermissions = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      throw ApiError.unauthorized('User not authenticated', 'المستخدم غير مصادق عليه');
    }

    const userModel = getModel('User');
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      throw ApiError.notFound('User not found', 'المستخدم غير موجود');
    }

    // Check if user has premium subscription (premium users get AI permissions automatically)
    const hasPremiumSubscription = user.subscription === 'premium' || 
                                   (user.subscription && 
                                    user.subscription.type === 'premium' && 
                                    user.subscription.isActive);

    // Check if AI permissions are enabled OR user has premium subscription
    const hasAIPermissions = user.aiEnabled || 
                            (user.aiPermissions && user.aiPermissions.enabled);

    if (!hasPremiumSubscription && !hasAIPermissions) {
      return res.status(403).json({
        success: false,
        error: 'AI permissions not enabled',
        errorAr: 'صلاحيات الذكاء الاصطناعي غير مفعلة',
        message: 'Please enable AI permissions or upgrade to premium to use this feature',
        messageAr: 'يرجى تفعيل صلاحيات الذكاء الاصطناعي أو الترقية للحساب المميز لاستخدام هذه الميزة',
      });
    }

    // Attach user to request for later use
    req.userData = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check subscription level
 */
const checkSubscription = (requiredLevel = 'free') => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.userId) {
        throw ApiError.unauthorized('User not authenticated', 'المستخدم غير مصادق عليه');
      }

      const userModel = getModel('User');
      const user = await userModel.findById(req.user.userId);

      if (!user) {
        throw ApiError.notFound('User not found', 'المستخدم غير موجود');
      }

      const subscriptionLevels = {
        free: 0,
        premium: 1,
        enterprise: 2,
      };

      const userLevel = subscriptionLevels[user.subscription] || 0;
      const required = subscriptionLevels[requiredLevel] || 0;

      if (userLevel < required) {
        return res.status(403).json({
          success: false,
          error: 'Subscription upgrade required',
          errorAr: 'يتطلب ترقية الاشتراك',
          message: `This feature requires ${requiredLevel} subscription`,
          messageAr: `هذه الميزة تتطلب اشتراك ${requiredLevel}`,
          currentSubscription: user.subscription,
          requiredSubscription: requiredLevel,
        });
      }

      req.userData = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check posts remaining for free users
 */
const checkPostsRemaining = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      throw ApiError.unauthorized('User not authenticated', 'المستخدم غير مصادق عليه');
    }

    const userModel = getModel('User');
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      throw ApiError.notFound('User not found', 'المستخدم غير موجود');
    }

    // Premium users have unlimited posts
    if (user.subscription !== 'free') {
      req.userData = user;
      return next();
    }

    // Check if free user has posts remaining
    if (user.postsRemaining <= 0) {
      return res.status(403).json({
        success: false,
        error: 'No posts remaining',
        errorAr: 'لا توجد منشورات متبقية',
        message: 'You have used all your free posts. Upgrade to premium for unlimited posts.',
        messageAr:
          'لقد استخدمت جميع منشوراتك المجانية. قم بالترقية إلى الخطة المميزة ��لحصول على منشورات غير محدودة.',
        postsRemaining: 0,
        subscription: user.subscription,
      });
    }

    req.userData = user;
    next();
  } catch (error) {
    next(error);
  }
};

export {
  checkAIPermissions,
  checkSubscription,
  checkPostsRemaining,
};
