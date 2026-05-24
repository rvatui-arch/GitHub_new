/**
 * AI Virtual Try-On Controller
 * Handles virtual try-on processing
 */

const { sendSuccess, sendError } = require('../utils/response');
const aiService = require('../services/aiService');
const logger = require('../utils/logger');

/**
 * Process Virtual Try-On
 * POST /api/ai/try-on
 */
exports.processVirtualTryOn = async (req, res) => {
  try {
    // Validate files
    if (!req.files || req.files.length < 2) {
      return sendError(res, 400, 'Both user image and product image are required');
    }

    const userImageFile = req.files.find(f => f.fieldname === 'userImage');
    const productImageFile = req.files.find(f => f.fieldname === 'productImage');

    if (!userImageFile || !productImageFile) {
      return sendError(res, 400, 'Missing required images');
    }

    // Validate images
    aiService.validateImage(userImageFile.path);
    aiService.validateImage(productImageFile.path);

    // Upload images to Cloudinary
    const { url: userImageUrl } = await aiService.uploadToCloudinary(
      userImageFile.path,
      'try-on/user-images'
    );
    const { url: productImageUrl } = await aiService.uploadToCloudinary(
      productImageFile.path,
      'try-on/product-images'
    );

    // Process with AI
    const result = await aiService.processVirtualTryOn(userImageUrl, productImageUrl);

    logger.info('Virtual try-on processed successfully', {
      userId: req.user._id,
      userImageUrl,
      productImageUrl,
    });

    return sendSuccess(res, 200, 'Virtual try-on processed', {
      ...result,
      userImageUrl,
      productImageUrl,
    });
  } catch (error) {
    logger.error('Virtual try-on error:', error);
    return sendError(res, 500, 'Failed to process virtual try-on');
  }
};

/**
 * Analyze style fit — accepts base64 image + item metadata
 * POST /api/ai/analyze
 */
exports.analyzeTryOn = async (req, res) => {
  try {
    const { userImageBase64, mediaType, itemTitle, itemBrand, itemCategory, itemColor, itemCondition, itemSize } = req.body;

    if (!userImageBase64) return sendError(res, 400, 'User image is required');

    const result = await aiService.analyzeStyleFit(
      userImageBase64,
      mediaType || 'image/jpeg',
      { title: itemTitle || 'item', brand: itemBrand, category: itemCategory, color: itemColor, condition: itemCondition, size: itemSize }
    );

    logger.info('Style analysis done');
    return sendSuccess(res, 200, 'Analysis complete', result);
  } catch (error) {
    logger.error('Style analysis error:', error);
    return sendError(res, 500, error.message || 'Failed to analyze style');
  }
};

/**
 * Get Try-On History
 * GET /api/ai/try-on-history
 */
exports.getTryOnHistory = async (req, res) => {
  try {
    // In a real app, you would store try-on results in database
    // For now, returning a placeholder
    return sendSuccess(res, 200, 'Try-on history fetched', {
      note: 'Implement database storage for try-on results',
    });
  } catch (error) {
    logger.error('Get try-on history error:', error);
    return sendError(res, 500, 'Failed to fetch try-on history');
  }
};
