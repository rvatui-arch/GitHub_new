/**
 * User Controller
 * Handles user profile, settings, and account management
 */

const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');
const { uploadToCloudinary } = require('../services/aiService');
const logger = require('../utils/logger');

/**
 * Get User Profile
 * GET /api/users/profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('followers', 'firstName lastName avatar')
      .populate('following', 'firstName lastName avatar')
      .populate('wishlist', 'title price images');

    return sendSuccess(res, 200, 'Profile fetched', user);
  } catch (error) {
    logger.error('Get profile error:', error);
    return sendError(res, 500, 'Failed to fetch profile');
  }
};

/**
 * Update User Profile
 * PUT /api/users/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, bio, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        firstName,
        lastName,
        phone,
        bio,
        address,
      },
      { new: true, runValidators: true }
    );

    logger.info(`Profile updated: ${user.email}`);

    return sendSuccess(res, 200, 'Profile updated', user);
  } catch (error) {
    logger.error('Update profile error:', error);
    return sendError(res, 500, 'Failed to update profile');
  }
};

/**
 * Upload Avatar
 * POST /api/users/avatar
 */
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No file uploaded');
    }

    // Delete old avatar if exists
    if (req.user.avatar?.publicId) {
      const { deleteFromCloudinary } = require('../services/aiService');
      await deleteFromCloudinary(req.user.avatar.publicId);
    }

    // Upload new avatar
    const { url, publicId } = await uploadToCloudinary(req.file.path, 'avatars');

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: { url, publicId } },
      { new: true }
    );

    logger.info(`Avatar uploaded: ${user.email}`);

    return sendSuccess(res, 200, 'Avatar uploaded', user);
  } catch (error) {
    logger.error('Upload avatar error:', error);
    return sendError(res, 500, 'Failed to upload avatar');
  }
};

/**
 * Follow User
 * POST /api/users/:userId/follow
 */
exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return sendError(res, 400, 'Cannot follow yourself');
    }

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Add to following list
    if (!req.user.following.includes(userId)) {
      req.user.following.push(userId);
      user.followers.push(req.user._id);

      await req.user.save();
      await user.save();

      logger.info(`User ${req.user._id} followed ${userId}`);
    }

    return sendSuccess(res, 200, 'User followed');
  } catch (error) {
    logger.error('Follow user error:', error);
    return sendError(res, 500, 'Failed to follow user');
  }
};

/**
 * Unfollow User
 * DELETE /api/users/:userId/follow
 */
exports.unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Remove from lists
    req.user.following = req.user.following.filter(id => id.toString() !== userId);
    user.followers = user.followers.filter(id => id.toString() !== req.user._id);

    await req.user.save();
    await user.save();

    logger.info(`User ${req.user._id} unfollowed ${userId}`);

    return sendSuccess(res, 200, 'User unfollowed');
  } catch (error) {
    logger.error('Unfollow user error:', error);
    return sendError(res, 500, 'Failed to unfollow user');
  }
};

/**
 * Get User by ID (Public Profile)
 * GET /api/users/:userId
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('followers', 'firstName lastName avatar')
      .populate('following', 'firstName lastName avatar');

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Return public profile only
    const publicProfile = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      shopName: user.shopName,
      shopRating: user.shopRating,
      shopReviews: user.shopReviews,
      totalSales: user.totalSales,
    };

    return sendSuccess(res, 200, 'User fetched', publicProfile);
  } catch (error) {
    logger.error('Get user by ID error:', error);
    return sendError(res, 500, 'Failed to fetch user');
  }
};

/**
 * Get User Orders
 * GET /api/users/orders
 */
exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const Order = require('../models/Order');
    const orders = await Order.find({ buyer: req.user._id })
      .populate('items.product', 'title images price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments({ buyer: req.user._id });

    return sendSuccess(res, 200, 'Orders fetched', {
      orders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        perPage: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error('Get orders error:', error);
    return sendError(res, 500, 'Failed to fetch orders');
  }
};

/**
 * Add to Wishlist
 * POST /api/users/wishlist/:productId
 */
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!req.user.wishlist.includes(productId)) {
      req.user.wishlist.push(productId);
      await req.user.save();
      logger.info(`Product added to wishlist: ${req.user._id}`);
    }

    return sendSuccess(res, 200, 'Added to wishlist');
  } catch (error) {
    logger.error('Add to wishlist error:', error);
    return sendError(res, 500, 'Failed to add to wishlist');
  }
};

/**
 * Remove from Wishlist
 * DELETE /api/users/wishlist/:productId
 */
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    req.user.wishlist = req.user.wishlist.filter(
      id => id.toString() !== productId
    );
    await req.user.save();

    logger.info(`Product removed from wishlist: ${req.user._id}`);

    return sendSuccess(res, 200, 'Removed from wishlist');
  } catch (error) {
    logger.error('Remove from wishlist error:', error);
    return sendError(res, 500, 'Failed to remove from wishlist');
  }
};

/**
 * Change Password
 * POST /api/users/change-password
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, 400, 'Both current and new password are required');
    }
    if (newPassword.length < 6) {
      return sendError(res, 400, 'New password must be at least 6 characters');
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 401, 'Current password is incorrect');
    }

    user.password = newPassword;
    await user.save(); // pre-save hook hashes it

    logger.info(`Password changed for user: ${user.email}`);
    return sendSuccess(res, 200, 'Password changed successfully');
  } catch (error) {
    logger.error('Change password error:', error);
    return sendError(res, 500, 'Failed to change password');
  }
};
