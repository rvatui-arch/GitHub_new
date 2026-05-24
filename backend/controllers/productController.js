/**
 * Product Controller
 * Handles product CRUD operations
 */

const Product = require('../models/Product');
const { sendSuccess, sendError, sendPaginatedSuccess } = require('../utils/response');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/aiService');
const logger = require('../utils/logger');

/**
 * Create Product
 * POST /api/products
 */
exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, category, stock, size, color, brand, condition, gender, originalPrice } = req.body;

    if (!title || !description || !price || !category) {
      return sendError(res, 400, 'Missing required fields');
    }

    const parseSafe = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try { return JSON.parse(val); } catch { return [val]; }
    };

    const product = await Product.create({
      title,
      description,
      price,
      category,
      stock: stock || 1,
      size: parseSafe(size),
      color: parseSafe(color),
      brand,
      condition,
      seller: req.user._id,
      status: 'active',
    });

    logger.info(`Product created: ${product._id}`);

    return sendSuccess(res, 201, 'Product created', product);
  } catch (error) {
    logger.error('Create product error:', error);
    return sendError(res, 500, 'Failed to create product');
  }
};

/**
 * Get All Products with Filters
 * GET /api/products
 */
exports.getAllProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { status: 'active' };

    if (category) filter.category = category;
    if (search) {
      filter.$text = { $search: search };
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const products = await Product.find(filter)
      .populate('seller', 'firstName lastName avatar shopRating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    return sendPaginatedSuccess(res, 200, 'Products fetched', products, {
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      perPage: parseInt(limit),
    });
  } catch (error) {
    logger.error('Get products error:', error);
    return sendError(res, 500, 'Failed to fetch products');
  }
};

/**
 * Get Product by ID
 * GET /api/products/:productId
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)
      .populate('seller', 'firstName lastName avatar shopRating shopName');

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    return sendSuccess(res, 200, 'Product fetched', product);
  } catch (error) {
    logger.error('Get product by ID error:', error);
    return sendError(res, 500, 'Failed to fetch product');
  }
};

/**
 * Update Product
 * PUT /api/products/:productId
 */
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    // Check authorization
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'Not authorized to update this product');
    }

    // Update fields
    Object.assign(product, req.body);
    await product.save();

    logger.info(`Product updated: ${product._id}`);

    return sendSuccess(res, 200, 'Product updated', product);
  } catch (error) {
    logger.error('Update product error:', error);
    return sendError(res, 500, 'Failed to update product');
  }
};

/**
 * Upload Product Images
 * POST /api/products/:productId/images
 */
exports.uploadProductImages = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized');
    }

    if (!req.files || req.files.length === 0) {
      return sendError(res, 400, 'No files uploaded');
    }

    // Upload each image
    for (const file of req.files) {
      const { url, publicId } = await uploadToCloudinary(file.path, 'products');
      product.images.push({ url, publicId });
    }

    // Set thumbnail if not exists
    if (!product.thumbnail && product.images.length > 0) {
      product.thumbnail = product.images[0];
    }

    await product.save();

    logger.info(`Images uploaded for product: ${product._id}`);

    return sendSuccess(res, 200, 'Images uploaded', product);
  } catch (error) {
    logger.error('Upload images error:', error);
    return sendError(res, 500, 'Failed to upload images');
  }
};

/**
 * Delete Product
 * DELETE /api/products/:productId
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'Not authorized');
    }

    // Delete images from Cloudinary
    for (const image of product.images) {
      await deleteFromCloudinary(image.publicId);
    }

    await Product.findByIdAndDelete(req.params.productId);

    logger.info(`Product deleted: ${req.params.productId}`);

    return sendSuccess(res, 200, 'Product deleted');
  } catch (error) {
    logger.error('Delete product error:', error);
    return sendError(res, 500, 'Failed to delete product');
  }
};

/**
 * Get Seller Products
 * GET /api/products/seller/:sellerId
 */
exports.getSellerProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const products = await Product.find({ seller: req.params.sellerId, status: 'active' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments({
      seller: req.params.sellerId,
      status: 'active',
    });

    return sendPaginatedSuccess(res, 200, 'Products fetched', products, {
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      perPage: parseInt(limit),
    });
  } catch (error) {
    logger.error('Get seller products error:', error);
    return sendError(res, 500, 'Failed to fetch products');
  }
};

/**
 * Get Comments for a Product
 * GET /api/products/:productId/comments
 */
exports.getComments = async (req, res) => {
  try {
    const Comment = require('../models/Comment');
    const comments = await Comment.find({ product: req.params.productId })
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(100);
    return sendSuccess(res, 200, 'Comments fetched', comments);
  } catch (error) {
    logger.error('Get comments error:', error);
    return sendError(res, 500, 'Failed to fetch comments');
  }
};

/**
 * Add Comment to a Product
 * POST /api/products/:productId/comments
 */
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return sendError(res, 400, 'Comment text is required');

    const Comment = require('../models/Comment');
    const comment = await Comment.create({
      product: req.params.productId,
      author: req.user._id,
      text: text.trim(),
    });
    await comment.populate('author', 'firstName lastName');

    logger.info(`Comment added by ${req.user.email} on product ${req.params.productId}`);
    return sendSuccess(res, 201, 'Comment added', comment);
  } catch (error) {
    logger.error('Add comment error:', error);
    return sendError(res, 500, 'Failed to add comment');
  }
};

/**
 * Delete Comment — comment author OR product owner can delete
 * DELETE /api/products/:productId/comments/:commentId
 */
exports.deleteComment = async (req, res) => {
  try {
    const Comment = require('../models/Comment');
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return sendError(res, 404, 'Comment not found');

    const isAuthor = comment.author.toString() === req.user._id.toString();
    const product  = await Product.findById(req.params.productId).select('seller');
    const isOwner  = product && product.seller.toString() === req.user._id.toString();

    if (!isAuthor && !isOwner) return sendError(res, 403, 'Not authorized');
    await comment.deleteOne();
    return sendSuccess(res, 200, 'Comment deleted');
  } catch (error) {
    logger.error('Delete comment error:', error);
    return sendError(res, 500, 'Failed to delete comment');
  }
};

/**
 * Reply to a Comment (product owner only)
 * POST /api/products/:productId/comments/:commentId/reply
 */
exports.replyToComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return sendError(res, 400, 'Reply text is required');

    const product = await Product.findById(req.params.productId).select('seller');
    if (!product) return sendError(res, 404, 'Product not found');
    if (product.seller.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Only the product owner can reply');
    }

    const Comment = require('../models/Comment');
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return sendError(res, 404, 'Comment not found');

    comment.replies.push({ author: req.user._id, text: text.trim() });
    await comment.save();
    await comment.populate('author', 'firstName lastName');
    await comment.populate('replies.author', 'firstName lastName');

    return sendSuccess(res, 201, 'Reply added', comment);
  } catch (error) {
    logger.error('Reply to comment error:', error);
    return sendError(res, 500, 'Failed to add reply');
  }
};

// ─── PRODUCT REVIEWS ────────────────────────────────────────────────────────

/** Helper — recalculate product averageRating + reviewCount */
async function recalcProductRating(productId) {
  const ProductReview = require('../models/ProductReview');
  const agg = await ProductReview.aggregate([
    { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(String(productId)) } },
    { $group: { _id: null, avg: { $avg: '$rating' }, cnt: { $sum: 1 } } },
  ]);
  const avg = agg[0] ? Math.round(agg[0].avg * 10) / 10 : 0;
  const cnt = agg[0] ? agg[0].cnt : 0;
  await Product.findByIdAndUpdate(productId, { averageRating: avg, reviewCount: cnt });
}

/**
 * Get Product Reviews
 * GET /api/products/:productId/reviews
 */
exports.getProductReviews = async (req, res) => {
  try {
    const ProductReview = require('../models/ProductReview');
    const reviews = await ProductReview.find({ product: req.params.productId })
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 });
    return sendSuccess(res, 200, 'Reviews fetched', reviews);
  } catch (error) {
    logger.error('Get product reviews error:', error);
    return sendError(res, 500, 'Failed to fetch reviews');
  }
};

/**
 * Add / Update Product Review (one per user per product)
 * POST /api/products/:productId/reviews
 */
exports.addProductReview = async (req, res) => {
  try {
    const { rating, text } = req.body;
    if (!rating || rating < 1 || rating > 5) return sendError(res, 400, 'Rating must be 1-5');

    const product = await Product.findById(req.params.productId).select('seller');
    if (!product) return sendError(res, 404, 'Product not found');
    if (product.seller.toString() === req.user._id.toString()) {
      return sendError(res, 400, 'Cannot review your own product');
    }

    const ProductReview = require('../models/ProductReview');
    const review = await ProductReview.findOneAndUpdate(
      { product: req.params.productId, author: req.user._id },
      { rating: Number(rating), text: (text || '').trim() },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    await review.populate('author', 'firstName lastName');
    await recalcProductRating(req.params.productId);

    logger.info(`Product review by ${req.user.email}: ${rating}★`);
    return sendSuccess(res, 201, 'Review saved', review);
  } catch (error) {
    logger.error('Add product review error:', error);
    return sendError(res, 500, 'Failed to save review');
  }
};

/**
 * Delete Own Product Review
 * DELETE /api/products/:productId/reviews/:reviewId
 */
exports.deleteProductReview = async (req, res) => {
  try {
    const ProductReview = require('../models/ProductReview');
    const review = await ProductReview.findById(req.params.reviewId);
    if (!review) return sendError(res, 404, 'Review not found');
    if (review.author.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized');
    }
    await review.deleteOne();
    await recalcProductRating(req.params.productId);
    return sendSuccess(res, 200, 'Review deleted');
  } catch (error) {
    logger.error('Delete product review error:', error);
    return sendError(res, 500, 'Failed to delete review');
  }
};
