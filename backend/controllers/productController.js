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
    const { title, description, price, category, stock, size, color } = req.body;

    if (!title || !description || !price || !category || !stock) {
      return sendError(res, 400, 'Missing required fields');
    }

    const product = await Product.create({
      title,
      description,
      price,
      category,
      stock,
      size: size ? JSON.parse(size) : [],
      color: color ? JSON.parse(color) : [],
      seller: req.user._id,
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
