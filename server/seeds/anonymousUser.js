const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('../models/User');

// Anonim kullanıcının sabit ObjectId'si — tüm sistemde bu ID kullanılır
const ANON_ID = new mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa');

// Uygulama başlangıcında bir kez çalışır; kayıt zaten varsa dokunmaz
async function seedAnonymousUser() {
  try {
    const exists = await User.findById(ANON_ID);
    if (exists) return;

    // Login imkânsız olsun diye rastgele hash
    const fakeHash = await bcrypt.hash(
      Math.random().toString(36) + Date.now().toString(36),
      10
    );

    await User.collection.insertOne({
      _id:             ANON_ID,
      username:        'anonymous_user',
      email:           'anonymous@masalmatik.internal',
      password:        fakeHash,
      avatar:          '👤',
      avatarBg:        '#555555',
      preferredLanguage: 'tr',
      isSystemAccount: true,
      stats: { totalStories: 0, totalRatings: 0, averageRating: 0 },
      notifications: {
        notifyOnLike:    false,
        notifyOnComment: false,
        notifyOnFollow:  false,
        notifyMarketing: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ Anonim kullanıcı oluşturuldu (ID: aaaaaaaaaaaaaaaaaaaaaaaa)');
  } catch (err) {
    console.error('❌ Anonim kullanıcı seed hatası:', err.message);
  }
}

module.exports = { seedAnonymousUser, ANON_ID };
