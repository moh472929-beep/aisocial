# Important Notes and Warnings

## Security Considerations

### JWT Secret
- The default JWT secret in `.env.example` is not secure for production use
- Generate a strong, random secret for production environments
- Never commit `.env` files to version control

### MongoDB Connection
- The default MongoDB URI points to a local database
- For production, use a secure MongoDB Atlas cluster or properly secured remote database
- Ensure database user permissions are properly restricted

### Facebook App Credentials
- Facebook App ID and Secret are required for Facebook integration
- These should be kept secure and never exposed in client-side code
- Use Facebook's token exchange for long-lived tokens in production

## Deployment Warnings

### Environment Variables
- Always set `NODE_ENV=production` in production environments
- Review all environment variables before deployment
- Use platform-specific methods for managing secrets (Netlify, Vercel, etc.)

### Database Migrations
- Ensure MongoDB is properly backed up before deploying updates
- Test database connectivity in staging environment first
- Monitor database performance after deployment

### Rate Limiting
- Default rate limiting is set to 100 requests per 15 minutes
- Adjust limits based on your expected traffic and infrastructure
- Consider implementing additional rate limiting at the infrastructure level

## Testing Considerations

### Test Database
- Tests currently require a running MongoDB instance
- Configure a separate test database to avoid data corruption
- Use mock data for testing to ensure consistency

### Facebook API Testing
- Facebook API tests require valid credentials
- Use Facebook's test users for automated testing
- Be aware of Facebook's rate limits during testing

## Performance Considerations

### Memory Usage
- Monitor memory usage, especially with multiple concurrent users
- Implement caching strategies for frequently accessed data
- Consider using Redis for session storage in scaled deployments

### Response Times
- API response times may vary based on Facebook API performance
- Implement proper timeout handling for external API calls
- Use background jobs for long-running operations

## Maintenance Requirements

### Dependency Updates
- Regularly update dependencies to address security vulnerabilities
- Test updates in staging environment before production deployment
- Monitor for deprecated packages and plan migration paths

### Log Management
- Implement log rotation to prevent disk space issues
- Consider centralized logging solutions for production environments
- Monitor logs for security events and error patterns

### Backup Strategy
- Implement regular database backups
- Test backup restoration procedures regularly
- Store backups in secure, geographically distributed locations

## AI Permissions Management

### Granular Permissions
The AI permissions system now supports granular control over AI capabilities:
- **Auto Publishing**: Allow the AI to automatically publish posts that the user has created and approved for scheduling
- **Post Scheduling**: Enable the AI to schedule multiple posts at specific times set by the user
- **Auto Content Generation**: Allow the AI to automatically generate and publish posts based on trending topics detected by the system

### Security Best Practices
- Only grant necessary permissions to users
- Regularly review AI permissions for all users
- Monitor AI activity through logs and analytics
- Implement role-based access control for AI features

## Internationalization (i18n) Features

### Dynamic Chat Alignment
The chat interface automatically adjusts its position based on the selected language:
- For RTL languages (like Arabic): Chat box aligns to the left side
- For LTR languages (like English, French, German, Spanish, Russian): Chat box aligns to the right side
- This behavior dynamically changes when switching languages in the UI

### Supported Languages
The application now supports 6 languages:
- English
- Arabic
- French
- German
- Spanish
- Russian

## Code Quality and Maintenance

### ESLint and Prettier
- ESLint has been configured to enforce code quality standards
- Prettier has been configured to ensure consistent code formatting
- All files have been formatted with Prettier
- Linting issues have been resolved

### Modern JavaScript
- The codebase uses modern JavaScript syntax throughout
- Async/await is used consistently for asynchronous operations
- ES6+ features are utilized where appropriate

### Error Handling
- Centralized error handling middleware is implemented
- Structured API responses are used consistently
- Comprehensive logging is implemented with Winston and Pino

## Known Limitations

### Facebook API Restrictions
- Facebook's API has rate limits that may affect functionality
- Some Facebook features may require app review and approval
- Facebook's policies may change, affecting integration

### Scalability
- Current implementation is designed for small to medium scale
- Horizontal scaling requires additional infrastructure considerations
- Session management may need Redis or similar solution for clustering

### Browser Compatibility
- Frontend assumes modern browser support
- Legacy browser support may require additional polyfills
- Test on target browsers before deployment

## Support Information

For issues not covered in this document:

1. Check the [DEPLOYMENT.md](DEPLOYMENT.md) guide for detailed deployment instructions
2. Review the [README.md](README.md) for general project information
3. Open an issue on the GitHub repository for bug reports
4. Contact support at support@facebook-ai-manager.com for urgent issues

## Next Steps

1. Review all configuration files for your specific environment
2. Test all functionality in a staging environment
3. Implement monitoring and alerting for production deployment
4. Train team members on the updated codebase and deployment process
5. Schedule regular maintenance windows for updates and backups