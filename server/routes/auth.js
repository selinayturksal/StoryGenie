const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, signToken } = require('../middleware/auth');

const router = express.Router();

// ─── Validasyon kuralları ─────────────────────────────────────────────────────
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscore'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
];

const loginValidation = [
  body('identifier').notEmpty().withMessage('Email or username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', registerValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, email, password, preferredLanguage } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({ error: 'Email already in use.' });
      }
      return res.status(409).json({ error: 'Username already taken.' });
    }

    const user = await User.create({
      username,
      email,
      password,
      preferredLanguage: preferredLanguage || 'tr',
    });

    const token = signToken(user._id);

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: user.toPublicJSON(),
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
// Accepts email OR username in the `identifier` field
router.post('/login', loginValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { identifier, password } = req.body;

    // Decide whether identifier looks like an email or a username
    const isEmail = /^\S+@\S+\.\S+$/.test(identifier);
    const query   = isEmail ? { email: identifier.toLowerCase() } : { username: identifier };

    const user = await User.findOne(query).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = signToken(user._id);

    res.json({
      message: 'Login successful!',
      token,
      user: user.toPublicJSON(),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
});

// ─── PUT /api/auth/profile ────────────────────────────────────────────────────
router.put('/profile', protect, [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/),
  body('preferredLanguage').optional().isIn(['tr', 'en']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updates = {};
    if (req.body.username) updates.username = req.body.username;
    if (req.body.preferredLanguage) updates.preferredLanguage = req.body.preferredLanguage;
    if (req.body.avatar) updates.avatar = req.body.avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ user: user.toPublicJSON() });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Username already taken.' });
    }
    res.status(500).json({ error: 'Server error updating profile.' });
  }
});

// ─── PUT /api/auth/change-password ───────────────────────────────────────────
router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Server error changing password.' });
  }
});

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────
// Stub — always returns 200 to prevent email enumeration.
// Wire up a real email service (SendGrid, Resend, etc.) here.
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
], async (req, res) => {
  // Always respond with 200 regardless of whether the email exists
  res.json({ message: 'If that email is registered, a reset link has been sent.' });
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', protect, (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

module.exports = router;
