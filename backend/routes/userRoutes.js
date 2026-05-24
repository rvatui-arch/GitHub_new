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
router.post('/wishlist/:productId', authenticateToken, userController.addToWishlist);
router.delete('/wishlist/:productId', authenticateToken, userController.removeFromWishlist);

// Public routes
router.get('/:userId', userController.getUserById);
router.post('/:userId/follow', authenticateToken, userController.followUser);
router.delete('/:userId/follow', authenticateToken, userController.unfollowUser);

module.exports = router;
