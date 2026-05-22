/**
 * Response Utility
 * Standardized API responses
 */

/**
 * Success response
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Error response
 */
const sendError = (res, statusCode = 500, message = 'Error') => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

/**
 * Paginated response
 */
const sendPaginatedSuccess = (
  res,
  statusCode = 200,
  message = 'Success',
  data = [],
  pagination = {}
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      total: pagination.total || 0,
      pages: pagination.pages || 0,
      currentPage: pagination.currentPage || 1,
      perPage: pagination.perPage || 10,
    },
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginatedSuccess,
};
