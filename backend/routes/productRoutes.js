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

module.exports = router;
