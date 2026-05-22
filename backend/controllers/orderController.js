/**
 * Order Controller
 * Handles order creation, payment, and management
 */

const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendSuccess, sendError, sendPaginatedSuccess } = require('../utils/response');
const paymentService = require('../services/paymentService');
const emailService = require('../utils/email');
const logger = require('../utils/logger');

/**
 * Create Order / Checkout
 * POST /api/orders
 */
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, shippingMethod } = req.body;

    if (!items || items.length === 0) {
      return sendError(res, 400, 'Items are required');
    }

    if (!shippingAddress) {
      return sendError(res, 400, 'Shipping address is required');
    }

    // Calculate order totals and validate products
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return sendError(res, 404, `Product not found: ${item.productId}`);
      }

      if (product.stock < item.quantity) {
        return sendError(res, 400, `Insufficient stock for ${product.title}`);
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        size: item.size,
        color: item.color,
      });
    }

    // Calculate totals
    const tax = subtotal * 0.1; // 10% tax
    const shippingCost = shippingMethod === 'express' ? 20 : shippingMethod === 'overnight' ? 50 : 10;
    const totalAmount = subtotal + tax + shippingCost;

    // Create order
    const order = await Order.create({
      buyer: req.user._id,
      seller: orderItems[0].product.seller,
      items: orderItems,
      subtotal,
      tax,
      shippingCost,
      shippingAddress,
      shippingMethod,
      totalAmount,
      paymentStatus: 'pending',
      paymentMethod: req.body.paymentMethod || 'stripe',
    });

    // Create Stripe payment intent
    const paymentIntent = await paymentService.createPaymentIntent(
      totalAmount,
      'usd',
      { orderId: order._id.toString() }
    );

    order.stripePaymentId = paymentIntent.id;
    await order.save();

    logger.info(`Order created: ${order._id}`);

    return sendSuccess(res, 201, 'Order created', {
      order,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    logger.error('Create order error:', error);
    return sendError(res, 500, 'Failed to create order');
  }
};

/**
 * Confirm Payment
 * POST /api/orders/:orderId/confirm-payment
 */
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    // Verify payment
    const paymentResult = await paymentService.confirmPayment(paymentIntentId);

    if (!paymentResult.success) {
      return sendError(res, 400, 'Payment failed');
    }

    // Update order status
    order.paymentStatus = 'completed';
    order.status = 'confirmed';
    order.statusHistory.push({
      status: 'confirmed',
      note: 'Payment received',
    });

    // Reduce product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity, totalSales: item.quantity } }
      );
    }

    await order.save();

    // Send confirmation email
    await emailService.sendEmail(
      req.user.email,
      'Order Confirmation',
      emailService.orderConfirmationTemplate(order.orderNumber, order.totalAmount)
    );

    logger.info(`Payment confirmed for order: ${order._id}`);

    return sendSuccess(res, 200, 'Payment confirmed', order);
  } catch (error) {
    logger.error('Confirm payment error:', error);
    return sendError(res, 500, 'Failed to confirm payment');
  }
};

/**
 * Get My Orders
 * GET /api/orders/my-orders
 */
exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ buyer: req.user._id })
      .populate('items.product', 'title images price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments({ buyer: req.user._id });

    return sendPaginatedSuccess(res, 200, 'Orders fetched', orders, {
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      perPage: parseInt(limit),
    });
  } catch (error) {
    logger.error('Get my orders error:', error);
    return sendError(res, 500, 'Failed to fetch orders');
  }
};

/**
 * Get Order by ID
 * GET /api/orders/:orderId
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('items.product')
      .populate('buyer', 'firstName lastName email')
      .populate('seller', 'firstName lastName shopName');

    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    // Check authorization
    if (
      order.buyer._id.toString() !== req.user._id.toString() &&
      order.seller._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return sendError(res, 403, 'Not authorized');
    }

    return sendSuccess(res, 200, 'Order fetched', order);
  } catch (error) {
    logger.error('Get order by ID error:', error);
    return sendError(res, 500, 'Failed to fetch order');
  }
};

/**
 * Update Order Status
 * PUT /api/orders/:orderId/status
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    // Check authorization
    if (
      order.seller.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return sendError(res, 403, 'Not authorized');
    }

    order.status = status;
    order.statusHistory.push({
      status,
      note: note || '',
    });

    await order.save();

    logger.info(`Order status updated: ${order._id} -> ${status}`);

    return sendSuccess(res, 200, 'Order status updated', order);
  } catch (error) {
    logger.error('Update order status error:', error);
    return sendError(res, 500, 'Failed to update order');
  }
};

/**
 * Cancel Order
 * POST /api/orders/:orderId/cancel
 */
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    if (order.buyer.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized');
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return sendError(res, 400, 'Order cannot be cancelled at this stage');
    }

    order.status = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      note: 'Cancelled by buyer',
    });

    // Process refund
    if (order.paymentStatus === 'completed') {
      await paymentService.processRefund(order.stripePaymentId);
      order.paymentStatus = 'refunded';
    }

    await order.save();

    logger.info(`Order cancelled: ${order._id}`);

    return sendSuccess(res, 200, 'Order cancelled', order);
  } catch (error) {
    logger.error('Cancel order error:', error);
    return sendError(res, 500, 'Failed to cancel order');
  }
};
