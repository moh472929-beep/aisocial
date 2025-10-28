import jwt from "jsonwebtoken";
import { getJWTSecret  } from "./auth.js";
import { matchPath  } from "../utils/helpers.js";
import accessRules from "../config/accessRules.js";

/**
 * Unified middleware for authentication and role-based access control
 * Verifies JWT token, extracts user role, and checks against required permissions
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.requireAuth - Whether authentication is required (default: true)
 * @param {string[]} options.requiredRoles - Roles that are allowed to access the resource
 * @returns {Function} Express middleware function
 */
const verifyAuthAndRole = (options = {}) => {
  const { requireAuth = true } = options;

  return (req, res, next) => {
    // Skip auth check if not required (for public routes)
    if (!requireAuth) {
      return next();
    }

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'رمز التفويض مطلوب',
        errorEn: 'Authorization token required',
        redirect: '/login.html'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, getJWTSecret(), {
        algorithms: ['HS256'],
        audience: process.env.JWT_AUDIENCE || 'facebook-ai-manager',
        issuer: process.env.JWT_ISSUER || 'facebook-ai-manager-auth'
      });
      
      // Set user info in request object
      req.user = decoded;
      
      // Check if the user has access to the requested resource
      const userRole = decoded.role || 'user';
      const userSubscription = decoded.subscription || 'free';
      
      // Determine effective role (use subscription if it's premium)
      const effectiveRole = userSubscription === 'premium' ? 'premium' : userRole;
      
      // Check if the path is protected and requires specific roles
      const requestPath = req.path;
      const hasAccess = checkPathAccess(requestPath, effectiveRole);
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'ليس لديك صلاحية للوصول إلى هذا المورد',
          errorEn: 'You do not have permission to access this resource',
          redirect: '/dashboard.html',
          currentRole: effectiveRole,
          requiredRole: 'premium'
        });
      }
      
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'انتهت صلاحية رمز التفويض',
          errorEn: 'Token expired',
          redirect: '/login.html'
        });
      }

      return res.status(401).json({
        success: false,
        error: 'رمز التفويض غير صحيح',
        errorEn: 'Invalid authorization token',
        redirect: '/login.html'
      });
    }
  };
};

/**
 * Check if a user with the given role has access to the requested path
 * 
 * @param {string} path - The requested path
 * @param {string} role - The user's role
 * @returns {boolean} Whether the user has access
 */
function checkPathAccess(path, role) {
  // Public routes are accessible to everyone
  if (accessRules.public.some(pattern => matchPath(path, pattern))) {
    return true;
  }
  
  // Free routes are accessible to all authenticated users
  if (accessRules.free.some(pattern => matchPath(path, pattern))) {
    return true;
  }
  
  // Premium routes are only accessible to premium users
  if (accessRules.premium.some(pattern => matchPath(path, pattern))) {
    return role === 'premium' || role === 'admin';
  }
  
  // Admin routes are only accessible to admins
  if (accessRules.admin.some(pattern => matchPath(path, pattern))) {
    return role === 'admin';
  }
  
  // If the path doesn't match any rule, allow access by default
  // This can be changed to deny by default if needed
  return true;
}

module.exports = {
  verifyAuthAndRole
};