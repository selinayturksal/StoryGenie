const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { body, validationResult } = require('express-validator');
const User    = require('../models/User');
const Story   = require('../models/Story');
const { protect, signToken } = require('../middleware/auth');

const router = express.Router();

// ── Multer avatar upload ──
const uploadDir = path.join(__dirname, '../public/uploads/avatars');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar_${req.user._id}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext) ? cb(null, true) : cb(new Error('Sadece JPG, PNG veya WEBP yukleyebilirsiniz.'));
  },
});

// ── Validasyon kuralları ──
const registerValidation = [
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be between 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscore'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/\d/).withMessage('Password must contain at least one number'),
];

const loginValidation = [
  body('identifier').notEmpty().withMessage('Email or username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// POST /api/auth/register
router.post('/register', registerValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { username, email, password, preferredLanguage } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) return res.status(409).json({ error: 'Email already in use.' });
      return res.status(409).json({ error: 'Username already taken.' });
    }
    const user  = await User.create({ username, email, password, preferredLanguage: preferredLanguage || 'tr' });
    const token = signToken(user._id);
    res.status(201).json({ message: 'Registration successful!', token, user: user.toPublicJSON() });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', loginValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { identifier, password } = req.body;
    const isEmail = /^\S+@\S+\.\S+$/.test(identifier);
    const query   = isEmail ? { email: identifier.toLowerCase() } : { username: identifier };
    const user    = await User.findOne(query).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials.' });
    const token = signToken(user._id);
    res.json({ message: 'Login successful!', token, user: user.toPublicJSON() });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const Story = require('../models/Story');
    const publicStories = await Story.countDocuments({ author: req.user._id, isPublic: true });
    const userData = req.user.toPublicJSON();
    userData.stats = { ...userData.stats, publicStories };
    res.json({ user: userData });
  } catch (err) {
    res.json({ user: req.user.toPublicJSON() });
  }
});

// PUT /api/auth/profile
router.put('/profile', protect, [
  body('username').optional().trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
  body('preferredLanguage').optional().isIn(['tr', 'en']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const updates = {};
    if (req.body.username)          updates.username          = req.body.username;
    if (req.body.preferredLanguage) updates.preferredLanguage = req.body.preferredLanguage;
    if (req.body.avatar)            updates.avatar            = req.body.avatar;
    if (req.body.avatarBg)          updates.avatarBg          = req.body.avatarBg;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ user: user.toPublicJSON() });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Username already taken.' });
    res.status(500).json({ error: 'Server error updating profile.' });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { currentPassword, newPassword } = req.body;
    const user    = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect.' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Server error changing password.' });
  }
});

// PUT /api/auth/avatar — emoji avatar
router.put('/avatar', protect, async (req, res) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { avatar }, { new: true });
    res.json({ user: user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ error: 'Avatar guncellenemedi.' });
  }
});

// POST /api/auth/avatar-upload — fotograf yukle
router.post('/avatar-upload', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Dosya bulunamadi.' });
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true });
    res.json({ user: user.toPublicJSON(), avatarUrl });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Avatar yuklenemedi.' });
  }
});

// DELETE /api/auth/account — hesabi sil
router.delete('/account', protect, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Sifre gerekli.' });
    const user    = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Sifre yanlis.' });
    await Story.deleteMany({ author: req.user._id });
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Hesap silindi.' });
  } catch (err) {
    res.status(500).json({ error: 'Hesap silinemedi.' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
], async (req, res) => {
  res.json({ message: 'If that email is registered, a reset link has been sent.' });
});

// POST /api/auth/logout
router.post('/logout', protect, (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

module.exports = router;