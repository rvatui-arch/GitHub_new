/**
 * Comment Model
 */

const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text:   { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

const commentSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    text:    { type: String, required: true, trim: true, maxlength: 500 },
    replies: [replySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
