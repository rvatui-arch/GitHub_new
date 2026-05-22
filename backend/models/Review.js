/**
 * Review Model
 * Stores product and seller reviews
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Review Content
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    title: String,
    content: {
      type: String,
      required: [true, 'Review content is required'],
    },

    // Rating Breakdown
    ratingBreakdown: {
      quality: Number,
      accuracy: Number,
      communication: Number,
      shipping: Number,
    },

    // Images
    images: [
      {
        url: String,
        publicId: String,
      },
    ],

    // Helpfulness
    helpful: {
      type: Number,
      default: 0,
    },
    unhelpful: {
      type: Number,
      default: 0,
    },

    // Status
    isVerifiedPurchase: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['published', 'pending', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Index for query optimization
reviewSchema.index({ product: 1, rating: 1 });
reviewSchema.index({ author: 1 });
reviewSchema.index({ seller: 1 });

module.exports = mongoose.model('Review', reviewSchema);
