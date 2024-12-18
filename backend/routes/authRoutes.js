const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const passport = require('passport');

router.post('/signup', signup);
router.post('/login', login);

// Google OAuth Routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '30d' }
    );
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/oauth/callback?token=${token}`);
  }
);

module.exports = router;