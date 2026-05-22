/**
 * Authentication Controller
 * Handles user registration, login, logout, token refresh
 */

const User = require('../models/User');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sendEmail, verificationEmailTemplate, passwordResetTemplate } = require('../utils/email');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');
const crypto = require('crypto');

/**
 * User Registration
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return sendError(res, 400, 'All fields are required');
    }

    if (password !== confirmPassword) {
      return sendError(res, 400, 'Passwords do not match');
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 409, 'User already exists');
    }

    // Create verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      emailVerificationToken,
      emailVerificationExpires,
    });

    // Send verification email
    const verificationLink = `${process.env.CORS_ORIGIN}/verify-email?token=${emailVerificationToken}`;
    await sendEmail(
      email,
      'Verify Your Email',
      verificationEmailTemplate(verificationLink)
    );

    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    logger.info(`User registered: ${email}`);

    return sendSuccess(res, 201, 'Registration successful. Please verify your email.', {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error('Registration error:', error);
    return sendError(res, 500, 'Registration failed');
  }
};

/**
 * User Login
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required');
    }

    // Find user and select password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return sendError(res, 401, 'Invalid credentials');
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return sendError(res, 403, 'User account is blocked');
    }

    // Verify password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return sendError(res, 401, 'Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    logger.info(`User logged in: ${email}`);

    return sendSuccess(res, 200, 'Login successful', {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error('Login error:', error);
    return sendError(res, 500, 'Login failed');
  }
};

/**
 * Refresh Token
 * POST /api/auth/refresh-token
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, 400, 'Refresh token is required');
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const newAccessToken = generateToken(user._id);

    return sendSuccess(res, 200, 'Token refreshed', {
      accessToken: newAccessToken,
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    return sendError(res, 401, 'Invalid refresh token');
  }
};

/**
 * Verify Email
 * POST /api/auth/verify-email
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return sendError(res, 400, 'Verification token is required');
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return sendError(res, 400, 'Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    logger.info(`Email verified: ${user.email}`);

    return sendSuccess(res, 200, 'Email verified successfully');
  } catch (error) {
    logger.error('Email verification error:', error);
    return sendError(res, 500, 'Email verification failed');
  }
};

/**
 * Forgot Password
 * POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 400, 'Email is required');
    }

    const user = await User.findOne({ email });

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = resetHash;
    user.passwordResetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetLink = `${process.env.CORS_ORIGIN}/reset-password?token=${resetToken}`;
    await sendEmail(
      email,
      'Reset Your Password',
      passwordResetTemplate(resetLink)
    );

    logger.info(`Password reset email sent: ${email}`);

    return sendSuccess(res, 200, 'Password reset email sent');
  } catch (error) {
    logger.error('Forgot password error:', error);
    return sendError(res, 500, 'Forgot password failed');
  }
};

/**
 * Reset Password
 * POST /api/auth/reset-password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return sendError(res, 400, 'All fields are required');
    }

    if (password !== confirmPassword) {
      return sendError(res, 400, 'Passwords do not match');
    }

    const resetHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: resetHash,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return sendError(res, 400, 'Invalid or expired reset token');
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    logger.info(`Password reset: ${user.email}`);

    return sendSuccess(res, 200, 'Password reset successful');
  } catch (error) {
    logger.error('Reset password error:', error);
    return sendError(res, 500, 'Password reset failed');
  }
};

/**
 * Logout
 * POST /api/auth/logout
 */
exports.logout = async (req, res) => {
  try {
    logger.info(`User logged out: ${req.user.email}`);
    return sendSuccess(res, 200, 'Logout successful');
  } catch (error) {
    logger.error('Logout error:', error);
    return sendError(res, 500, 'Logout failed');
  }
};
