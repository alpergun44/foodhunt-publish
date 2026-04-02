/**
 * FoodHunt — User Routes (favorites, history)
 * Requires authenticated user
 */
const express = require('express');
const { asyncHandler, ValidationError, NotFoundError } = require('../utils/errors');
const { requireAuth } = require('../middleware/auth');
const { dbHelpers } = require('../models/db');

const router = express.Router();

// ─── Favorites ───────────────────────────────────────────────────────────────

// Get user favorites
router.get('/favorites', requireAuth, asyncHandler(async (req, res) => {
  const favs = await dbHelpers.find('favorites', { user_id: req.user.id }, { sort: { created_at: -1 } });
  // Populate restaurant data
  const restaurantIds = favs.map(f => f.restaurant_id);
  const restaurants = await dbHelpers.find('restaurants', { id: { $in: restaurantIds } });
  const restaurantMap = {};
  for (const r of restaurants) restaurantMap[r.id] = r;
  res.json(favs.map(f => ({ ...f, restaurant: restaurantMap[f.restaurant_id] || null })));
}));

// Add favorite
router.post('/favorites', requireAuth, asyncHandler(async (req, res) => {
  const { restaurant_id } = req.body;
  if (!restaurant_id) throw new ValidationError('restaurant_id gerekli', 'restaurant_id');

  const restaurant = await dbHelpers.findOne('restaurants', { id: parseInt(restaurant_id) });
  if (!restaurant) throw new NotFoundError('Restoran');

  const existing = await dbHelpers.findOne('favorites', { user_id: req.user.id, restaurant_id: parseInt(restaurant_id) });
  if (existing) return res.json({ ok: true, message: 'Zaten favorilerde' });

  await dbHelpers.insert('favorites', {
    user_id: req.user.id,
    restaurant_id: parseInt(restaurant_id),
    created_at: new Date().toISOString(),
  });
  res.status(201).json({ ok: true });
}));

// Remove favorite
router.delete('/favorites/:restaurantId', requireAuth, asyncHandler(async (req, res) => {
  const restaurantId = parseInt(req.params.restaurantId);
  if (isNaN(restaurantId)) throw new ValidationError('Geçersiz restoran ID');
  await dbHelpers.remove('favorites', { user_id: req.user.id, restaurant_id: restaurantId });
  res.json({ ok: true });
}));

// ─── Tournament History ──────────────────────────────────────────────────────

// Get user history
router.get('/history', requireAuth, asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const history = await dbHelpers.find('history', { user_id: req.user.id }, { sort: { created_at: -1 }, limit });
  res.json(history);
}));

// Save tournament result
router.post('/history', requireAuth, asyncHandler(async (req, res) => {
  const { winner_id, runner_up_id, area, cuisine, game_type, duration_s, bracket } = req.body;
  if (!winner_id) throw new ValidationError('winner_id gerekli', 'winner_id');

  const winner = await dbHelpers.findOne('restaurants', { id: parseInt(winner_id) });

  await dbHelpers.insert('history', {
    user_id: req.user.id,
    winner_id: parseInt(winner_id),
    winner_name: winner?.name || 'Bilinmeyen',
    runner_up_id: runner_up_id ? parseInt(runner_up_id) : null,
    area: area || null,
    cuisine: cuisine || null,
    game_type: game_type || 'bracket',
    duration_s: typeof duration_s === 'number' ? duration_s : null,
    bracket: bracket || null,
    created_at: new Date().toISOString(),
  });
  res.status(201).json({ ok: true });
}));

// Quick recommend — random from favorites or top rated
router.get('/recommend', requireAuth, asyncHandler(async (req, res) => {
  const area = req.query.area;
  // Try favorites first
  const favs = await dbHelpers.find('favorites', { user_id: req.user.id });
  if (favs.length > 0) {
    const fav = favs[Math.floor(Math.random() * favs.length)];
    const restaurant = await dbHelpers.findOne('restaurants', { id: fav.restaurant_id, is_active: 1 });
    if (restaurant) return res.json({ source: 'favorites', restaurant });
  }
  // Fallback to random high-rated
  const q = { is_active: 1 };
  if (area) q.area = area;
  const all = await dbHelpers.find('restaurants', q);
  const topRated = all.filter(r => r.rating >= 4.0);
  const pool = topRated.length > 0 ? topRated : all;
  if (pool.length === 0) return res.json({ source: 'none', restaurant: null, message: 'Restoran bulunamadı' });
  res.json({ source: 'top_rated', restaurant: pool[Math.floor(Math.random() * pool.length)] });
}));

module.exports = router;
