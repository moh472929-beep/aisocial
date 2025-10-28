# Premium Routes Guide

This document explains how to add new premium features, pages, and APIs to the application using the Role-Based Access Control (RBAC) system.

## Overview

The RBAC system automatically protects premium content by:
1. Verifying user authentication via JWT tokens
2. Checking user roles against required permissions
3. Blocking unauthorized access to premium resources

## Adding New Premium Routes

### 1. Update Access Rules

Edit `src/config/accessRules.js` to add your new premium route pattern:

```javascript
// Example: Adding a new premium analytics feature
module.exports = {
  public: [
    // Public routes remain unchanged
  ],
  free: [
    // Free user routes remain unchanged
  ],
  premium: [
    // Existing premium routes
    "/premium/*",
    "/api/ai/*",
    "/api/facebook/*",
    "/api/analytics/*",
    
    // Add your new premium route pattern here
    "/api/new-premium-feature/*",
    "/premium/new-premium-page"
  ]
};
```

### 2. Create Protected API Routes

For new premium API endpoints:

```javascript
// In your API route file (e.g., src/api/new-premium-feature.js)
import express from 'express';
const router = express.Router();

// Define your premium API endpoints
router.get('/data', (req, res) => {
  // Access is already protected by the RBAC middleware
  // You can access the authenticated user via req.user
  res.json({ data: 'Premium feature data' });
});

export default router;
```

Then register your API route in `src/api/index.mjs`:

```javascript
import newPremiumFeatureRoutes from './new-premium-feature.js';
// ...
router.use('/new-premium-feature', newPremiumFeatureRoutes);
```

### 3. Create Protected HTML Pages

For new premium HTML pages:

1. Create the HTML file in the `public` directory
2. Add a route handler in `src/routes/premium.js`:

```javascript
// Add your new premium page route
router.get('/new-premium-page', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/new-premium-page.html'));
});
```

## Testing Premium Routes

Always test your new premium routes with different user roles:

1. Unauthenticated users should be redirected to login
2. Free users should receive a 403 Forbidden response
3. Premium users should have full access

## Frontend Integration

Update any frontend code that needs to link to your new premium feature:

```javascript
// Check user role before showing premium feature links
const user = JSON.parse(localStorage.getItem('user'));
if (user && (user.subscription === 'premium' || user.role === 'premium')) {
  // Show premium feature links
  document.getElementById('premium-features').style.display = 'block';
}
```

## Security Best Practices

1. Never rely on frontend checks alone for security
2. Always test direct URL access to premium resources
3. Verify API endpoints are properly protected
4. Update tests when adding new premium features