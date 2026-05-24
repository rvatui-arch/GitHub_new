/**
 * ProductReview Model — star rating + optional text on a product
 * One review per user per product (unique index).
 * Deleted automatically when the product is marked sold.
 */
const mongoose = require('mongoose');

const productReviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    text:    { type: String, trim: true, maxlength: 1000, default: '' },
  },
  { timestamps: true }
);

productReviewSchema.index({ product: 1, author: 1 }, { unique: true });

module.exports = mongoose.model('ProductReview', productReviewSchema);
