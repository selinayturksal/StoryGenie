const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Story = require('../models/Story');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/stories/my ─────────────────────────────────────────────────────
// Kullanıcının kendi hikayeleri (Geçmiş Hikayeler sayfası)
router.get('/my', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [stories, total] = await Promise.all([
      Story.find({ author: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-pages -fullText'), // Liste için kısa göster
      Story.countDocuments({ author: req.user._id }),
    ]);

    res.json({
      stories,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching your stories.' });
  }
});

// ─── GET /api/stories/today ──────────────────────────────────────────────────
// Bugün oluşturulan hikaye (varsa)
router.get('/today', protect, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const story = await Story.findOne({
      author: req.user._id,
      createdAt: { $gte: startOfDay },
    }).sort({ createdAt: -1 });

    res.json({ story: story || null });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching today\'s story.' });
  }
});

// ─── GET /api/stories/explore ────────────────────────────────────────────────
// Herkese açık hikayeler (Önerilen Hikayeler sayfası)
router.get('/explore', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const language = req.query.language; // 'tr' veya 'en' filtresi
    const ageGroup = req.query.ageGroup; // çocuk yaş filtresi

    const filter = { isPublic: true };
    if (language) filter['options.storyLanguage'] = language;
    if (ageGroup) filter['options.childAge'] = parseInt(ageGroup);

    const [stories, total] = await Promise.all([
      Story.find(filter)
        .sort({ communityAverageRating: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'username avatar')
        .select('-pages -fullText'),
      Story.countDocuments(filter),
    ]);

    res.json({
      stories,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching stories.' });
  }
});

// ─── GET /api/stories/dashboard ──────────────────────────────────────────────
// Admin dashboard verileri (grafik için)
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Son 7 günün istatistikleri
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      const count = await Story.countDocuments({
        author: userId,
        createdAt: { $gte: d, $lt: nextD },
      });

      last7Days.push({
        date: d.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' }),
        count,
      });
    }

    // Dil dağılımı
    const languageDist = await Story.aggregate([
      { $match: { author: userId } },
      { $group: { _id: '$options.storyLanguage', count: { $sum: 1 } } },
    ]);

    // Yaş dağılımı
    const ageDist = await Story.aggregate([
      { $match: { author: userId } },
      { $group: { _id: '$options.childAge', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Süre dağılımı
    const durationDist = await Story.aggregate([
      { $match: { author: userId } },
      { $group: { _id: '$options.duration', count: { $sum: 1 } } },
    ]);

    // Özet istatistikler
    const totalStories = await Story.countDocuments({ author: userId });
    const publicStories = await Story.countDocuments({ author: userId, isPublic: true });
    const ratedStories = await Story.find({ author: userId, rating: { $ne: null } });
    const avgRating =
      ratedStories.length > 0
        ? (ratedStories.reduce((a, s) => a + s.rating, 0) / ratedStories.length).toFixed(1)
        : 0;

    res.json({
      summary: { totalStories, publicStories, avgRating },
      charts: {
        storiesPerDay: last7Days,
        languageDistribution: languageDist,
        ageDistribution: ageDist,
        durationDistribution: durationDist,
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Error fetching dashboard data.' });
  }
});

// ─── GET /api/stories/:id ─────────────────────────────────────────────────────
// Tek hikayeyi getir (tüm sayfalariyla)
router.get('/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).populate('author', 'username avatar');
    if (!story) return res.status(404).json({ error: 'Story not found.' });

    // Özel hikayeyse sadece sahibi görebilir
    if (!story.isPublic) {
      // Token varsa kontrol et
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(403).json({ error: 'This story is private.' });
    }

    // View sayısını artır
    story.viewCount += 1;
    await story.save();

    res.json({ story });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching story.' });
  }
});

// ─── POST /api/stories ────────────────────────────────────────────────────────
// Oluşturulan hikayeyi kaydet
router.post('/', protect, async (req, res) => {
  try {
    const { title, fullText, pages, options } = req.body;

    if (!title || !fullText || !options) {
      return res.status(400).json({ error: 'title, fullText and options are required.' });
    }

    const story = await Story.create({
      author: req.user._id,
      title,
      fullText,
      pages: pages || [],
      options,
      isPublic: false,
    });

    // Kullanıcı istatistiklerini güncelle
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.totalStories': 1 },
    });

    res.status(201).json({ story });
  } catch (err) {
    console.error('Save story error:', err);
    res.status(500).json({ error: 'Error saving story.' });
  }
});

// ─── PATCH /api/stories/:id/rating ───────────────────────────────────────────
// Hikayeyi puanla (kullanıcının kendi hikayesi)
router.patch('/:id/rating', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1-5'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const story = await Story.findOne({ _id: req.params.id, author: req.user._id });
    if (!story) return res.status(404).json({ error: 'Story not found.' });

    story.rating = req.body.rating;
    await story.save();

    // Kullanıcı istatistiklerini güncelle
    const userStories = await Story.find({ author: req.user._id, rating: { $ne: null } });
    const avg = userStories.reduce((a, s) => a + s.rating, 0) / userStories.length;
    await User.findByIdAndUpdate(req.user._id, {
      'stats.totalRatings': userStories.length,
      'stats.averageRating': Math.round(avg * 10) / 10,
    });

    res.json({ story });
  } catch (err) {
    res.status(500).json({ error: 'Error rating story.' });
  }
});

// ─── PATCH /api/stories/:id/publish ──────────────────────────────────────────
// Hikayeyi herkese aç veya kapat
router.patch('/:id/publish', protect, async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.id, author: req.user._id });
    if (!story) return res.status(404).json({ error: 'Story not found.' });

    story.isPublic = req.body.isPublic ?? !story.isPublic;
    await story.save();

    res.json({ story, message: story.isPublic ? 'Story is now public.' : 'Story is now private.' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating story visibility.' });
  }
});

// ─── POST /api/stories/:id/community-rating ───────────────────────────────────
// Başka birinin hikayesini puanla
router.post('/:id/community-rating', protect, [
  body('rating').isInt({ min: 1, max: 5 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const story = await Story.findById(req.params.id);
    if (!story || !story.isPublic) return res.status(404).json({ error: 'Story not found.' });

    // Kendi hikayesini puanlayamasın
    if (story.author.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'You cannot rate your own story.' });
    }

    // Daha önce puanladıysa güncelle
    const existingIndex = story.communityRatings.findIndex(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (existingIndex > -1) {
      story.communityRatings[existingIndex].rating = req.body.rating;
    } else {
      story.communityRatings.push({ user: req.user._id, rating: req.body.rating });
    }

    story.recalculateCommunityRating();
    await story.save();

    res.json({ communityAverageRating: story.communityAverageRating });
  } catch (err) {
    res.status(500).json({ error: 'Error rating story.' });
  }
});

// ─── DELETE /api/stories/:id ──────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const story = await Story.findOneAndDelete({ _id: req.params.id, author: req.user._id });
    if (!story) return res.status(404).json({ error: 'Story not found.' });

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.totalStories': -1 },
    });

    res.json({ message: 'Story deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting story.' });
  }
});

module.exports = router;
