const express  = require('express');
const { body, validationResult } = require('express-validator');
const User     = require('../models/User');
const Story    = require('../models/Story');
const { protect } = require('../middleware/auth');
const { sendAccountDeletedMail } = require('../services/mailService');
const { ANON_ID } = require('../seeds/anonymousUser');

const router = express.Router();

// GET /api/users/preferences — mevcut bildirim tercihlerini döner
router.get('/preferences', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    res.json({ notifications: user.notifications });
  } catch (err) {
    console.error('GET /preferences hatası:', err);
    res.status(500).json({ error: 'Tercihler alınamadı.' });
  }
});

// PUT /api/users/preferences — bildirim tercihlerini güncelle
router.put('/preferences', protect, [
  body('notifyOnLike').optional().isBoolean(),
  body('notifyOnComment').optional().isBoolean(),
  body('notifyOnFollow').optional().isBoolean(),
  body('notifyMarketing').optional().isBoolean(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const allowed = ['notifyOnLike', 'notifyOnComment', 'notifyOnFollow', 'notifyMarketing'];
    const updates = {};
    allowed.forEach(key => {
      if (typeof req.body[key] === 'boolean') {
        updates[`notifications.${key}`] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    );
    res.json({ notifications: user.notifications });
  } catch (err) {
    console.error('PUT /preferences hatası:', err);
    res.status(500).json({ error: 'Tercihler güncellenemedi.' });
  }
});

// DELETE /api/users/me — hesabı sil (iki aşamalı onay sonrası çağrılır)
router.delete('/me', protect, [
  body('password').notEmpty().withMessage('Şifre zorunludur.'),
  body('storyAction').isIn(['delete', 'anonymize']).withMessage('Geçersiz hikaye işlemi.'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { password, storyAction } = req.body;
    const userId = req.user._id;

    // Şifre doğrula
    const user = await User.findById(userId).select('+password');
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Şifre hatalı.' });

    // Mail silmeden ÖNCE gönderilir — email bilgisi hâlâ erişilebilir
    sendAccountDeletedMail(user.email, user.username, storyAction);

    if (storyAction === 'anonymize') {
      // Herkese açık hikayeleri anonim kullanıcıya devret
      await Story.updateMany(
        { author: userId, isPublic: true },
        { $set: { author: ANON_ID, isAnonymized: true, originalAuthorDeleted: true } }
      );
      // Gizli hikayeleri sil
      await Story.deleteMany({ author: userId, isPublic: false });
    } else {
      // Tüm hikayeleri sil
      await Story.deleteMany({ author: userId });
    }

    // Kullanıcının diğer hikayelerdeki beğeni/puan kayıtlarını temizle
    await Story.updateMany(
      { 'communityRatings.user': userId },
      { $pull: { communityRatings: { user: userId } } }
    );

    // Kullanıcı kaydını sil
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Hesap başarıyla silindi.' });
  } catch (err) {
    console.error('DELETE /users/me hatası:', err);
    res.status(500).json({ error: 'Hesap silinemedi.' });
  }
});

// GET /api/users/me/public-story-count — modal aşama 1 için (public hikaye var mı?)
router.get('/me/public-story-count', protect, async (req, res) => {
  try {
    const count = await Story.countDocuments({ author: req.user._id, isPublic: true });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Hikaye sayısı alınamadı.' });
  }
});

module.exports = router;
