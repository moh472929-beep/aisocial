/**
 * Custom API Error class for better error handling
 */
class ApiError extends Error {
  constructor(statusCode, message, messageAr = null, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.messageAr = messageAr || message;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message, messageAr = null) {
    return new ApiError(400, message, messageAr);
  }

  static unauthorized(message = 'Unauthorized', messageAr = 'غير مصرح') {
    return new ApiError(401, message, messageAr);
  }

  static forbidden(message = 'Forbidden', messageAr = 'محظور') {
    return new ApiError(403, message, messageAr);
  }

  static notFound(message = 'Not found', messageAr = 'غير موجود') {
    return new ApiError(404, message, messageAr);
  }

  static conflict(message = 'Conflict', messageAr = 'تعارض') {
    return new ApiError(409, message, messageAr);
  }

  static tooManyRequests(message = 'Too many requests', messageAr = 'طلبات كثيرة جداً') {
    return new ApiError(429, message, messageAr);
  }

  static internal(message = 'Internal server error', messageAr = 'خطأ في الخادم') {
    return new ApiError(500, message, messageAr, false);
  }
}

module.exports = ApiError;
