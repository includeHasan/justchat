const User = require('../models/User');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const rateLimit = require('express-rate-limit');
const { validatePassword } = require('../utils/validation');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email }, 
    process.env.JWT_SECRET, 
    { expiresIn: '30d' }
  );
};

// Add login rate limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 5 attempts
  message: { message: 'Too many login attempts. Please try again later.' }
});

// Configure Passport Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        
        if (!user) {
          // Generate a secure random password
          const securePassword = require('crypto').randomBytes(32).toString('hex');
          
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            mobileNo: '0000000000',
            password: securePassword
          });
          
          await user.save();
        }
        
        return done(null, user);
      } catch (error) {
        console.error('Google OAuth Error:', error);
        return done(error, false, { message: 'Error during Google authentication' });
      }
    }
  ));
} else {
  console.warn('Google OAuth credentials not found in environment variables. Google authentication will not be available.');
}

// Signup Controller
exports.signup = async (req, res) => {
  try {
    const { name, email, mobileNo, password } = req.body;

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ 
      $or: [{ email }, { mobileNo }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email or mobile number' 
      });
    }

    // Create new user
    const user = new User({ name, email, mobileNo, password });
    await user.save();

    // Generate token and set cookie
    const token = generateToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role,
        mobileNo: user.mobileNo
      }
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ 
      message: 'Server error during registration'
    });
  }
};

// Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ message: 'User account is blocked' });
    }

    // Generate token and set cookie
    const token = generateToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      success: true,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role,
        mobileNo: user.mobileNo
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login'
    });
  }
};

// Add logout controller
exports.logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).json({ message: 'Logged out successfully' });
};
