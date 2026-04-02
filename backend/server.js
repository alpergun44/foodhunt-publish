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
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", "https://accounts.google.com", "https://appleid.cdn-apple.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://accounts.google.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://places.googleapis.com", "https://www.google-analytics.com", "https://accounts.google.com", "https://appleid.apple.com"],
      fontSrc: ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      workerSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      frameSrc: ["'self'", "https://accounts.google.com", "https://appleid.apple.com"],
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
    description: 'Gamified yemek karar motoru API\'sı',
    base_url: '/api',
    endpoints: {
      public: {
        'GET /api/health': 'Sunucu sağlık kontrolü',
        'GET /api/areas': 'Bölge listesi (restoran sayılarıyla)',
        'GET /api/cuisines?area=': 'Mutfak listesi (opsiyonel bölge filtresi)',
        'GET /api/catalog?area=&cuisine=&limit=16': 'Turnuva için karıştırılmış restoran listesi',
        'GET /api/restaurants/:id': 'Restoran detayı',
        'GET /api/inspiration': 'Rastgele ilham kartı',
        'POST /api/events': 'Analitik olay kaydı',
        'GET /api/stats/social': 'Sosyal kanıt (turnuva sayısı)',
        'GET /api/nearby?lat=&lng=&radius=2000&limit=16': 'Konum bazlı restoran keşfet',
        'GET /api/nearby/areas?lat=&lng=': 'Yakın bölgeler (mesafeye göre)',
        'POST /api/nearby/save': 'Google Places restoranı yerel DB\'ye kaydet',
      },
      auth: {
        'POST /api/auth/register': 'Kullanıcı kaydı { email, password, name }',
        'POST /api/auth/login': 'Kullanıcı girişi { email, password }',
        'GET /api/auth/me': 'Profil bilgisi (JWT gerekli)',
        'PATCH /api/auth/me/preferences': 'Tercih güncelleme (JWT gerekli)',
        'POST /api/auth/admin/login': 'Admin girişi { password }',
      },
      user: {
        'GET /api/user/favorites': 'Favori restoranlar (JWT gerekli)',
        'POST /api/user/favorites': 'Favoriye ekle { restaurant_id }',
        'DELETE /api/user/favorites/:id': 'Favoriden çıkar',
        'GET /api/user/history': 'Turnuva geçmişi',
        'POST /api/user/history': 'Turnuva sonucu kaydet',
        'GET /api/user/recommend?area=': 'Hızlı öneri',
      },
      admin: {
        'GET /api/admin/stats': 'Dashboard istatistikleri',
        'GET /api/admin/restaurants': 'Tüm restoranlar',
        'POST /api/admin/restaurants': 'Restoran ekle',
        'PUT /api/admin/restaurants/:id': 'Restoran güncelle',
        'DELETE /api/admin/restaurants/:id': 'Restoran sil (soft)',
        'POST /api/admin/restaurants/bulk': 'Toplu import',
        'POST /api/admin/upload': 'Görsel yükle (multipart)',
        'GET /api/admin/events/export?format=json|csv': 'Olay dışa aktarım',
        'GET /api/admin/restaurants/export?format=json|csv': 'Restoran dışa aktarım',
        'GET /api/admin/cards': 'İlham kartları',
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
  res.status(404).json({ error: { message: 'Endpoint bulunamadı', code: 'NOT_FOUND' } });
});

// ─── Serve Frontend (built dist) ────────────────────────────────────────────
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(FRONTEND_DIR)) {
  // Hashed assets (JS/CSS) — long cache, immutable
  app.use('/assets', express.static(path.join(FRONTEND_DIR, 'assets'), {
    maxAge: '30d',
    immutable: true,
    fallthrough: false, // 404 if asset not found (don't fall to SPA)
  }));
  // Other static files (favicon, manifest, icons) — short cache
  app.use(express.static(FRONTEND_DIR, { maxAge: '1h' }));
  // SPA fallback: any non-API, non-asset route serves index.html (no cache)
  app.get('*', (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
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
    { text: 'Hafif bir şeyler yemek istiyorum', emoji: '🥗', category: 'mood' },
    { text: 'Bugün kendimi şımartacağım', emoji: '🍕', category: 'mood' },
    { text: 'Hızlı ve pratik olsun', emoji: '⚡', category: 'speed' },
    { text: 'Protein ağırlıklı bir öğün', emoji: '💪', category: 'nutrition' },
    { text: 'Farklı bir mutfak denemek istiyorum', emoji: '🌍', category: 'adventure' },
    { text: 'Arkadaşlarla paylaşılabilir bir şey', emoji: '🤝', category: 'social' },
    { text: 'Tatlı bir şeyler canım istiyor', emoji: '🍰', category: 'mood' },
    { text: 'Bütçe dostu bir seçenek', emoji: '💰', category: 'budget' },
  ];
  let nextId = Date.now();
  for (const c of defaults) await dbHelpers.insert('cards', { ...c, id: ++nextId });
  logger.info('Inspiration cards seeded', { count: defaults.length });
}

// ─── Seed Restaurants on Startup ────────────────────────────────────────────
async function seedRestaurants() {
  const { dbHelpers } = require('./models/db');
  const existingCount = await dbHelpers.count('restaurants');
  if (existingCount >= 50) {
    logger.info('Restaurants already seeded', { count: existingCount });
    return;
  }

  logger.info('Seeding restaurants...');
  try {
    const { TUZLA_RESTAURANTS } = require('./seed-tuzla');
    const seedData = require('./seed.v2.data.json');
    const allRestaurants = [...seedData, ...TUZLA_RESTAURANTS];

    let id = Date.now();
    let imported = 0;
    for (const r of allRestaurants) {
      const existing = await dbHelpers.findOne('restaurants', { name: r.name, area: r.area });
      if (existing) continue;
      await dbHelpers.insert('restaurants', {
        ...r, id: ++id, is_active: 1,
        yemeksepeti_link: r.yemeksepeti_link || '',
        getir_link: r.getir_link || '',
        trendyol_link: r.trendyol_link || '',
        image_url: r.image_url || '',
        created_at: new Date().toISOString(),
      });
      imported++;
    }
    logger.info('Restaurants seeded', { imported, total: await dbHelpers.count('restaurants') });
  } catch (err) {
    // Fallback: run seed inline with data from seed.v2.js arrays
    logger.warn('JSON seed not found, using inline seed', { error: err.message });
    const seedModule = require('./seed-tuzla');
    let id = Date.now();
    let imported = 0;
    for (const r of (seedModule.TUZLA_RESTAURANTS || [])) {
      const existing = await dbHelpers.findOne('restaurants', { name: r.name, area: r.area });
      if (existing) continue;
      await dbHelpers.insert('restaurants', {
        ...r, id: ++id, is_active: 1,
        yemeksepeti_link: r.yemeksepeti_link || '',
        getir_link: r.getir_link || '',
        trendyol_link: r.trendyol_link || '',
        image_url: r.image_url || '',
        created_at: new Date().toISOString(),
      });
      imported++;
    }
    logger.info('Tuzla restaurants seeded (fallback)', { imported });
  }
}

// ─── Seed Regions on Startup ────────────────────────────────────────────────
async function seedRegions() {
  const { dbHelpers } = require('./models/db');
  const existingCount = await dbHelpers.count('regions');
  if (existingCount > 0) {
    logger.info('Regions already seeded', { count: existingCount });
    return;
  }

  logger.info('Seeding regions...');
  try {
    const { REGIONS } = require('./seed-regions');
    let id = Date.now();
    let seeded = 0;
    for (const r of REGIONS) {
      for (const ilce of r.ilceler) {
        const doc = {
          id: ++id,
          il: r.il,
          ilce: ilce.name,
          lat: ilce.lat,
          lng: ilce.lng,
          is_active: ilce.is_active,
          mahalleler: ilce.mahalleler,
          created_at: new Date().toISOString()
        };
        await dbHelpers.insert('regions', doc);
        seeded++;
      }
    }
    logger.info('Regions seeded', { seeded });
  } catch (err) {
    logger.warn('Failed to seed regions', { error: err.message });
  }
}

// ─── Start ───────────────────────────────────────────────────────────────────
async function start() {
  try {
    await initDB();
    await seedCards();
    await seedRestaurants();
    await seedRegions();
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
