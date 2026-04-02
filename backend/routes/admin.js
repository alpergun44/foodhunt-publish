/**
 * FoodHunt — Admin API Routes
 * All routes require admin auth
 */
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { asyncHandler, ValidationError } = require('../utils/errors');
const { requireAdmin } = require('../middleware/auth');
const { sanitizeRestaurant, safeStr } = require('../utils/validation');
const { dbHelpers } = require('../models/db');
const logger = require('../utils/logger');

const router = express.Router();
router.use(requireAdmin);

// Upload setup
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const upload = multer({
  dest: UPLOADS_DIR,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    cb(null, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype));
  },
});

let _nextId = Date.now();
function nextId() {
  const id = ++_nextId;
  const now = Date.now();
  if (now > _nextId) _nextId = now;
  return id;
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
router.get('/stats', asyncHandler(async (_req, res) => {
  const [allR, allE, userCount] = await Promise.all([
    dbHelpers.find('restaurants'),
    dbHelpers.find('events'),
    dbHelpers.count('users'),
  ]);

  const active = allR.filter(r => r.is_active === 1).length;
  const today = new Date().toISOString().slice(0, 10);
  const todayEvents = allE.filter(e => e.created_at?.startsWith(today)).length;
  const completions = allE.filter(e => e.event_type === 'game_complete').length;
  const deeplinks = allE.filter(e => e.event_type === 'deeplink_click').length;

  // Cuisine breakdown
  const cm = {};
  for (const r of allR) if (r.cuisine) cm[r.cuisine] = (cm[r.cuisine] || 0) + 1;
  const topCuisines = Object.entries(cm)
    .map(([cuisine, n]) => ({ cuisine, n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 10);

  // Area breakdown
  const am = {};
  for (const r of allR) if (r.area) am[r.area] = (am[r.area] || 0) + 1;
  const topAreas = Object.entries(am)
    .map(([area, n]) => ({ area, n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 10);

  // Daily event trends (last 30 days)
  const dailyTrend = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    dailyTrend[d] = 0;
  }
  for (const e of allE) {
    const d = e.created_at?.slice(0, 10);
    if (d && dailyTrend[d] !== undefined) dailyTrend[d]++;
  }

  // Winner leaderboard
  const winnerCount = {};
  for (const e of allE) {
    if (e.event_type === 'game_complete' && e.winner_id) {
      winnerCount[e.winner_id] = (winnerCount[e.winner_id] || 0) + 1;
    }
  }
  const topWinners = Object.entries(winnerCount)
    .map(([id, wins]) => ({ restaurant_id: parseInt(id), wins }))
    .sort((a, b) => b.wins - a.wins)
    .slice(0, 10);
  // Populate winner names
  for (const w of topWinners) {
    const r = allR.find(r => r.id === w.restaurant_id);
    w.name = r?.name || 'Bilinmeyen';
  }

  const recentEvents = allE
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .slice(0, 20)
    .map(e => ({
      event_type: e.event_type, created_at: e.created_at,
      area: e.area, game_type: e.game_type,
    }));

  const areaSet = new Set(allR.map(r => r.area).filter(Boolean));

  res.json({
    total: allR.length, active, areas: areaSet.size, users: userCount,
    todayEvents, totalEvents: allE.length, completions, deeplinks,
    topCuisines, topAreas, topWinners, recentEvents,
    dailyTrend: Object.entries(dailyTrend).map(([date, count]) => ({ date, count })),
  });
}));

// ─── Restaurant CRUD ─────────────────────────────────────────────────────────
router.get('/restaurants', asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
  const skip = (page - 1) * limit;

  const total = await dbHelpers.count('restaurants');
  const restaurants = await dbHelpers.find('restaurants', {}, {
    sort: { id: -1 },
    skip,
    limit,
  });

  res.json({ restaurants, total, page, limit, pages: Math.ceil(total / limit) });
}));

router.post('/restaurants', asyncHandler(async (req, res) => {
  const d = sanitizeRestaurant(req.body);
  if (!d.name) throw new ValidationError('Restoran adi gerekli', 'name');
  d.id = nextId();
  d.is_active = d.is_active ?? 1;
  d.created_at = new Date().toISOString();
  const result = await dbHelpers.insert('restaurants', d);
  logger.info('Restaurant created', { id: d.id, name: d.name });
  res.status(201).json(result);
}));

router.put('/restaurants/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) throw new ValidationError('Geçersiz ID', 'id');
  const d = sanitizeRestaurant(req.body);
  d.updated_at = new Date().toISOString();
  await dbHelpers.update('restaurants', { id }, { $set: d });
  logger.info('Restaurant updated', { id });
  res.json({ ok: true });
}));

router.delete('/restaurants/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) throw new ValidationError('Geçersiz ID', 'id');
  await dbHelpers.update('restaurants', { id }, { $set: { is_active: 0, deleted_at: new Date().toISOString() } });
  logger.info('Restaurant soft-deleted', { id });
  res.json({ ok: true });
}));

// Bulk import
router.post('/restaurants/bulk', asyncHandler(async (req, res) => {
  const { restaurants: list = [] } = req.body;
  if (!Array.isArray(list)) throw new ValidationError('restaurants bir dizi olmali');
  let imported = 0;
  for (const r of list) {
    const d = sanitizeRestaurant(r);
    if (!d.name) continue;
    d.id = nextId();
    d.is_active = 1;
    d.rating = d.rating || 4.0;
    d.price_level = d.price_level || 2;
    d.calories_min = d.calories_min || 300;
    d.calories_max = d.calories_max || 800;
    d.created_at = new Date().toISOString();
    await dbHelpers.insert('restaurants', d);
    imported++;
  }
  logger.info('Bulk import completed', { imported, total: list.length });
  res.json({ imported });
}));

// Image upload
const SAFE_EXTENSIONS = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

router.post('/upload', upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) throw new ValidationError('Dosya yuklenemedi');
  const ext = SAFE_EXTENSIONS[req.file.mimetype];
  if (!ext) throw new ValidationError('Desteklenmeyen dosya tipi: ' + req.file.mimetype);
  const nm = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
  fs.renameSync(req.file.path, path.join(UPLOADS_DIR, nm));
  res.json({ url: `/uploads/${nm}` });
}));

// ─── Cards (Inspiration) ────────────────────────────────────────────────────
router.get('/cards', asyncHandler(async (_req, res) => {
  res.json(await dbHelpers.find('cards'));
}));

router.post('/cards', asyncHandler(async (req, res) => {
  const { text, emoji, category } = req.body;
  if (!text) throw new ValidationError('Kart metni gerekli', 'text');
  const card = await dbHelpers.insert('cards', {
    text: safeStr(text, 200), emoji: safeStr(emoji, 10),
    category: safeStr(category, 50), id: nextId(),
  });
  res.status(201).json(card);
}));

router.delete('/cards/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) throw new ValidationError('Geçersiz ID', 'id');
  await dbHelpers.remove('cards', { id });
  res.json({ ok: true });
}));

// ─── Export ──────────────────────────────────────────────────────────────────
router.get('/events/export', asyncHandler(async (req, res) => {
  const format = req.query.format || 'json';
  const allEvents = await dbHelpers.find('events', {}, { sort: { created_at: -1 } });

  if (format === 'csv') {
    const headers = ['event_type', 'session_id', 'area', 'cuisine', 'game_type', 'duration_s', 'winner_id', 'created_at'];
    const csv = [headers.join(',')];
    for (const e of allEvents) {
      csv.push(headers.map(h => `"${(e[h] || '').toString().replace(/"/g, '""')}"`).join(','));
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="events.csv"');
    return res.send(csv.join('\n'));
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="events.json"');
  res.json(allEvents);
}));

router.get('/restaurants/export', asyncHandler(async (req, res) => {
  const format = req.query.format || 'json';
  const allR = await dbHelpers.find('restaurants', {}, { sort: { id: -1 } });

  if (format === 'csv') {
    const headers = ['id', 'name', 'cuisine', 'area', 'rating', 'price_level', 'is_active'];
    const csv = [headers.join(',')];
    for (const r of allR) {
      csv.push(headers.map(h => `"${(r[h] || '').toString().replace(/"/g, '""')}"`).join(','));
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="restaurants.csv"');
    return res.send(csv.join('\n'));
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="restaurants.json"');
  res.json(allR);
}));

// ─── Location-based Search (for admin panel) ────────────────────────────────
router.post('/restaurants/search-location', asyncHandler(async (req, res) => {
  const { lat, lng, query, radius = 2000 } = req.body;
  let results = [];

  // Try Google Places if coords provided
  if (lat && lng) {
    try {
      const { searchNearby } = require('../services/places');
      const nearby = await searchNearby(parseFloat(lat), parseFloat(lng), parseInt(radius), 20);
      results = nearby || [];
    } catch (e) {
      // Google API unavailable — continue with local search
    }
  }

  // Also search local DB
  if (query) {
    const local = await dbHelpers.find('restaurants', {});
    const q = query.toLowerCase();
    const matches = local.filter(r =>
      (r.name || '').toLowerCase().includes(q) ||
      (r.cuisine || '').toLowerCase().includes(q) ||
      (r.area || '').toLowerCase().includes(q) ||
      (r.address || '').toLowerCase().includes(q)
    );
    // Duplicate'leri cikar
    const existingIds = new Set(results.map(r => r.name?.toLowerCase()));
    for (const m of matches) {
      if (!existingIds.has(m.name?.toLowerCase())) results.push(m);
    }
  }

  res.json({ results, total: results.length });
}));

// ─── User Management ───────────────────────────────────────────────────────
router.get('/users', asyncHandler(async (_req, res) => {
  const users = await dbHelpers.find('users', {}, { sort: { created_at: -1 } });
  // Password hash'leri gonderme
  res.json(users.map(u => ({ ...u, password: undefined, password_hash: undefined })));
}));

router.delete('/users/:id', asyncHandler(async (req, res) => {
  const id = req.params.id;
  await dbHelpers.remove('users', { _id: id });
  logger.info('User deleted by admin', { id });
  res.json({ ok: true });
}));

// ─── Region Management (İl → İlçe → Mahalle) ──────────────────────────────────
router.get('/regions', asyncHandler(async (_req, res) => {
  const regions = await dbHelpers.find('regions', {}, { sort: { il: 1, ilce: 1 } });
  if (regions.length === 0) {
    // Fallback: seed regions if empty
    const { REGIONS } = require('../seed-regions');
    const seeded = [];
    let id = Date.now();
    for (const r of REGIONS) {
      for (const ilce of r.ilceler) {
        const doc = {
          id: ++id, il: r.il, ilce: ilce.name, lat: ilce.lat, lng: ilce.lng,
          is_active: ilce.is_active, mahalleler: ilce.mahalleler,
          created_at: new Date().toISOString()
        };
        await dbHelpers.insert('regions', doc);
        seeded.push(doc);
      }
    }
    return res.json(seeded);
  }
  res.json(regions);
}));

router.put('/regions/:ilce/toggle', asyncHandler(async (req, res) => {
  const ilce = safeStr(req.params.ilce, 100);
  const { is_active } = req.body;
  await dbHelpers.update('regions', { ilce }, {
    $set: { is_active: !!is_active, updated_at: new Date().toISOString() }
  });
  logger.info('Region toggled', { ilce, is_active });
  res.json({ ok: true });
}));

router.put('/regions/:ilce/mahalleler', asyncHandler(async (req, res) => {
  const ilce = safeStr(req.params.ilce, 100);
  const { mahalleler } = req.body;
  if (!Array.isArray(mahalleler)) throw new ValidationError('mahalleler bir dizi olmali');
  const clean = mahalleler.map(m => safeStr(m, 100)).filter(Boolean);
  await dbHelpers.update('regions', { ilce }, {
    $set: { mahalleler: clean, updated_at: new Date().toISOString() }
  });
  res.json({ ok: true });
}));

// ─── District Management (backward compatibility) ───────────────────────────────
router.get('/districts', asyncHandler(async (_req, res) => {
  const all = await dbHelpers.find('restaurants', {});
  const districtMap = {};
  for (const r of all) {
    const d = r.district || r.area || 'Bilinmeyen';
    if (!districtMap[d]) districtMap[d] = { name: d, count: 0, is_active: true };
    districtMap[d].count++;
  }
  res.json(Object.values(districtMap).sort((a, b) => b.count - a.count));
}));

router.post('/districts', asyncHandler(async (req, res) => {
  const { name, is_active = true } = req.body;
  if (!name) throw new ValidationError('Bölge adı gerekli');
  const district = {
    id: nextId(),
    name: safeStr(name, 100),
    is_active,
    created_at: new Date().toISOString(),
  };
  await dbHelpers.insert('districts', district);
  res.status(201).json(district);
}));

router.put('/districts/:name', asyncHandler(async (req, res) => {
  const { is_active } = req.body;
  const name = safeStr(req.params.name, 100);
  await dbHelpers.update('districts', { name }, {
    $set: { is_active, updated_at: new Date().toISOString() },
  });
  res.json({ ok: true });
}));

// ─── Tournament Management ─────────────────────────────────────────────────
router.get('/tournaments', asyncHandler(async (_req, res) => {
  const tournaments = await dbHelpers.find('tournaments', {}, { sort: { created_at: -1 } });
  res.json(tournaments);
}));

router.post('/tournaments', asyncHandler(async (req, res) => {
  const { title, description, slot_start, slot_end, cuisine_filter, area_filter } = req.body;
  const tournament = {
    id: nextId(),
    title: safeStr(title, 200),
    description: safeStr(description, 500),
    slot_start: safeStr(slot_start, 5),
    slot_end: safeStr(slot_end, 5),
    cuisine_filter: safeStr(cuisine_filter, 100),
    area_filter: safeStr(area_filter, 100),
    created_at: new Date().toISOString(),
  };
  await dbHelpers.insert('tournaments', tournament);
  res.status(201).json(tournament);
}));

module.exports = router;
