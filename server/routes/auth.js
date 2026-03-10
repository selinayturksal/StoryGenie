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
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', registerValidation, async (req, res) => {
  // Validasyon hatalarını kontrol et
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, email, password, preferredLanguage } = req.body;

    // Email veya username zaten kullanılıyor mu?
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
router.post('/login', loginValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Şifreyi de getir (model'de select:false var)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
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

// ─── GET /api/auth/me (Token doğrulama / profil bilgisi) ──────────────────────
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
});

// ─── PUT /api/auth/profile (Profil güncelleme) ────────────────────────────────
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

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
// JWT stateless olduğu için client tarafında token silinir.
// İstersen bir blacklist mekanizması eklenebilir - şimdilik basit tutuyoruz.
router.post('/logout', protect, (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

module.exports = router;
