const express = require('express');
const router = express.Router();
const { protect, checkBlocked } = require('../middleware/authMiddleware');
const {
  getChats,
  createChat,
  getMessages,
  sendMessage,
  deleteChat
} = require('../controllers/chatController');

// Apply middleware to all chat routes
router.use(protect);
router.use(checkBlocked);

// Chat routes
router.get('/', getChats);
router.post('/', createChat);
router.get('/:chatId/messages', getMessages);
router.post('/:chatId/messages', sendMessage);
router.delete('/:chatId', deleteChat);

module.exports = router;