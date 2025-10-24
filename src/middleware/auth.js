const jwt = require('jsonwebtoken');

// Get JWT secret from environment
const getJWTSecret = () => {
  return (
    process.env.JWT_SECRET || process.env.SESSION_SECRET || 'facebook-ai-manager-secret-key-2025'
  );
};

// Middleware to verify JWT token with enhanced security
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'رمز التفويض مطلوب',
      errorEn: 'Authorization token required',
    });
  }

  try {
    const decoded = jwt.verify(token, getJWTSecret(), {
      algorithms: ['HS256'],
      audience: process.env.JWT_AUDIENCE || 'facebook-ai-manager',
      issuer: process.env.JWT_ISSUER || 'facebook-ai-manager-auth'
    });
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'انتهت صلاحية رمز التفويض',
        errorEn: 'Token expired',
      });
    }

    return res.status(401).json({
      success: false,
      error: 'رمز التفويض غير صحيح',
      errorEn: 'Invalid authorization token',
    });
  }
};

// Generate JWT token with enhanced security
const generateToken = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, getJWTSecret(), { 
    expiresIn,
    algorithm: 'HS256',
    jwtid: require('crypto').randomBytes(16).toString('hex'),
    audience: process.env.JWT_AUDIENCE || 'facebook-ai-manager',
    issuer: process.env.JWT_ISSUER || 'facebook-ai-manager-auth'
  });
};

// Verify JWT token
const verifyToken = token => {
  try {
    return jwt.verify(token, getJWTSecret());
  } catch (error) {
    throw error;
  }
};

// Role-based authorization middleware
const authorizeRole = requiredRole => {
  const weights = { user: 1, premium: 2, manager: 3, admin: 4 };
  return (req, res, next) => {
    const userRole = req.user?.role || 'user';
    if (weights[userRole] >= weights[requiredRole]) {
      return next();
    }
    return res.status(403).json({ 
      success: false, 
      error: 'Insufficient role',
      errorAr: 'صلاحيات غير كافية',
      currentRole: userRole,
      requiredRole: requiredRole
    });
  };
};

module.exports = {
  authenticateToken,
  generateToken,
  verifyToken,
  getJWTSecret,
  authorizeRole,
};
