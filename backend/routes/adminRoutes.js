const express = require('express');
const router = express.Router();
const multer = require('multer');
const adminController = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Multer for file upload
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  }
});

// User Management Routes
router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/users', adminController.getAllUsers);
router.post('/user', adminController.createUser);
router.put('/user/:id', adminController.updateUser);
router.delete('/user/:id', adminController.deleteUser);
router.post('/restrict/:id', adminController.toggleUserBlock);

// Data Migration Routes
router.get('/export', adminController.exportUserData);
router.post('/import', upload.single('file'), adminController.importUserData);

module.exports = router;