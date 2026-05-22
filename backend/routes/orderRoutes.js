/**
 * Order Routes
 */

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimiter');

// Protected routes
router.post('/', authenticateToken, orderController.createOrder);
router.get('/my-orders', authenticateToken, orderController.getMyOrders);
router.get('/:orderId', authenticateToken, orderController.getOrderById);
router.post(
  '/:orderId/confirm-payment',
  authenticateToken,
  paymentLimiter,
  orderController.confirmPayment
);
router.put('/:orderId/status', authenticateToken, orderController.updateOrderStatus);
router.post('/:orderId/cancel', authenticateToken, orderController.cancelOrder);

module.exports = router;
