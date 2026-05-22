/**
 * Input Validation Middleware
 * Validates and sanitizes user input
 */

const { body, validationResult } = require('express-validator');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Input sanitization middleware
 */
const sanitizeInput = [
  mongoSanitize(),
  xss(),
];

module.exports = {
  handleValidationErrors,
  sanitizeInput,
  body,
};
