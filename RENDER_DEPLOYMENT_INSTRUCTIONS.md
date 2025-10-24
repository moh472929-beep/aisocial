# Render Deployment Instructions

## Prerequisites
Before deploying to Render, ensure you have:
1. A MongoDB Atlas database set up
2. Facebook App credentials (App ID and App Secret)
3. OpenAI API key
4. Strong JWT and Session secrets

## Environment Variables Configuration

When deploying to Render, you need to set the following environment variables in your Render dashboard:

### Required Environment Variables

```
NODE_ENV=production
PORT=10000
BASE_URL=https://your-app-name.onrender.com
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret_min_32_chars
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FB_APP_ID=your_facebook_app_id
FB_APP_SECRET=your_facebook_app_secret
OPENAI_API_KEY=your_openai_api_key
SESSION_SECRET=your_secure_session_secret_min_32_chars
ENCRYPTION_KEY=your_32_char_encryption_key
PRODUCTION_DOMAIN=your-app-name.onrender.com
SECURE_COOKIES=true
TRUST_PROXY=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ALLOWED_ORIGINS=https://your-app-name.onrender.com
```

### Important Notes

1. **Replace `your-app-name` with your actual Render app name**
2. **Generate strong secrets** (minimum 32 characters) for JWT_SECRET and SESSION_SECRET
3. **Use your actual MongoDB Atlas connection string** for MONGODB_URI
4. **Use your actual Facebook app credentials**
5. **Use your actual OpenAI API key**

## Deployment Steps

1. **Connect your GitHub repository** to Render
2. **Set the build command**: `npm install`
3. **Set the start command**: `npm start`
4. **Configure all environment variables** listed above
5. **Deploy the application**

## Post-Deployment Configuration

### Facebook App Settings
Update your Facebook App settings to include your Render domain:
- **App Domains**: `your-app-name.onrender.com`
- **Valid OAuth Redirect URIs**: `https://your-app-name.onrender.com/auth/facebook/callback`

### Testing the Deployment
1. Visit your deployed application at `https://your-app-name.onrender.com`
2. Test user registration and login
3. Test premium user redirection functionality
4. Verify all API endpoints are working correctly

## Configuration Files Already Updated

The following files have been updated to work with Render deployment:

### Frontend Configuration
- `public/js/config.js` - Handles environment detection and API endpoints
- All dashboard files now use `CONFIG.getApiEndpoint()` for proper API routing

### Backend Configuration
- `config.js` - Handles Render environment variables and CORS settings
- `server.mjs` - Enhanced CORS configuration for Render deployment
- `.env.production` - Template for production environment variables

## Security Considerations

1. **Never commit sensitive environment variables** to your repository
2. **Use strong, unique secrets** for JWT and session management
3. **Enable HTTPS only** in production (automatically handled by Render)
4. **Configure proper CORS origins** to prevent unauthorized access

## Troubleshooting

### Common Issues
1. **CORS errors**: Ensure `ALLOWED_ORIGINS` includes your Render domain
2. **Database connection issues**: Verify MongoDB Atlas connection string and IP whitelist
3. **Facebook login issues**: Check Facebook app configuration and redirect URIs
4. **API endpoint errors**: Verify all environment variables are set correctly

### Logs and Debugging
- Check Render logs for server errors
- Use browser developer tools to check for frontend errors
- Verify environment variables are set correctly in Render dashboard