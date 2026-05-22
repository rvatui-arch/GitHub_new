/**
 * AI Routes
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

// Protected routes
router.post(
  '/try-on',
  authenticateToken,
  uploadLimiter,
  upload.array('images', 2),
  aiController.processVirtualTryOn
);

router.get('/try-on-history', authenticateToken, aiController.getTryOnHistory);

module.exports = router;
