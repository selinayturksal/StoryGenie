const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  pageNumber: { type: Number, required: true },
  content:    { type: String, required: true },
});

const storyOptionsSchema = new mongoose.Schema({
  characters: [
    {
      id:        { type: String, default: '' },
      name:      { type: String, default: '' },
      type:      { type: String, default: 'human' },
      imagePath: { type: String, default: '' },
      emoji:     { type: String, default: '' },
    },
  ],
  location: {
    id:        { type: String, default: '' },
    name:      { type: String, default: '' },
    imagePath: { type: String, default: '' },
  },
  childAge: {
    type: Number,
    min: 1,
    max: 18,
    default: 5,
  },
  duration: {
    type: String,
    enum: ['short', 'medium', 'long'],
    default: 'medium',
  },
  storyLanguage: {
    type: String,
    enum: ['tr', 'en'],
    default: 'tr',
  },
  customPrompt: {
    type: String,
    default: '',
    maxlength: 500,
  },
}, { _id: false });

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
    fullText: {
      type: String,
      required: true,
    },
    pages: [pageSchema],
    options: { type: storyOptionsSchema, default: () => ({}) },
    isPublic: { type: Boolean, default: false },
    rating: { type: Number, min: 1, max: 5, default: null },
    communityRatings: [
      {
        user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
      },
    ],
    communityAverageRating: { type: Number, default: 0 },
    viewCount:              { type: Number, default: 0 },
    // Hesap silme — yazar anonim kullanıcıya aktarıldığında işaretlenir
    isAnonymized:          { type: Boolean, default: false },
    originalAuthorDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

storySchema.methods.recalculateCommunityRating = function () {
  if (this.communityRatings.length === 0) { this.communityAverageRating = 0; return; }
  const sum = this.communityRatings.reduce((acc, r) => acc + r.rating, 0);
  this.communityAverageRating = Math.round((sum / this.communityRatings.length) * 10) / 10;
};

storySchema.index({ author: 1, createdAt: -1 });
storySchema.index({ isPublic: 1, communityAverageRating: -1 });
storySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Story', storySchema);