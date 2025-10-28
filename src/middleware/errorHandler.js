import winston from "winston";

// Create logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'facebook-ai-manager' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error(err.message, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Determine error status code
  const statusCode = err.statusCode || 500;

  // Determine error message based on environment
  const message = process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message;

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// 404 handler
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export {
  errorHandler,
  notFoundHandler,
  logger,
};
