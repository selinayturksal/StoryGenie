const mongoose = require('mongoose');

// Tek bir hikaye sayfası
const pageSchema = new mongoose.Schema({
  pageNumber: { type: Number, required: true },
  content: { type: String, required: true },
});

// Kullanıcının hikaye için yaptığı seçimler
const storyOptionsSchema = new mongoose.Schema({
  characters: [
    {
      id: String,        // örn: "human_1"
      name: String,      // örn: "Prenses Elif"
      type: String,      // "human" | "animal"
      imagePath: String, // "/assets/characters/human_1.png"
    },
  ],
  location: {
    id: String,          // örn: "location_forest"
    name: String,        // örn: "Büyülü Orman"
    imagePath: String,
  },
  childAge: {
    type: Number,
    min: 2,
    max: 12,
    required: true,
  },
  duration: {
    type: String,
    enum: ['short', 'medium', 'long'], // ~2dk / ~5dk / ~10dk
    required: true,
  },
  storyLanguage: {
    type: String,
    enum: ['tr', 'en'],
    required: true,
  },
  customPrompt: {
    type: String,
    default: '',
    maxlength: 500,
  },
});

const storySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    // Hikaye ya tek metin ya da sayfalara bölünmüş olabilir
    fullText: {
      type: String,
      required: true,
    },
    pages: [pageSchema],

    options: storyOptionsSchema,

    // Sosyal özellikler
    isPublic: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    // Diğer kullanıcıların puanları (önerilen hikayeler sayfası için)
    communityRatings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
      },
    ],
    communityAverageRating: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Community average rating'i otomatik hesapla
storySchema.methods.recalculateCommunityRating = function () {
  if (this.communityRatings.length === 0) {
    this.communityAverageRating = 0;
    return;
  }
  const sum = this.communityRatings.reduce((acc, r) => acc + r.rating, 0);
  this.communityAverageRating = Math.round((sum / this.communityRatings.length) * 10) / 10;
};

// Index'ler - hızlı sorgular için
storySchema.index({ author: 1, createdAt: -1 });
storySchema.index({ isPublic: 1, communityAverageRating: -1 });
storySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Story', storySchema);
