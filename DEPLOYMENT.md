# Deployment Guide - Facebook AI Manager

This guide provides detailed instructions for deploying the Facebook AI Manager application to various platforms.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Netlify Deployment](#netlify-deployment)
- [Vercel Deployment](#vercel-deployment)
- [Heroku Deployment](#heroku-deployment)
- [Docker Deployment](#docker-deployment)
- [Manual Server Deployment](#manual-server-deployment)
- [Facebook App Configuration](#facebook-app-configuration)
- [MongoDB Configuration](#mongodb-configuration)
- [SSL Configuration](#ssl-configuration)
- [Monitoring and Logging](#monitoring-and-logging)

## Prerequisites

Before deploying, ensure you have:

1. Node.js 18+ installed
2. A MongoDB database (local or cloud)
3. Facebook Developer account with an app created
4. Domain name (optional but recommended)
5. SSL certificate (required for production)

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database
MONGODB_URI=your_mongodb_connection_string

# Security
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Facebook API
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Optional Features
FACEBOOK_REDIRECT_URI=https://yourdomain.com/auth/facebook/callback
```

## Netlify Deployment

### Automatic Deployment (GitHub)

1. Push your code to a GitHub repository
2. Log in to your Netlify account
3. Click "New site from Git"
4. Select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `public`
6. Add environment variables in Netlify dashboard:
   - Settings → Build & deploy → Environment
7. Deploy site

### Manual Deployment

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Deploy:
   ```bash
   netlify deploy --prod
   ```

## Vercel Deployment

1. Push your code to a GitHub repository
2. Log in to your Vercel account
3. Create a new project
4. Import your repository
5. Configure project settings:
   - Framework: Other
   - Build Command: `npm run build`
   - Output Directory: `public`
6. Add environment variables in Vercel dashboard
7. Deploy

## Heroku Deployment

1. Install Heroku CLI:
   ```bash
   npm install -g heroku
   ```

2. Login to Heroku:
   ```bash
   heroku login
   ```

3. Create a new Heroku app:
   ```bash
   heroku create your-app-name
   ```

4. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set FACEBOOK_APP_ID=your_facebook_app_id
   heroku config:set FACEBOOK_APP_SECRET=your_facebook_app_secret
   ```

5. Deploy:
   ```bash
   git push heroku main
   ```

## Docker Deployment

### Building the Docker Image

1. Create a `Dockerfile`:
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   
   EXPOSE 3000
   
   CMD ["npm", "start"]
   ```

2. Create a `.dockerignore`:
   ```
   node_modules
   npm-debug.log
   .git
   .gitignore
   README.md
   .env
   ```

3. Build the image:
   ```bash
   docker build -t facebook-ai-manager .
   ```

### Running with Docker

1. Run the container:
   ```bash
   docker run -p 3000:3000 \
     -e MONGODB_URI=your_mongodb_uri \
     -e JWT_SECRET=your_jwt_secret \
     -e FACEBOOK_APP_ID=your_facebook_app_id \
     -e FACEBOOK_APP_SECRET=your_facebook_app_secret \
     facebook-ai-manager
   ```

### Docker Compose

Create a `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/facebook-ai-manager
      - JWT_SECRET=your_jwt_secret
      - FACEBOOK_APP_ID=your_facebook_app_id
      - FACEBOOK_APP_SECRET=your_facebook_app_secret
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

volumes:
  mongo_data:
```

Run with:
```bash
docker-compose up -d
```

## Manual Server Deployment

### Ubuntu/Debian Server

1. Update system:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. Install Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. Install MongoDB:
   ```bash
   sudo apt install -y mongodb
   sudo systemctl start mongodb
   sudo systemctl enable mongodb
   ```

4. Clone repository:
   ```bash
   git clone https://github.com/your-username/facebook-ai-manager.git
   cd facebook-ai-manager
   ```

5. Install dependencies:
   ```bash
   npm install --production
   ```

6. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   nano .env
   ```

7. Install PM2 for process management:
   ```bash
   sudo npm install -g pm2
   ```

8. Start application:
   ```bash
   pm2 start netlify/functions/api.js --name facebook-ai-manager
   pm2 startup
   pm2 save
   ```

9. Set up Nginx as reverse proxy (optional):
   ```bash
   sudo apt install nginx
   ```

   Create Nginx config:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

10. Enable SSL with Let's Encrypt:
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d yourdomain.com
    ```

## Facebook App Configuration

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth settings:
   - Valid OAuth Redirect URIs: `https://yourdomain.com/auth/facebook/callback`
5. Get App ID and App Secret
6. Add to environment variables

## MongoDB Configuration

### MongoDB Atlas (Recommended)

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Configure database access:
   - Add a database user
   - Whitelist IP addresses (or allow access from anywhere for development)
4. Get connection string:
   - Cluster → Connect → Connect your application
   - Replace `<password>` with your database user password
5. Add to environment variables

### Local MongoDB

1. Install MongoDB:
   ```bash
   # Ubuntu/Debian
   sudo apt install mongodb
   
   # macOS
   brew install mongodb-community
   ```

2. Start MongoDB:
   ```bash
   # Ubuntu/Debian
   sudo systemctl start mongodb
   
   # macOS
   brew services start mongodb-community
   ```

3. Connection string: `mongodb://localhost:27017/facebook-ai-manager`

## SSL Configuration

### Let's Encrypt (Nginx)

1. Install Certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. Obtain certificate:
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

### Let's Encrypt (Apache)

1. Install Certbot:
   ```bash
   sudo apt install certbot python3-certbot-apache
   ```

2. Obtain certificate:
   ```bash
   sudo certbot --apache -d yourdomain.com
   ```

## Monitoring and Logging

### Application Monitoring

1. Set up PM2 monitoring:
   ```bash
   pm2 monit
   ```

2. Enable PM2 logs:
   ```bash
   pm2 logs
   ```

### Error Tracking

1. Integrate with Sentry:
   ```bash
   npm install @sentry/node @sentry/tracing
   ```

2. Add to your application:
   ```javascript
   const Sentry = require('@sentry/node');
   
   Sentry.init({
     dsn: "YOUR_SENTRY_DSN",
     tracesSampleRate: 1.0,
   });
   ```

### Performance Monitoring

1. Set up application performance monitoring with tools like:
   - New Relic
   - Datadog
   - Prometheus + Grafana

### Log Management

1. Centralize logs with:
   - Loggly
   - Papertrail
   - ELK Stack (Elasticsearch, Logstash, Kibana)

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MONGODB_URI in environment variables
   - Ensure MongoDB is running
   - Verify network connectivity

2. **Facebook Login Not Working**
   - Check FACEBOOK_APP_ID and FACEBOOK_APP_SECRET
   - Verify OAuth redirect URIs in Facebook Developer Console
   - Ensure app is live or test users are added

3. **JWT Token Issues**
   - Verify JWT_SECRET is set and secure
   - Check token expiration settings
   - Ensure consistent secret across instances

4. **CORS Errors**
   - Check CORS configuration in config.js
   - Verify allowed origins match your frontend URL

### Getting Help

1. Check application logs:
   ```bash
   # PM2 logs
   pm2 logs
   
   # Docker logs
   docker logs container_name
   ```

2. Enable debug mode:
   ```bash
   # Add to environment variables
   DEBUG=facebook-ai-manager:*
   ```

3. Contact support:
   - Email: support@facebook-ai-manager.com
   - GitHub Issues: [Repository Issues](https://github.com/your-username/facebook-ai-manager/issues)

## Security Considerations

1. **Environment Variables**
   - Never commit .env files to version control
   - Use strong, random secrets for JWT_SECRET
   - Rotate secrets regularly

2. **Database Security**
   - Use strong database user passwords
   - Limit database user permissions
   - Enable MongoDB authentication

3. **API Security**
   - Implement rate limiting (already included)
   - Use helmet for security headers (already included)
   - Validate all user inputs

4. **Network Security**
   - Use HTTPS in production
   - Restrict access to database ports
   - Use firewalls to limit access

5. **Facebook API**
   - Store app secrets securely
   - Use Facebook's token exchange for long-lived tokens
   - Implement proper token refresh mechanisms

## Scaling Considerations

1. **Horizontal Scaling**
   - Use load balancer for multiple instances
   - Implement sticky sessions for WebSocket connections
   - Use Redis for session storage

2. **Database Scaling**
   - Use MongoDB sharding for large datasets
   - Implement read replicas
   - Use connection pooling

3. **Caching**
   - Implement Redis caching for frequently accessed data
   - Use CDN for static assets
   - Cache API responses where appropriate

4. **Monitoring**
   - Set up health checks
   - Monitor resource usage
   - Implement alerting for critical issues

---

For additional support, please refer to the [README.md](README.md) file or contact our support team.