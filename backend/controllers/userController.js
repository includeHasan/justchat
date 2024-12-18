const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Get user profile
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  
  res.json({
    success: true,
    data: user
  });
});

// Update user profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, email, mobileNo } = req.body;
  
  const user = await User.findById(req.user.id);
  
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        message: 'Email already in use'
      });
    }
  }
  
  if (mobileNo && mobileNo !== user.mobileNo) {
    const mobileExists = await User.findOne({ mobileNo });
    if (mobileExists) {
      return res.status(400).json({
        message: 'Mobile number already in use'
      });
    }
  }
  
  user.name = name || user.name;
  user.email = email || user.email;
  user.mobileNo = mobileNo || user.mobileNo;
  
  await user.save();
  
  res.json({
    success: true,
    data: user
  });
});

// Change password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  const user = await User.findById(req.user.id);
  
  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({
      message: 'Current password is incorrect'
    });
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  res.json({
    success: true,
    message: 'Password updated successfully'
  });
});

// Delete account
exports.deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user.id);
  
  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
});
