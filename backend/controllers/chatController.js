const Chat = require('../models/Chat');
const Message = require('../models/Message');
const asyncHandler = require('../utils/asyncHandler');

// Get all chats for a user
exports.getChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ participants: req.user.id })
    .populate('participants', 'name email')
    .sort('-updatedAt');

  res.json({
    success: true,
    data: chats
  });
});

// Create a new chat
exports.createChat = asyncHandler(async (req, res) => {
  const { participantId } = req.body;

  // Check if chat already exists
  let chat = await Chat.findOne({
    participants: { $all: [req.user.id, participantId] }
  });

  if (chat) {
    return res.json({
      success: true,
      data: chat
    });
  }

  // Create new chat
  chat = await Chat.create({
    participants: [req.user.id, participantId]
  });

  res.status(201).json({
    success: true,
    data: chat
  });
});

// Get messages for a chat
exports.getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const messages = await Message.find({ chat: chatId })
    .populate('sender', 'name')
    .sort('-createdAt');

  res.json({
    success: true,
    data: messages
  });
});

// Send a message
exports.sendMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { content } = req.body;

  const message = await Message.create({
    chat: chatId,
    sender: req.user.id,
    content
  });

  // Update chat's lastMessage
  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: message._id
  });

  res.status(201).json({
    success: true,
    data: message
  });
});

// Delete a chat
exports.deleteChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  // Delete all messages in the chat
  await Message.deleteMany({ chat: chatId });
  
  // Delete the chat
  await Chat.findByIdAndDelete(chatId);

  res.json({
    success: true,
    message: 'Chat deleted successfully'
  });
});