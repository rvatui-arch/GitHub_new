/**
 * Notification Model
 * Stores user notifications
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'order',
        'message',
        'review',
        'follow',
        'payment',
        'shipment',
        'system',
      ],
      required: true,
    },
    title: String,
    content: String,
    relatedId: mongoose.Schema.Types.ObjectId,
    relatedModel: String,

    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,

    action: String,
    actionUrl: String,
  },
  { timestamps: true }
);

// Index for query optimization
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
