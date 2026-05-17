const express = require('express');
const User    = require('../models/User');
const Story   = require('../models/Story');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/favorites/:storyId — favorilere ekle
router.post('/:storyId', protect, async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId);
    if (!story || !story.isPublic) {
      return res.status(404).json({ error: 'Hikaye bulunamadı.' });
    }

    const user = await User.findById(req.user._id);
    const alreadySaved = user.favorites.some(id => id.toString() === req.params.storyId);
    if (alreadySaved) {
      return res.status(409).json({ error: 'Hikaye zaten favorilerde.' });
    }

    user.favorites.push(story._id);
    await user.save();

    res.json({ message: 'Favorilere eklendi.', favoriteCount: user.favorites.length });
  } catch (err) {
    console.error('POST /favorites/:storyId hatası:', err);
    res.status(500).json({ error: 'Favorilere eklenemedi.' });
  }
});

// DELETE /api/favorites/:storyId — favorilerden çıkar
router.delete('/:storyId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const before = user.favorites.length;
    user.favorites = user.favorites.filter(id => id.toString() !== req.params.storyId);

    if (user.favorites.length === before) {
      return res.status(404).json({ error: 'Hikaye favorilerde bulunamadı.' });
    }

    await user.save();
    res.json({ message: 'Favorilerden çıkarıldı.', favoriteCount: user.favorites.length });
  } catch (err) {
    console.error('DELETE /favorites/:storyId hatası:', err);
    res.status(500).json({ error: 'Favorilerden çıkarılamadı.' });
  }
});

// GET /api/favorites — kullanıcının favori hikayelerini sayfalanmış döner
router.get('/', protect, async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 12);
    const skip  = (page - 1) * limit;

    const user = await User.findById(req.user._id).select('favorites');
    const total = user.favorites.length;

    // favorites dizisi eklenme sırasına göre — en son eklenen önce
    const storyIds = [...user.favorites].reverse().slice(skip, skip + limit);

    const stories = await Story.find({ _id: { $in: storyIds }, isPublic: true })
      .populate('author', 'username avatar avatarBg')
      .select('-pages -fullText');

    // favorites sırasını koru (Story.find sırayı garantilemez)
    const ordered = storyIds
      .map(id => stories.find(s => s._id.toString() === id.toString()))
      .filter(Boolean);

    res.json({
      stories: ordered,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('GET /favorites hatası:', err);
    res.status(500).json({ error: 'Favoriler alınamadı.' });
  }
});

module.exports = router;
