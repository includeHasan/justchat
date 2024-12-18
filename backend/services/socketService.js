const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');

class SocketService {
  constructor(io) {
    this.io = io;
    this.onlineUsers = new Map(); // Store online users
  }

  // Initialize socket connections
  init(socket) {
    // Authenticate user
    socket.on('authenticate', async (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
          return socket.emit('authentication_error', 'Invalid user');
        }

        // Store user's socket connection
        this.onlineUsers.set(user._id.toString(), socket.id);
        socket.user = user;

        socket.emit('authenticated', { userId: user._id });
      } catch (error) {
        socket.emit('authentication_error', 'Authentication failed');
      }
    });

    // Handle private messaging
    socket.on('private_message', async (messageData) => {
      try {
        // Validate sender and receiver
        if (!socket.user) {
          return socket.emit('message_error', 'Unauthorized');
        }

        const { receiver, message, type, fileUrl } = messageData;

        // Create chat message
        const chatMessage = new Chat({
          sender: socket.user._id,
          receiver,
          message: message || '',
          type,
          fileUrl: fileUrl || null
        });

        await chatMessage.save();

        // Find receiver's socket
        const receiverSocketId = this.onlineUsers.get(receiver.toString());
        
        if (receiverSocketId) {
          // Send message to receiver if online
          this.io.to(receiverSocketId).emit('new_message', {
            ...chatMessage.toObject(),
            sender: socket.user._id
          });
        }

        // Acknowledge message sent to sender
        socket.emit('message_sent', chatMessage);
      } catch (error) {
        socket.emit('message_error', error.message);
      }
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
      if (socket.user) {
        this.onlineUsers.delete(socket.user._id.toString());
      }
    });
  }

  // Get online status of users
  getUsersOnlineStatus(userIds) {
    return userIds.map(userId => ({
      userId,
      online: this.onlineUsers.has(userId.toString())
    }));
  }
}

module.exports = SocketService;