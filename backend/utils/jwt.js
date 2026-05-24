/**
 * JWT Utility Functions
 * Token generation and verification
 */

const jwt = require('jsonwebtoken');
const logger = require('./logger');

/**
 * Generate JWT Token
 */
const generateToken = (userId, expiresIn = process.env.JWT_EXPIRE) => {
  try {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn,
    });
    return token;
  } catch (error) {
    logger.error('Error generating token:', error);
    throw error;
  }
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (
  userId,
  expiresIn = process.env.REFRESH_TOKEN_EXPIRE
) => {
  try {
    const token = jwt.sign(
      { id: userId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn }
    );
    return token;
  } catch (error) {
    logger.error('Error generating refresh token:', error);
    throw error;
  }
};

/**
 * Verify JWT Token
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    logger.error('Error verifying token:', error);
    throw error;
  }
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    return decoded;
  } catch (error) {
    logger.error('Error verifying refresh token:', error);
    throw error;
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
};
