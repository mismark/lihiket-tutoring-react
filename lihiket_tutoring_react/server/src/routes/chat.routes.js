const express = require('express');
const router  = express.Router();
const {
  getConversations,
  getMessages,
  startConversation,
  sendMessage,
  deleteMessage,
  deleteConversation,
  unreadCount,
  getChatableUsers,
} = require('../controllers/chat.controller');
const { protect }         = require('../middleware/auth.middleware');
const { requireVerified } = require('../middleware/verified.middleware');

const auth = [protect, requireVerified];

// Users available to chat with
router.get('/users',                              auth, getChatableUsers);

// Unread badge count
router.get('/unread-count',                       auth, unreadCount);

// Conversation list + start new
router.get('/',                                   auth, getConversations);
router.post('/',                                  auth, startConversation);

// Messages inside a conversation
router.get('/:conversationId/messages',           auth, getMessages);
router.post('/:conversationId/messages',          auth, sendMessage);

// Delete
router.delete('/messages/:messageId',             auth, deleteMessage);
router.delete('/:conversationId',                 auth, deleteConversation);

module.exports = router;
