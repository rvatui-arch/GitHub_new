/**
 * Socket.IO Real-Time Chat Handler
 */

const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const logger = require('../utils/logger');

// Store active connections
const activeUsers = new Map();

/**
 * Initialize socket.io handlers
 */
const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`);

    /**
     * User joins chat
     */
    socket.on('user-join', (userId) => {
      activeUsers.set(userId, socket.id);
      socket.join(`user-${userId}`);
      logger.info(`User ${userId} joined chat room`);
    });

    /**
     * Send message event
     */
    socket.on('send-message', async (data) => {
      try {
        const { conversationId, receiverId, content } = data;

        // Save message to database
        const message = await Message.create({
          conversation: conversationId,
          sender: data.senderId,
          receiver: receiverId,
          content,
        });

        // Update conversation
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          lastMessageTime: new Date(),
        });

        const populatedMessage = await message.populate(
          'sender',
          'firstName lastName avatar'
        );

        // Emit message to receiver
        const receiverSocketId = activeUsers.get(receiverId.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive-message', {
            message: populatedMessage,
            conversationId,
          });
        }

        // Confirm to sender
        socket.emit('message-sent', { message: populatedMessage });

        logger.info(`Message sent in conversation: ${conversationId}`);
      } catch (error) {
        logger.error('Send message error:', error);
        socket.emit('message-error', { message: 'Failed to send message' });
      }
    });

    /**
     * Mark message as read
     */
    socket.on('mark-as-read', async (data) => {
      try {
        const { messageId } = data;

        await Message.findByIdAndUpdate(messageId, {
          isRead: true,
          readAt: new Date(),
        });

        socket.emit('message-read-confirmation', { messageId });
        logger.debug(`Message marked as read: ${messageId}`);
      } catch (error) {
        logger.error('Mark as read error:', error);
      }
    });

    /**
     * Typing indicator
     */
    socket.on('typing', (data) => {
      const { conversationId, receiverId } = data;
      const receiverSocketId = activeUsers.get(receiverId.toString());

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user-typing', {
          conversationId,
          senderId: data.senderId,
        });
      }
    });

    /**
     * Stop typing
     */
    socket.on('stop-typing', (data) => {
      const { conversationId, receiverId } = data;
      const receiverSocketId = activeUsers.get(receiverId.toString());

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user-stop-typing', {
          conversationId,
        });
      }
    });

    /**
     * User disconnects
     */
    socket.on('disconnect', () => {
      // Remove user from active users
      activeUsers.forEach((socketId, userId) => {
        if (socketId === socket.id) {
          activeUsers.delete(userId);
          logger.info(`User ${userId} disconnected`);
        }
      });
    });

    /**
     * Error handling
     */
    socket.on('error', (error) => {
      logger.error('Socket error:', error);
    });
  });
};

module.exports = initializeSocket;
