/**
 * FoodHunt Backend — v2.3 (Refactored & Production-Ready)
 * Modular architecture with MongoDB support, JWT auth, structured logging
 *
 * Changes from v2.1:
 * - Modular route/middleware/model structure
 * - MongoDB + NeDB dual database support (DB_TYPE env)
 * - JWT-based user authentication system
 * - Structured JSON logging with file output
 * - Custom error classes with consistent error responses
 * - asyncHandler eliminating try/catch boilerplate
 * - User favorites & tournament history
 * - Enhanced admin dashboard with trends & leaderboards
 * - CSV export support
 * - Social proof endpoint
 */
const express = require('express');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const helmet = require('helmet');
const { initDB } = require('./models/db');
const { createCorsMiddleware } = require('./middleware/cors');
const { rateLimit, optionalAuth } = require('./middleware/auth');
const { errorHandler } = require('./utils/errors');
const logger = require('./utils/logger');

// Routes
const publicRoutes = require('./routes/public');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const nearbyRoutes = require('./routes/nearby');

const app = express();
const PORT = process.env.PORT || 3001;

// Admin token (legacy)
let ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
if (!ADMIN_TOKEN) ADMIN_TOKEN = crypto.randomBytes(32).toString('hex');
global.__ADMIN_TOKEN = ADMIN_TOKEN;

// ─── Production Security ─────────────────────────────────────────────────────
app.set('trust proxy', 1); // Trust Railway's reverse proxy
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    const proto = req.headers['x-forwarded-proto'];
    if (proto && proto !== 'https') {
      return res.redirect(301, `https://${req.headers.host || req.hostname}${req.url}`);
    }
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });
}

// ─── Global Middleware ───────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://places.googleapis.com", "https://www.google-analytics.com"],
      fontSrc: ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
}));
app.use(createCorsMiddleware());
app.use(express.json({ limit: '2mb' }));
app.use(logger.requestMiddleware);
app.use(rateLimit(300, 60000));
app.use(optionalAuth);

// Static uploads
const UPLOADS_DIR = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOADS_DIR));

// ─── API Documentation ──────────────────────────────────────────────────────
app.get('/api/docs', (_req, res) => {
  res.json({
    name: 'FoodHunt API',
    version: '2.3.0',
    description: 'Gamified yemek karar motoru API',
    base_url: '/api',
    endpoints: {
      public: {
        'GET /api/health': 'Sunucu saglik kontrolu',
        'GET /api/areas': 'Bolge listesi (restoran sayilariyla)',
        'GET /api/cuisines?area=': 'Mutfak listesi (opsiyonel bolge filtresi)',
        'GET /api/catalog?area=&cuisine=&limit=16': 'Turnuva icin karistirilmis restoran listesi',
        'GET /api/restaurants/:id': 'Restoran detayi',
        'GET /api/inspiration': 'Rastgele ilham karti',
        'POST /api/events': 'Analitik olay kaydi',
        'GET /api/stats/social': 'Sosyal kanit (turnuva sayisi)',
        'GET /api/nearby?lat=&lng=&radius=2000&limit=16': 'Konum bazli restoran kesfet',
        'GET /api/nearby/areas?lat=&lng=': 'Yakin bolgeler (mesafeye gore)',
        'POST /api/nearby/save': 'Google Places restorani yerel DB ye kaydet',
      },
      auth: {
        'POST /api/auth/register': 'Kullanici kaydi { email, password, name }',
        'POST /api/auth/login': 'Kullanici girisi { email, password }',
        'GET /api/auth/me': 'Profil bilgisi (JWT gerekli)',
        'PATCH /api/auth/me/preferences': 'Tercih guncelleme (JWT gerekli)',
        'POST /api/auth/admin/login': 'Admin girisi { password }',
      },
      user: {
        'GET /api/user/favorites': 'Favori restoranlar (JWT gerekli)',
        'POST /api/user/favorites': 'Favoriye ekle { restaurant_id }',
        'DELETE /api/user/favorites/:id': 'Favoriden cikar',
        'GET /api/user/history': 'Turnuva gecmisi',
        'POST /api/user/history': 'Turnuva sonucu kaydet',
        'GET /api/user/recommend?area=': 'Hizli oneri',
      },
      admin: {
        'GET /api/admin/stats': 'Dashboard istatistikleri',
        'GET /api/admin/restaurants': 'Tum restoranlar',
        'POST /api/admin/restaurants': 'Restoran ekle',
        'PUT /api/admin/restaurants/:id': 'Restoran guncelle',
        'DELETE /api/admin/restaurants/:id': 'Restoran sil (soft)',
        'POST /api/admin/restaurants/bulk': 'Toplu import',
        'POST /api/admin/upload': 'Gorsel yukle (multipart)',
        'GET /api/admin/events/export?format=json|csv': 'Olay disa aktarim',
        'GET /api/admin/restaurants/export?format=json|csv': 'Restoran disa aktarim',
        'GET /api/admin/cards': 'Ilham kartlari',
        'POST /api/admin/cards': 'Kart ekle',
        'DELETE /api/admin/cards/:id': 'Kart sil',
      },
    },
    authentication: {
      user: 'Authorization: Bearer <jwt_token>',
      admin: 'Authorization: Bearer <admin_token>',
    },
  });
});

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api', nearbyRoutes);       // /api/nearby/*
app.use('/api/admin', adminRoutes);

// ─── 404 catch-all for undefined API routes ─────────────────────────────────
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: { message: 'Endpoint bulunamadi', code: 'NOT_FOUND' } });
});

// ─── Serve Frontend (built dist) ────────────────────────────────────────────
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(FRONTEND_DIR)) {
  app.use(express.static(FRONTEND_DIR, { maxAge: '7d' }));
  // SPA fallback: any non-API route serves index.html
  app.get('*', (_req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
  });
  logger.info('Serving frontend from', { dir: FRONTEND_DIR });
}

// ─── Error Handler (must be last) ───────────────────────────────────────────
app.use(errorHandler);

// ─── Seed Default Cards ─────────────────────────────────────────────────────
async function seedCards() {
  const { dbHelpers } = require('./models/db');
  if (await dbHelpers.count('cards') > 0) return;
  const defaults = [
    { text: 'Hafif bir seyler yemek istiyorum', emoji: '🥗', category: 'mood' },
    { text: 'Bugun kendimi simartacagim', emoji: '🍕', category: 'mood' },
    { text: 'Hizli ve pratik olsun', emoji: '⚡', category: 'speed' },
    { text: 'Protein agirlikli bir ogun', emoji: '💪', category: 'nutrition' },
    { text: 'Farkli bir mutfak denemek istiyorum', emoji: '🌍', category: 'adventure' },
    { text: 'Arkadaslarla paylasilabilir bir sey', emoji: '🤝', category: 'social' },
    { text: 'Tatli bir seyler canim istiyor', emoji: '🍰', category: 'mood' },
    { text: 'Butce dostu bir secenek', emoji: '💰', category: 'budget' },
  ];
  let nextId = Date.now();
  for (const c of defaults) await dbHelpers.insert('cards', { ...c, id: ++nextId });
  logger.info('Inspiration cards seeded', { count: defaults.length });
}

// ─── Start ───────────────────────────────────────────────────────────────────
async function start() {
  try {
    await initDB();
    await seedCards();
    app.listen(PORT, () => {
      logger.info(`FoodHunt API v2.3 running`, { port: PORT, db_type: process.env.DB_TYPE || 'nedb' });
      console.log(`[FoodHunt] API running on http://localhost:${PORT}`);
      console.log(`[FoodHunt] API docs: http://localhost:${PORT}/api/docs`);
    });
  } catch (err) {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down...');
  const { closeDB } = require('./models/db');
  await closeDB();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down...');
  const { closeDB } = require('./models/db');
  await closeDB();
  process.exit(0);
});

start();

module.exports = app; // for testing
