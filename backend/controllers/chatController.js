/**
 * Chat Controller
 * Handles conversations and messages
 */

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { sendSuccess, sendError, sendPaginatedSuccess } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Get or Create Conversation
 * POST /api/chat/conversations
 */
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return sendError(res, 400, 'Other user ID is required');
    }

    if (otherUserId === req.user._id.toString()) {
      return sendError(res, 400, 'Cannot chat with yourself');
    }

    // Find existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, otherUserId] },
    }).populate('participants', 'firstName lastName avatar');

    // Create new conversation if doesn't exist
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, otherUserId],
      });
      await conversation.populate('participants', 'firstName lastName avatar');
    }

    logger.info(`Conversation accessed: ${conversation._id}`);

    return sendSuccess(res, 200, 'Conversation retrieved', conversation);
  } catch (error) {
    logger.error('Get/create conversation error:', error);
    return sendError(res, 500, 'Failed to get conversation');
  }
};

/**
 * Get My Conversations
 * GET /api/chat/conversations
 */
exports.getMyConversations = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const conversations = await Conversation.find({
      participants: req.user._id,
      isActive: true,
    })
      .populate('participants', 'firstName lastName avatar')
      .populate('lastMessage')
      .sort({ lastMessageTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Conversation.countDocuments({
      participants: req.user._id,
      isActive: true,
    });

    return sendPaginatedSuccess(res, 200, 'Conversations fetched', conversations, {
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      perPage: parseInt(limit),
    });
  } catch (error) {
    logger.error('Get conversations error:', error);
    return sendError(res, 500, 'Failed to fetch conversations');
  }
};

/**
 * Get Messages in Conversation
 * GET /api/chat/conversations/:conversationId/messages
 */
exports.getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return sendError(res, 404, 'Conversation not found');
    }

    // Check authorization
    if (!conversation.participants.includes(req.user._id)) {
      return sendError(res, 403, 'Not authorized');
    }

    const messages = await Message.find({ conversation: req.params.conversationId })
      .populate('sender', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({
      conversation: req.params.conversationId,
    });

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: req.params.conversationId,
        receiver: req.user._id,
        isRead: false,
      },
      { isRead: true, readAt: new Date() }
    );

    return sendPaginatedSuccess(res, 200, 'Messages fetched', messages, {
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      perPage: parseInt(limit),
    });
  } catch (error) {
    logger.error('Get messages error:', error);
    return sendError(res, 500, 'Failed to fetch messages');
  }
};

/**
 * Send Message
 * POST /api/chat/conversations/:conversationId/messages
 */
exports.sendMessage = async (req, res) => {
  try {
    const { content, receiverId } = req.body;

    if (!content) {
      return sendError(res, 400, 'Message content is required');
    }

    if (!receiverId) {
      return sendError(res, 400, 'Receiver ID is required');
    }

    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return sendError(res, 404, 'Conversation not found');
    }

    if (!conversation.participants.includes(req.user._id)) {
      return sendError(res, 403, 'Not authorized');
    }

    const message = await Message.create({
      conversation: req.params.conversationId,
      sender: req.user._id,
      receiver: receiverId,
      content,
    });

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageTime = new Date();
    await conversation.save();

    const populatedMessage = await message.populate('sender', 'firstName lastName avatar');

    logger.info(`Message sent in conversation: ${conversation._id}`);

    return sendSuccess(res, 201, 'Message sent', populatedMessage);
  } catch (error) {
    logger.error('Send message error:', error);
    return sendError(res, 500, 'Failed to send message');
  }
};

/**
 * Get Unread Count
 * GET /api/chat/unread-count
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false,
    });

    return sendSuccess(res, 200, 'Unread count fetched', { unreadCount });
  } catch (error) {
    logger.error('Get unread count error:', error);
    return sendError(res, 500, 'Failed to fetch unread count');
  }
};
