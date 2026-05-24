/**
 * Error Handling Middleware
 * Global error handler for all routes
 */

const logger = require('../utils/logger');

/**
 * Custom Error Class
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Async handler wrapper to catch errors
 */
const catchAsyncError = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Global error handling middleware
 */
const errorHandler = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.message = error.message || 'Internal server error';

  // Log error
  logger.error(`Error: ${error.message}`, {
    statusCode: error.statusCode,
    stack: error.stack,
  });

  // Response
  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Cannot ${req.method} ${req.originalUrl}`,
    404
  );
  next(error);
};

module.exports = {
  AppError,
  catchAsyncError,
  errorHandler,
  notFoundHandler,
};
