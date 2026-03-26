/**
 * FoodHunt — Public API Routes
 * No auth required
 */
const express = require('express');
const { asyncHandler } = require('../utils/errors');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { safeStr, shuffle } = require('../utils/validation');
const { dbHelpers } = require('../models/db');

const router = express.Router();

// Health check
router.get('/health', asyncHandler(async (_req, res) => {
  const count = await dbHelpers.count('restaurants', { is_active: 1 });
  res.json({ status: 'ok', restaurants: count, ts: Date.now(), version: '2.2.0' });
}));

// List areas with restaurant counts
router.get('/areas', asyncHandler(async (_req, res) => {
  const all = await dbHelpers.find('restaurants', { is_active: 1 });
  const m = {};
  for (const r of all) if (r.area) m[r.area] = (m[r.area] || 0) + 1;
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
  const { area, cuisine, limit = 16, price_min, price_max } = req.query;
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

  const all = await dbHelpers.find('restaurants', q);
  const l = Math.min(parseInt(limit) || 16, 32);
  res.json(shuffle(all).slice(0, l));
}));

// Single restaurant detail
router.get('/restaurants/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) throw new ValidationError('Gecersiz restoran ID', 'id');
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
router.post('/events', asyncHandler(async (req, res) => {
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
      ? `Bugun ${todayCount} kisi turnuva oynadi!`
      : `Toplam ${totalCount} turnuva oynandi!`,
  });
}));

module.exports = router;
