/**
 * Payment Service
 * Handles Stripe payment processing
 */

const stripe = require('../config/stripe');
const Order = require('../models/Order');
const logger = require('../utils/logger');

/**
 * Create Stripe payment intent
 */
const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
    });

    logger.info('Payment intent created', {
      intentId: paymentIntent.id,
      amount,
    });

    return paymentIntent;
  } catch (error) {
    logger.error('Error creating payment intent:', error);
    throw error;
  }
};

/**
 * Confirm payment
 */
const confirmPayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      return {
        success: true,
        message: 'Payment successful',
        paymentId: paymentIntent.id,
      };
    }

    return {
      success: false,
      message: 'Payment not completed',
      status: paymentIntent.status,
    };
  } catch (error) {
    logger.error('Error confirming payment:', error);
    throw error;
  }
};

/**
 * Process refund
 */
const processRefund = async (paymentIntentId, amount = null) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });

    logger.info('Refund processed', {
      refundId: refund.id,
      amount: refund.amount,
    });

    return refund;
  } catch (error) {
    logger.error('Error processing refund:', error);
    throw error;
  }
};

/**
 * Get payment details
 */
const getPaymentDetails = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    logger.error('Error retrieving payment details:', error);
    throw error;
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  processRefund,
  getPaymentDetails,
};
