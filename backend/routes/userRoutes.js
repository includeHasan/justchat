const express = require('express');
const router = express.Router();
const { protect, checkBlocked } = require('../middleware/authMiddleware');
const {
  updateProfile,
  getProfile,
  changePassword,
  deleteAccount,
  getAllUsers  // Add this
} = require('../controllers/userController');

// Profile routes
router.use(protect); // Apply authentication to all user routes
router.use(checkBlocked); // Check if user is blocked

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.delete('/account', deleteAccount);
router.get('/all', getAllUsers);


module.exports = router;