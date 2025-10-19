# API Routing Documentation

## Overview

This document explains how API routing works across different deployment environments (Render, Netlify) and local development for the Facebook AI Manager application.

## Architecture

### Backend (Render)
- **Base URL**: `https://<your-app>.onrender.com`
- **API Endpoints**: All API routes are served under `/api/*`
- **Static Files**: Also serves static files from `/public` directory
- **Port**: Configurable via `PORT` environment variable (default: 3000)

### Frontend (Netlify)
- **Base URL**: `https://<your-site>.netlify.app`
- **Static Assets**: HTML, CSS, JS files served directly
- **API Calls**: Must point to Render backend for API functionality

## API Endpoints

### Available Routes
The API provides the following main route groups:

- `/api/auth` - Authentication (register, login, logout)
- `/api/users` - User management
- `/api/facebook` - Facebook integration
- `/api/ai` - AI functionality
- `/api/analytics` - Analytics data
- `/api/autoresponse` - Auto-response management

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Email verification

## Environment Configuration

### Local Development
```bash
# Server runs on localhost
PORT=3000
API_BASE_URL=http://localhost:3000/api
```

### Production (Netlify + Render)
```bash
# Frontend environment
API_BASE_URL=https://your-app.onrender.com/api

# Backend environment (Render)
PORT=10000  # or any port Render assigns
CORS_ORIGIN=https://your-site.netlify.app
```

## CORS Configuration

The backend must be configured to allow requests from the Netlify frontend:

```javascript
// In server configuration
app.use(cors({
  origin: [
    'https://your-site.netlify.app',
    'http://localhost:3000'  // for local development
  ],
  credentials: true
}));
```

## Frontend API Integration

### Dynamic Base URL Resolution
The frontend should determine the API base URL based on the environment:

```javascript
// Recommended approach
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app.onrender.com/api'
  : '/api';  // relative for local development

// Alternative: Use environment variable
const API_BASE_URL = process.env.API_BASE_URL || '/api';
```

### Example API Call
```javascript
// Registration example
const response = await fetch(`${API_BASE_URL}/auth/register`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fullName: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    password: 'SecurePass123!'
  })
});
```

## Password Requirements

The API enforces the following password validation rules:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## Rate Limiting

Authentication endpoints have rate limiting applied:
- Registration: 5 attempts per 15 minutes per IP
- Login: 10 attempts per 15 minutes per IP

## Error Handling

### Common Error Responses

#### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "type": "field",
      "msg": "Password must include at least one uppercase letter",
      "path": "password",
      "location": "body"
    }
  ]
}
```

#### 429 Too Many Requests
```json
{
  "success": false,
  "error": "Too many requests, please try again later"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Testing

### Local Testing
1. Start the server: `node index.js`
2. Run diagnostics: `node debug-registration.js`
3. Test endpoints manually:
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"fullName":"Test User","username":"testuser","email":"test@example.com","password":"Password123!"}'
   ```

### Production Testing
1. Verify CORS headers are set correctly
2. Test API endpoints from the Netlify frontend
3. Monitor rate limiting behavior
4. Check error handling and logging

## Deployment Checklist

### Render Backend
- [ ] Set `PORT` environment variable
- [ ] Configure `CORS_ORIGIN` for Netlify domain
- [ ] Set up MongoDB connection string
- [ ] Configure JWT secrets
- [ ] Enable logging and monitoring

### Netlify Frontend
- [ ] Set `API_BASE_URL` environment variable
- [ ] Configure build settings
- [ ] Test API connectivity
- [ ] Verify CORS functionality
- [ ] Test authentication flow

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured for Netlify domain
   - Check that credentials are handled correctly

2. **404 on API Routes**
   - Verify API routes are properly mounted
   - Check that the backend is running and accessible

3. **Authentication Failures**
   - Verify JWT secrets are consistent
   - Check token expiration settings
   - Ensure secure cookie settings for production

4. **Rate Limiting Issues**
   - Monitor rate limit headers in responses
   - Implement proper retry logic in frontend
   - Consider IP whitelisting for development

## Security Considerations

- Always use HTTPS in production
- Implement proper CORS policies
- Use secure JWT configurations
- Enable rate limiting on sensitive endpoints
- Validate all input data
- Implement proper error handling without exposing sensitive information