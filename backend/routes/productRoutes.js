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

// Protected routes - Seller only
router.post(
  '/',
  authenticateToken,
  isSeller,
  productController.createProduct
);

router.put(
  '/:productId',
  authenticateToken,
  isSeller,
  productController.updateProduct
);

router.post(
  '/:productId/images',
  authenticateToken,
  isSeller,
  upload.array('images', 5),
  productController.uploadProductImages
);

router.delete(
  '/:productId',
  authenticateToken,
  isSeller,
  productController.deleteProduct
);

module.exports = router;
