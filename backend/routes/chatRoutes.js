/**
 * Chat Routes
 */

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');

// Protected routes
router.post('/conversations', authenticateToken, chatController.getOrCreateConversation);
router.get('/conversations', authenticateToken, chatController.getMyConversations);
router.get('/conversations/:conversationId/messages', authenticateToken, chatController.getMessages);
router.post('/conversations/:conversationId/messages', authenticateToken, chatController.sendMessage);
router.get('/unread-count', authenticateToken, chatController.getUnreadCount);

module.exports = router;
