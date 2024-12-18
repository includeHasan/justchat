const mongoose = require('mongoose');

const AdminLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: [
      'USER_CREATED', 
      'USER_UPDATED', 
      'USER_DELETED', 
      'USER_BLOCKED', 
      'USER_UNBLOCKED',
      'DATA_IMPORTED',
      'DATA_EXPORTED'
    ],
    required: true
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('AdminLog', AdminLogSchema);
