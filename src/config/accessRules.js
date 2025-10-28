/**
 * Role-based access control configuration
 * 
 * This file defines which roles can access which resources.
 * The rules are organized by role, with each role having an array of path patterns.
 * 
 * Path patterns can use wildcards:
 * - '*' matches any sequence of characters within a path segment
 * - '**' matches any sequence of characters across path segments
 * 
 * When adding new premium features, simply add the path pattern to the appropriate role.
 */

const accessRules = {
  // Public routes - accessible without authentication
  public: [
    '/login.html',
    '/register.html',
    '/index.html',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/health',
    '/css/*',
    '/js/*',
    '/images/*',
    '/flags/*'
  ],
  
  // Free routes - accessible to all authenticated users
  free: [
    '/dashboard.html',
    '/api/auth/profile',
    '/api/users/profile',
    '/api/facebook/posts',
    '/api/payment/process'
  ],
  
  // Premium routes - accessible only to premium users
  premium: [
    '/ai-dashboard.html',
    '/analytics-dashboard.html',
    '/autoresponse-dashboard.html',
    '/trending-topics.html',
    '/api/ai/**',
    '/api/analytics/**',
    '/api/autoresponse/**',
    '/api/facebook/insights/**',
    '/api/facebook/schedule/**'
  ],
  
  // Admin routes - accessible only to admins
  admin: [
    '/admin/**',
    '/api/admin/**'
  ]
};

module.exports = accessRules;