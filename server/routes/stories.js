const express  = require('express');
const mongoose = require('mongoose');
const jwt      = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Story = require('../models/Story');
const User  = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendStoryLikedMail } = require('../services/mailService');

const router = express.Router();

function toStr(val) {
  if (!val) return '';
  if (typeof val === 'object') return val.tr || val.en || '';
  return String(val);
}

function normalizeOptions(options = {}) {
  let chars = options.characters || [];
  if (typeof chars === 'string') { try { chars = JSON.parse(chars); } catch (_) { chars = []; } }
  if (!Array.isArray(chars)) chars = [];

  let loc = options.location || {};
  if (typeof loc === 'string') { try { loc = JSON.parse(loc); } catch (_) { loc = {}; } }

  return {
    characters: chars.map(c => ({
      id:        String(c.id        || ''),
      name:      toStr(c.name),
      type:      String(c.type      || 'human'),
      imagePath: String(c.imagePath || ''),
      emoji:     String(c.emoji     || ''),
    })),
    location: {
      id:        String(loc.id        || ''),
      name:      toStr(loc.name),
      imagePath: String(loc.imagePath || ''),
    },
    childAge:      Number(options.childAge)     || 5,
    duration:      ['short','medium','long'].includes(options.duration) ? options.duration : 'medium',
    storyLanguage: ['tr','en'].includes(options.storyLanguage) ? options.storyLanguage : 'tr',
    customPrompt:  String(options.customPrompt  || '').slice(0, 500),
  };
}

// GET /api/stories/my
router.get('/my', protect, async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [stories, total] = await Promise.all([
      Story.find({ author: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-pages -fullText'),
      Story.countDocuments({ author: req.user._id }),
    ]);

    res.json({ stories, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error('GET /my error:', err);
    res.status(500).json({ error: 'Hikayeler alınamadı.' });
  }
});

// GET /api/stories/today
router.get('/today', protect, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const story = await Story.findOne({ author: req.user._id, createdAt: { $gte: startOfDay } }).sort({ createdAt: -1 });
    res.json({ story: story || null });
  } catch (err) {
    res.status(500).json({ error: 'Bugünün hikayesi alınamadı.' });
  }
});

// GET /api/stories/explore
router.get('/explore', async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 12);
    const skip  = (page - 1) * limit;
    const filter = { isPublic: true };
    if (req.query.language) filter['options.storyLanguage'] = req.query.language;
    if (req.query.ageGroup) filter['options.childAge'] = parseInt(req.query.ageGroup);

    const [stories, total] = await Promise.all([
      Story.find(filter)
        .sort({ communityAverageRating: -1, createdAt: -1 })
        .skip(skip).limit(limit)
        .populate('author', 'username avatar avatarBg')
        .select('-pages -fullText'),
      Story.countDocuments(filter),
    ]);

    // Kullanıcı giriş yapmışsa hangi hikayeleri beğendiğini ekle
    let userId = null;
    try {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        userId = decoded.id;
      }
    } catch (_) {}

    const storiesWithLike = stories.map(s => {
      const obj = s.toObject();
      obj.likeCount = s.communityRatings?.length || 0;
      obj.isLikedByMe = userId
        ? s.communityRatings?.some(r => r.user.toString() === userId.toString())
        : false;
      return obj;
    });

    res.json({ stories: storiesWithLike, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: 'Hikayeler alınamadı.' });
  }
});

// GET /api/stories/dashboard
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userIdObj = new mongoose.Types.ObjectId(String(req.user._id));

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      const nd = new Date(d); nd.setDate(nd.getDate() + 1);
      const count = await Story.countDocuments({ author: userIdObj, createdAt: { $gte: d, $lt: nd } });
      last7Days.push({ date: d.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' }), count });
    }

    const match = { $match: { author: userIdObj } };

    const [
      totalStories, publicStories,
      languageDist, ageDist, durationDist,
      topCharacters, topLocations,
    ] = await Promise.all([
      Story.countDocuments({ author: userIdObj }),
      Story.countDocuments({ author: userIdObj, isPublic: true }),
      Story.aggregate([match, { $group: { _id: '$options.storyLanguage', count: { $sum: 1 } } }]),
      Story.aggregate([match, { $group: { _id: '$options.childAge', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Story.aggregate([match, { $group: { _id: '$options.duration', count: { $sum: 1 } } }]),
      Story.aggregate([
        match,
        { $unwind: '$options.characters' },
        { $group: { _id: { name: '$options.characters.name', type: '$options.characters.type', imagePath: '$options.characters.imagePath' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Story.aggregate([
        match,
        { $match: { 'options.location.name': { $exists: true, $ne: '' } } },
        { $group: { _id: { name: '$options.location.name', imagePath: '$options.location.imagePath' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const topHumans  = topCharacters.filter(c => c._id.type !== 'animal').slice(0, 5);
    const topAnimals = topCharacters.filter(c => c._id.type === 'animal').slice(0, 5);

    res.json({
      summary: { totalStories, publicStories },
      charts: {
        storiesPerDay:        last7Days,
        languageDistribution: languageDist,
        ageDistribution:      ageDist,
        durationDistribution: durationDist,
        topHumans,
        topAnimals,
        topLocations,
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Dashboard verisi alınamadı.' });
  }
});

// GET /api/stories/:id
router.get('/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).populate('author', 'username avatar avatarBg');
    if (!story) return res.status(404).json({ error: 'Hikaye bulunamadı.' });
    if (!story.isPublic) {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(403).json({ error: 'Bu hikaye gizli.' });
    }
    story.viewCount += 1;
    await story.save();
    res.json({ story });
  } catch (err) {
    res.status(500).json({ error: 'Hikaye alınamadı.' });
  }
});

// POST /api/stories
router.post('/', protect, async (req, res) => {
  try {
    const { title, fullText, pages } = req.body;
    const options = req.body.options || {};

    if (!title || !fullText) {
      return res.status(400).json({ error: 'title ve fullText zorunludur.' });
    }

    const normalizedOpts = normalizeOptions(options);

    const story = await Story.create({
      author:   req.user._id,
      title:    String(title).trim().slice(0, 200),
      fullText: String(fullText),
      pages:    Array.isArray(pages) ? pages : [],
      options:  normalizedOpts,
      isPublic: false,
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.totalStories': 1 } });

    res.status(201).json({ story });
  } catch (err) {
    console.error('POST /stories error:', JSON.stringify(err.errors || err.message, null, 2));
    const msg = err.name === 'ValidationError'
      ? Object.values(err.errors).map(e => e.message).join(', ')
      : 'Hikaye kaydedilemedi.';
    res.status(500).json({ error: msg });
  }
});

// PATCH /api/stories/:id/rating
router.patch('/:id/rating', protect, [
  body('rating').isInt({ min: 1, max: 5 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const story = await Story.findOne({ _id: req.params.id, author: req.user._id });
    if (!story) return res.status(404).json({ error: 'Hikaye bulunamadı.' });
    story.rating = req.body.rating;
    await story.save();
    const userStories = await Story.find({ author: req.user._id, rating: { $ne: null } });
    const avg = userStories.reduce((a, s) => a + s.rating, 0) / userStories.length;
    await User.findByIdAndUpdate(req.user._id, { 'stats.totalRatings': userStories.length, 'stats.averageRating': Math.round(avg * 10) / 10 });
    res.json({ story });
  } catch (err) {
    res.status(500).json({ error: 'Puan verilemedi.' });
  }
});

// PATCH /api/stories/:id/publish
router.patch('/:id/publish', protect, async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.id, author: req.user._id });
    if (!story) return res.status(404).json({ error: 'Hikaye bulunamadı.' });
    story.isPublic = req.body.isPublic ?? !story.isPublic;
    await story.save();
    res.json({ story, message: story.isPublic ? 'Hikaye herkese açık.' : 'Hikaye gizlendi.' });
  } catch (err) {
    res.status(500).json({ error: 'Hikaye güncellenemedi.' });
  }
});

// POST /api/stories/:id/like
router.post('/:id/like', protect, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story || !story.isPublic) return res.status(404).json({ error: 'Hikaye bulunamadı.' });
    if (story.isAnonymized) return res.status(403).json({ error: 'Anonim hikayeler beğenilemez.' });

    const userId      = req.user._id.toString();
    const ownerId     = story.author.toString();
    const alreadyLiked = story.communityRatings.some(r => r.user.toString() === userId);

    if (!alreadyLiked) {
      story.communityRatings.push({ user: req.user._id, rating: 5 });
      story.recalculateCommunityRating();
      await story.save();

      // Hikaye sahibi kendisini beğenemez; bildirim tercihi kontrol edilir
      if (ownerId !== userId) {
        const owner = await User.findById(ownerId).select('email username notifications');
        if (owner?.notifications?.notifyOnLike) {
          sendStoryLikedMail({
            ownerEmail:    owner.email,
            ownerUsername: owner.username,
            storyTitle:    story.title,
            storyId:       story._id,
            likerName:     req.user.username,
          });
        }
      }
    }

    res.json({
      liked: true,
      likeCount: story.communityRatings.length,
    });
  } catch (err) {
    res.status(500).json({ error: 'Beğeni kaydedilemedi.' });
  }
});

// POST /api/stories/:id/community-rating
router.post('/:id/community-rating', protect, [
  body('rating').isInt({ min: 1, max: 5 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const story = await Story.findById(req.params.id);
    if (!story || !story.isPublic) return res.status(404).json({ error: 'Hikaye bulunamadı.' });
    if (story.author.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Kendi hikayeni puanlayamazsın.' });
    }
    const idx = story.communityRatings.findIndex(r => r.user.toString() === req.user._id.toString());
    if (idx > -1) { story.communityRatings[idx].rating = req.body.rating; }
    else { story.communityRatings.push({ user: req.user._id, rating: req.body.rating }); }
    story.recalculateCommunityRating();
    await story.save();
    res.json({ communityAverageRating: story.communityAverageRating });
  } catch (err) {
    res.status(500).json({ error: 'Puan verilemedi.' });
  }
});

// DELETE /api/stories/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const story = await Story.findOneAndDelete({ _id: req.params.id, author: req.user._id });
    if (!story) return res.status(404).json({ error: 'Hikaye bulunamadı.' });
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.totalStories': -1 } });
    res.json({ message: 'Hikaye silindi.' });
  } catch (err) {
    res.status(500).json({ error: 'Hikaye silinemedi.' });
  }
});

module.exports = router;