const dbInit = require('../db/init');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to check if user has AI permissions enabled
 */
const checkAIPermissions = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      throw ApiError.unauthorized('User not authenticated', 'المستخدم غير مصادق عليه');
    }

    const userModel = dbInit.getModel('User');
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      throw ApiError.notFound('User not found', 'المستخدم غير موجود');
    }

    // Check if AI permissions are enabled
    if (!user.aiPermissions || !user.aiPermissions.enabled) {
      return res.status(403).json({
        success: false,
        error: 'AI permissions not enabled',
        errorAr: 'صلاحيات الذكاء الاصطناعي غير مفعلة',
        message: 'Please enable AI permissions to use this feature',
        messageAr: 'يرجى تفعيل صلاحيات الذكاء الاصطناعي لاستخدام هذه الميزة',
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

      const userModel = dbInit.getModel('User');
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

    const userModel = dbInit.getModel('User');
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

module.exports = {
  checkAIPermissions,
  checkSubscription,
  checkPostsRemaining,
};
