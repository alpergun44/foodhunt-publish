/**
 * FoodHunt — Public API Routes
 * No auth required
 */
const express = require('express');
const { asyncHandler } = require('../utils/errors');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { safeStr, shuffle } = require('../utils/validation');
const { dbHelpers } = require('../models/db');
const { checkTournamentLimit, rateLimit } = require('../middleware/auth');

const router = express.Router();

// ─── Meal Type Filtering ──────────────────────────────────────────────────────
const MEAL_TYPE_FILTERS = {
  protein: { cuisines: ['Kebap', 'Izgara', 'Steak', 'Et'], tags: ['protein', 'et', 'kebap', 'izgara'] },
  cheat: { cuisines: ['Burger', 'Pizza', 'Fast Food', 'Döner'], tags: ['burger', 'pizza', 'fast-food', 'cheat'] },
  healthy: { cuisines: ['Salata', 'Vejetaryen', 'Vegan', 'Sağlıklı'], tags: ['salata', 'sağlıklı', 'vegan', 'vejetaryen', 'diyet'] },
  quick: { cuisines: ['Fast Food', 'Tost', 'Döner', 'Lahmacun'], tags: ['hızlı', 'atıştırmalık', 'fast-food'] },
  dessert: { cuisines: ['Pastane', 'Tatlıcı', 'Kafe', 'Dondurma'], tags: ['tatlı', 'dessert', 'pasta', 'dondurma'] },
  breakfast: { cuisines: ['Kahvaltı', 'Kafe', 'Börek'], tags: ['kahvaltı', 'breakfast', 'börek'] },
  seafood: { cuisines: ['Balık', 'Deniz Ürünleri'], tags: ['balık', 'deniz', 'seafood'] },
};

// Active regions for public use
router.get('/regions', asyncHandler(async (_req, res) => {
  const regions = await dbHelpers.find('regions', { is_active: true });
  res.json(regions.map(r => ({
    il: r.il, ilce: r.ilce, mahalleler: r.mahalleler || [],
    lat: r.lat, lng: r.lng
  })));
}));

// Health check
router.get('/health', asyncHandler(async (_req, res) => {
  const [rCount, eCount, uCount] = await Promise.all([
    dbHelpers.count('restaurants'),
    dbHelpers.count('events'),
    dbHelpers.count('users'),
  ]);
  res.json({
    status: 'ok',
    version: '2.5.0',
    uptime: Math.floor(process.uptime()),
    restaurants: rCount,
    events: eCount,
    users: uCount,
    timestamp: new Date().toISOString(),
  });
}));

// List areas with restaurant counts
router.get('/areas', asyncHandler(async (_req, res) => {
  const all = await dbHelpers.find('restaurants', { is_active: 1 });
  const activeRegions = await dbHelpers.find('regions', { is_active: true });
  // Build a set of allowed area names: ilce names + all their mahalleler
  let allowedAreas = null;
  if (activeRegions.length > 0) {
    allowedAreas = new Set();
    for (const reg of activeRegions) {
      allowedAreas.add(reg.ilce);
      if (reg.mahalleler && Array.isArray(reg.mahalleler)) {
        for (const m of reg.mahalleler) allowedAreas.add(m);
      }
    }
  }
  const m = {};
  for (const r of all) if (r.area && (!allowedAreas || allowedAreas.has(r.area))) m[r.area] = (m[r.area] || 0) + 1;
  res.json(
    Object.entries(m)
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count)
  );
}));

// List cuisines (optionally filtered by area)
router.get('/cuisines', asyncHandler(async (req, res) => {
  const q = { is_active: 1 };
  if (req.query.area) q.area = safeStr(req.query.area, 100);
  const all = await dbHelpers.find('restaurants', q);
  const m = {};
  for (const r of all) if (r.cuisine) m[r.cuisine] = (m[r.cuisine] || 0) + 1;
  res.json(
    Object.entries(m)
      .map(([cuisine, count]) => ({ cuisine, count }))
      .sort((a, b) => b.count - a.count)
  );
}));

// Catalog — shuffled restaurants for tournament
router.get('/catalog', asyncHandler(async (req, res) => {
  const { area, cuisine, limit = 16, price_min, price_max, meal_type } = req.query;
  const q = { is_active: 1 };
  if (area) q.area = safeStr(area, 100);
  if (cuisine) q.cuisine = safeStr(cuisine, 100);
  if (price_min) {
    const v = Math.max(1, Math.min(4, parseInt(price_min) || 1));
    q.price_level = { ...q.price_level, $gte: v };
  }
  if (price_max) {
    const v = Math.max(1, Math.min(4, parseInt(price_max) || 4));
    q.price_level = { ...q.price_level, $lte: v };
  }

  // If no area filter specified, only show restaurants from active regions
  if (!area) {
    const activeRegions = await dbHelpers.find('regions', { is_active: true });
    if (activeRegions.length > 0) {
      // Include both ilce names and their mahalleler so restaurants with mahalle-level area values match
      const allowedAreas = [];
      for (const reg of activeRegions) {
        allowedAreas.push(reg.ilce);
        if (reg.mahalleler && Array.isArray(reg.mahalleler)) {
          allowedAreas.push(...reg.mahalleler);
        }
      }
      q.area = { $in: allowedAreas };
    }
  }

  // Add meal_type filter if provided
  if (meal_type && meal_type !== 'all' && MEAL_TYPE_FILTERS[meal_type]) {
    const mf = MEAL_TYPE_FILTERS[meal_type];
    // Build $or condition for cuisine match or tag match
    q.$or = [
      { cuisine: { $regex: mf.cuisines.join('|'), $options: 'i' } },
      { tags: { $in: mf.tags.map(t => new RegExp(t, 'i')) } }
    ];
  }

  const all = await dbHelpers.find('restaurants', q);
  const l = Math.min(parseInt(limit) || 16, 64);
  res.json(shuffle(all).slice(0, l));
}));

// Active restaurants at given time
router.get('/restaurants/active', asyncHandler(async (req, res) => {
  const { time } = req.query;
  if (!time || !/^\d{2}:\d{2}$/.test(time)) {
    throw new ValidationError('time HH:MM formatında olmalı', 'time');
  }

  const now = new Date();
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // 1-7 (Mon-Sun)
  const currentTime = time;

  const all = await dbHelpers.find('restaurants', { is_active: 1 });

  const active = all.filter(r => {
    if (!r.available_hours) return true; // Default: open
    if (r.available_hours.days && !r.available_hours.days.includes(dayOfWeek)) return false;
    const open = r.available_hours.open || '00:00';
    const close = r.available_hours.close || '23:59';
    if (currentTime < open || currentTime > close) return false;
    return true;
  });

  res.json({
    restaurants: active,
    meta: {
      total: active.length,
      time: currentTime,
      day_of_week: dayOfWeek,
      timestamp: new Date().toISOString(),
    },
  });
}));

// Scheduled tournament slots for today
router.get('/tournaments/scheduled', asyncHandler(async (_req, res) => {
  const slots = [
    { slot: 'Kahvaltı Turnuvası', start: '07:00', end: '10:00', icon: '🥐' },
    { slot: 'Öğle Turnuvası', start: '11:00', end: '14:00', icon: '🍝' },
    { slot: 'Öğleden Sonra', start: '14:00', end: '17:00', icon: '☕' },
    { slot: 'Akşam Turnuvası', start: '18:00', end: '22:00', icon: '🍽️' },
    { slot: 'Gece Turnuvası', start: '22:00', end: '02:00', icon: '🌙' },
  ];

  const now = new Date();
  const currentTime = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

  const scheduled = slots.map(s => {
    const [startHr, startMin] = s.start.split(':').map(Number);
    const [endHr] = s.end.split(':').map(Number);

    let isActive;
    if (endHr < startHr) {
      // Gece yarısı geçen slot (22:00-02:00)
      isActive = currentTime >= s.start || currentTime < s.end;
    } else {
      isActive = currentTime >= s.start && currentTime < s.end;
    }

    const startObj = new Date(now);
    startObj.setHours(startHr, startMin, 0, 0);
    if (startObj < now) startObj.setDate(startObj.getDate() + 1);
    const timeUntilStart = isActive ? 0 : Math.max(0, startObj.getTime() - now.getTime());

    return {
      ...s,
      is_active: isActive,
      starts_in_ms: timeUntilStart,
      starts_in_minutes: Math.ceil(timeUntilStart / 60000),
    };
  });

  res.json(scheduled);
}));

// Single restaurant detail
router.get('/restaurants/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) throw new ValidationError('Geçersiz restoran ID', 'id');
  const r = await dbHelpers.findOne('restaurants', { id });
  if (!r) throw new NotFoundError('Restoran');
  res.json(r);
}));

// Inspiration card (random)
router.get('/inspiration', asyncHandler(async (_req, res) => {
  const all = await dbHelpers.find('cards');
  if (!all.length) return res.json({ text: 'Ne yesem acaba?', emoji: '🤔' });
  res.json(all[Math.floor(Math.random() * all.length)]);
}));

// Track event (analytics)
const eventRateLimit = rateLimit(30, 60000); // 30 events/minute

router.post('/events', eventRateLimit, checkTournamentLimit, asyncHandler(async (req, res) => {
  const { event_type, session_id, area, cuisine, game_type, duration_s, winner_id, extra } = req.body;
  await dbHelpers.insert('events', {
    event_type: safeStr(event_type, 50) || 'unknown',
    session_id: safeStr(session_id, 100) || 'anon',
    area: safeStr(area, 100),
    cuisine: safeStr(cuisine, 100),
    game_type: safeStr(game_type, 20),
    duration_s: typeof duration_s === 'number' ? Math.min(duration_s, 9999) : null,
    winner_id: typeof winner_id === 'number' ? winner_id : null,
    extra: safeStr(typeof extra === 'string' ? extra : JSON.stringify(extra), 1000),
    user_id: req.user?.id || null,
    created_at: new Date().toISOString(),
  });
  res.json({ ok: true });
}));

// Social proof — tournament count today
router.get('/stats/social', asyncHandler(async (_req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const allEvents = await dbHelpers.find('events', { event_type: 'game_complete' });
  const todayCount = allEvents.filter(e => e.created_at?.startsWith(today)).length;
  const totalCount = allEvents.length;
  res.json({
    today_tournaments: todayCount,
    total_tournaments: totalCount,
    message: todayCount > 0
      ? `Bugün ${todayCount} kişi turnuva oynadı!`
      : `Toplam ${totalCount} turnuva oynandı!`,
  });
}));

// Google Places photo proxy (hides API key from client)
router.get('/places/photo/:ref', asyncHandler(async (req, res) => {
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
  if (!API_KEY) return res.status(404).json({ error: 'No API key' });
  const photoRef = decodeURIComponent(req.params.ref);
  const url = `https://places.googleapis.com/v1/${photoRef}/media?maxHeightPx=400&maxWidthPx=600&key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) return res.status(response.status).end();
  res.set('Content-Type', response.headers.get('content-type'));
  res.set('Cache-Control', 'public, max-age=86400');
  const { Readable } = require('stream');
  Readable.fromWeb(response.body).pipe(res);
}));

module.exports = router;
