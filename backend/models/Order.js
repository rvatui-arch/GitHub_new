/**
 * Order Model
 * Stores order information and payment details
 */

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    // Order Reference
    orderNumber: {
      type: String,
      unique: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Items
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        quantity: Number,
        price: Number,
        size: String,
        color: String,
      },
    ],

    // Pricing
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },

    // Shipping
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    shippingMethod: {
      type: String,
      enum: ['standard', 'express', 'overnight'],
      default: 'standard',
    },
    trackingNumber: String,

    // Payment
    paymentMethod: {
      type: String,
      enum: ['stripe', 'paypal', 'bank-transfer'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    stripePaymentId: String,

    // Order Status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    statusHistory: [
      {
        status: String,
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        note: String,
      },
    ],

    // Timestamps
    deliveryDate: Date,
    returnDeadline: Date,
  },
  { timestamps: true }
);

// Generate unique order number before saving
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
