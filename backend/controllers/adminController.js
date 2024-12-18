const User = require('../models/User');
const AdminLog = require('../models/AdminLog');
const ExportService = require('../services/exportService');
const ImportService = require('../services/importService');
const asyncHandler = require('../utils/asyncHandler');
const { userUpdateSchema } = require('../utils/validationSchemas');

// Fetch all users with pagination
exports.getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalUsers = await User.countDocuments();
  const users = await User.find()
    .select('-password')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json({
    users,
    currentPage: page,
    totalPages: Math.ceil(totalUsers / limit),
    totalUsers
  });
});

// Create a new user
exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, mobileNo, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ 
    $or: [{ email }, { mobileNo }] 
  });

  if (existingUser) {
    return res.status(400).json({ 
      message: 'User already exists with this email or mobile number' 
    });
  }

  // Create user
  const user = await User.create({
    name, 
    email, 
    mobileNo, 
    password,
    role: role || 'user',
    isVerified: true
  });

  // Log admin action
  await AdminLog.create({
    admin: req.user._id,
    action: 'USER_CREATED',
    targetUser: user._id,
    details: { 
      name: user.name, 
      email: user.email 
    },
    ipAddress: req.ip
  });

  res.status(201).json({
    message: 'User created successfully',
    user: { 
      id: user._id, 
      name: user.name, 
      email: user.email 
    }
  });
});

// Update user details
exports.updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate input
  const { error } = userUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation Error', 
      errors: error.details.map(err => err.message) 
    });
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Update user fields
  const updateFields = {};
  if (req.body.name) updateFields.name = req.body.name;
  if (req.body.email) updateFields.email = req.body.email;
  if (req.body.mobileNo) updateFields.mobileNo = req.body.mobileNo;
  if (req.body.role) updateFields.role = req.body.role;

  const updatedUser = await User.findByIdAndUpdate(
    id, 
    updateFields, 
    { new: true, runValidators: true }
  ).select('-password');

  // Log admin action
  await AdminLog.create({
    admin: req.user._id,
    action: 'USER_UPDATED',
    targetUser: user._id,
    details: updateFields,
    ipAddress: req.ip
  });

  res.json({
    message: 'User updated successfully',
    user: updatedUser
  });
});

// Delete a user
exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  await User.findByIdAndDelete(id);

  // Log admin action
  await AdminLog.create({
    admin: req.user._id,
    action: 'USER_DELETED',
    targetUser: user._id,
    details: { 
      name: user.name, 
      email: user.email 
    },
    ipAddress: req.ip
  });

  res.json({ message: 'User deleted successfully' });
});

// Block/Unblock user
exports.toggleUserBlock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { block } = req.body;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.isBlocked = block;
  await user.save();

  // Log admin action
  await AdminLog.create({
    admin: req.user._id,
    action: block ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
    targetUser: user._id,
    details: { 
      name: user.name, 
      email: user.email 
    },
    ipAddress: req.ip
  });

  res.json({ 
    message: block ? 'User blocked successfully' : 'User unblocked successfully',
    user: { 
      id: user._id, 
      isBlocked: user.isBlocked 
    }
  });
});

// Export user data
exports.exportUserData = asyncHandler(async (req, res) => {
  const users = await User.find().select('name email mobileNo');
  
  const exportPath = await ExportService.exportToExcel(users);

  // Log admin action
  await AdminLog.create({
    admin: req.user._id,
    action: 'DATA_EXPORTED',
    details: { 
      userCount: users.length,
      exportPath 
    },
    ipAddress: req.ip
  });

  res.json({ 
    message: 'User data exported successfully', 
    filePath: exportPath 
  });
});

// Import user data
exports.importUserData = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const importResult = await ImportService.importFromExcel(req.file.buffer);

  // Log admin action
  await AdminLog.create({
    admin: req.user._id,
    action: 'DATA_IMPORTED',
    details: { 
      totalUsers: importResult.totalUsers,
      newUsers: importResult.newUsers,
      updatedUsers: importResult.updatedUsers
    },
    ipAddress: req.ip
  });

  res.json({
    message: 'User data imported successfully',
    ...importResult
  });
});
