// Standardized API response helper
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, error, message = 'Error', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};

const sendNotFound = (res, message = 'Resource not found') => {
  return res.status(404).json({
    success: false,
    message,
    error: 'Not Found',
  });
};

const sendUnauthorized = (res, message = 'Unauthorized') => {
  return res.status(401).json({
    success: false,
    message,
    error: 'Unauthorized',
  });
};

const sendValidationError = (res, errors, message = 'Validation failed') => {
  return res.status(400).json({
    success: false,
    message,
    error: 'Validation Error',
    details: errors,
  });
};

export {
  sendSuccess,
  sendError,
  sendNotFound,
  sendUnauthorized,
  sendValidationError,
};
