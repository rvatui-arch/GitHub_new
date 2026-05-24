/**
 * SellerReview Model — star rating + optional text on a seller profile.
 * One review per user per seller (unique index).
 * NEVER deleted, even when the reviewed product is sold.
 * The seller can reply (embedded replies array).
 */
const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text:   { type: String, trim: true, maxlength: 500, required: true },
  },
  { timestamps: true }
);

const sellerReviewSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text:   { type: String, trim: true, maxlength: 1000, default: '' },
    replies: [replySchema],
  },
  { timestamps: true }
);

sellerReviewSchema.index({ seller: 1, author: 1 }, { unique: true });

module.exports = mongoose.model('SellerReview', sellerReviewSchema);
