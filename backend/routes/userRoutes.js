/**
 * User Routes
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Protected routes
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);
router.post('/avatar', authenticateToken, upload.single('avatar'), userController.uploadAvatar);
router.get('/orders', authenticateToken, userController.getMyOrders);
router.post('/change-password', authenticateToken, userController.changePassword);
router.post('/wishlist/:productId', authenticateToken, userController.addToWishlist);
router.delete('/wishlist/:productId', authenticateToken, userController.removeFromWishlist);

// Public routes
router.get('/:userId', userController.getUserById);
router.post('/:userId/follow', authenticateToken, userController.followUser);
router.delete('/:userId/follow', authenticateToken, userController.unfollowUser);

// Seller reviews (public read, auth to write)
router.get('/:userId/reviews', userController.getSellerReviews);
router.post('/:userId/reviews', authenticateToken, userController.addSellerReview);
router.delete('/:userId/reviews/:reviewId', authenticateToken, userController.deleteSellerReview);
router.post('/:userId/reviews/:reviewId/reply', authenticateToken, userController.replyToSellerReview);

module.exports = router;
