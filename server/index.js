const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes  = require('./routes/auth');
const storyRoutes = require('./routes/stories');
const aiRoutes    = require('./routes/ai');
const userRoutes      = require('./routes/users');
const favoritesRoutes = require('./routes/favorites');
const contactRoutes   = require('./routes/contact');
const { seedAnonymousUser } = require('./seeds/anonymousUser');

const app = express();

app.set('trust proxy', 1);

// ─── Ara Katman (Middleware) ──────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting - tüm API istekleri için
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', apiLimiter);

// AI endpoint için daha sıkı limit (Bedrock API maliyeti)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 20,
  message: { error: 'Story generation limit reached. Please try again in an hour.' },
});
app.use('/api/ai/', aiLimiter);

// ─── Rotalar ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/contact',  contactRoutes);

// Sağlık kontrolü
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// 404 - Bulunamadı işleyicisi
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global hata işleyicisi
app.use((err, req, res, next) => {
  console.error('Global Error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// ─── MongoDB Bağlantısı ve Sunucu Başlatma ────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    await seedAnonymousUser();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
