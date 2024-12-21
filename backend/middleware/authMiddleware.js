const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Protect routes - verify JWT token
const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }
});

// Authorize roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    
    next();
  };
};

// Check if user is blocked
const checkBlocked = asyncHandler(async (req, res, next) => {
  if (req.user.isBlocked) {
    return res.status(403).json({ message: 'Your account has been blocked' });
  }
  next();
});

// Export all middleware functions
module.exports = {
  protect,
  authorizeRoles,
  checkBlocked
};
