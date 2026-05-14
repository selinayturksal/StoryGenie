const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Default olarak password dönmez
    },
    avatar: {
      type: String,
      default: '',
    },
    avatarBg: {
      type: String,
      default: '#0a0f3c',
    },
    preferredLanguage: {
      type: String,
      enum: ['tr', 'en'],
      default: 'tr',
    },
    // Dashboard istatistikleri için
    stats: {
      totalStories: { type: Number, default: 0 },
      totalRatings: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Kayıt öncesi şifreyi hashle
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Güvenli kullanıcı objesi (şifresiz)
userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    avatar: this.avatar,
    avatarBg: this.avatarBg,
    preferredLanguage: this.preferredLanguage,
    stats: this.stats,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);