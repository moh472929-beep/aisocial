const jwt = require('jsonwebtoken');

// Get JWT secret from environment
const getJWTSecret = () => {
  return (
    process.env.JWT_SECRET || process.env.SESSION_SECRET || 'facebook-ai-manager-secret-key-2025'
  );
};

// Middleware to verify JWT token
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
    const decoded = jwt.verify(token, getJWTSecret());
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

// Generate JWT token
const generateToken = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, getJWTSecret(), { expiresIn });
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
  const weights = { user: 1, manager: 2, admin: 3 };
  return (req, res, next) => {
    const userRole = req.user?.role || 'user';
    if (weights[userRole] >= weights[requiredRole]) {
      return next();
    }
    return res.status(403).json({ success: false, error: 'Insufficient role' });
  };
};

module.exports = {
  authenticateToken,
  generateToken,
  verifyToken,
  getJWTSecret,
  authorizeRole,
};
