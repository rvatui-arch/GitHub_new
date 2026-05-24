/**
 * Product Routes
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, isSeller } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:productId', productController.getProductById);
router.get('/seller/:sellerId', productController.getSellerProducts);

// Protected routes - any authenticated user can sell
router.post('/', authenticateToken, productController.createProduct);
router.put('/:productId', authenticateToken, productController.updateProduct);
router.post('/:productId/images', authenticateToken, upload.array('images', 5), productController.uploadProductImages);
router.delete('/:productId', authenticateToken, productController.deleteProduct);

// Comments (public read, auth to write/delete/reply)
router.get('/:productId/comments', productController.getComments);
router.post('/:productId/comments', authenticateToken, productController.addComment);
router.delete('/:productId/comments/:commentId', authenticateToken, productController.deleteComment);
router.post('/:productId/comments/:commentId/reply', authenticateToken, productController.replyToComment);

// Product Reviews (public read, auth to write)
router.get('/:productId/reviews', productController.getProductReviews);
router.post('/:productId/reviews', authenticateToken, productController.addProductReview);
router.delete('/:productId/reviews/:reviewId', authenticateToken, productController.deleteProductReview);

module.exports = router;
