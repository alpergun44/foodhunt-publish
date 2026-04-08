/**
 * FoodHunt — Nearby/Location-based Routes
 *
 * Endpoints for discovering restaurants based on user's geolocation.
 * Combines Google Places API data with local seed data.
 */
const express = require('express');
const { asyncHandler, ValidationError } = require('../utils/errors');
const { safeStr, shuffle } = require('../utils/validation');
const { dbHelpers } = require('../models/db');
const { searchNearby } = require('../services/places');

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

let _nextNearbyId = Date.now();
function nextNearbyId() {
  const id = ++_nextNearbyId;
  const now = Date.now();
  if (now > _nextNearbyId) _nextNearbyId = now;
  return id;
}

/**
 * GET /api/nearby?lat=&lng=&radius=2000&limit=16&cuisine=&meal_type=&merge=true
 *
 * Returns restaurants near the user's location.
 * If Google Places API key is configured, fetches from Google.
 * Always merges with local seed data matching the area.
 * If no API key, falls back to seed data only.
 */
router.get('/nearby', asyncHandler(async (req, res) => {
  const { lat, lng, radius = 2000, limit = 16, cuisine, meal_type, merge = 'true' } = req.query;

  // Validate coordinates
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (isNaN(latNum) || isNaN(lngNum)) {
    throw new ValidationError('lat ve lng parametreleri gerekli', 'coordinates');
  }
  if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
    throw new ValidationError('Geçersiz koordinatlar', 'coordinates');
  }

  const radiusNum = Math.min(parseInt(radius) || 2000, 5000); // Max 5km
  const limitNum = Math.min(parseInt(limit) || 16, 32);

  // 1. Fetch from Google Places API
  let googleResults = [];
  try {
    googleResults = await searchNearby(latNum, lngNum, radiusNum, 20);
  } catch (err) {
    // Non-fatal — continue with seed data
  }

  // 2. Find matching seed data by detected area
  let seedResults = [];
  if (merge === 'true' || googleResults.length === 0) {
    const area = detectArea(latNum, lngNum);
    const q = { is_active: 1 };
    if (area) q.area = area;
    if (cuisine) q.cuisine = safeStr(cuisine, 100);
    // Add meal_type filter if provided
    if (meal_type && meal_type !== 'all' && MEAL_TYPE_FILTERS[meal_type]) {
      const mf = MEAL_TYPE_FILTERS[meal_type];
      q.$or = [
        { cuisine: { $regex: mf.cuisines.join('|'), $options: 'i' } },
        { tags: { $in: mf.tags.map(t => new RegExp(t, 'i')) } }
      ];
    }
    seedResults = await dbHelpers.find('restaurants', q);
  }

  // 3. Merge & deduplicate (prefer Google data for duplicates)
  let combined = deduplicateRestaurants(googleResults, seedResults);

  // 4. Filter by cuisine if specified
  if (cuisine) {
    const c = safeStr(cuisine, 100).toLowerCase();
    combined = combined.filter(r =>
      (r.cuisine || '').toLowerCase().includes(c) ||
      (r.tags || []).some(t => t.toLowerCase().includes(c))
    );
  }

  // 5. Filter by meal_type if specified (for Google results as well)
  if (meal_type && meal_type !== 'all' && MEAL_TYPE_FILTERS[meal_type]) {
    const mf = MEAL_TYPE_FILTERS[meal_type];
    combined = combined.filter(r => {
      const matchesCuisine = mf.cuisines.some(c =>
        (r.cuisine || '').toLowerCase().includes(c.toLowerCase())
      );
      const matchesTags = (r.tags || []).some(tag =>
        mf.tags.some(t => tag.toLowerCase().includes(t.toLowerCase()))
      );
      return matchesCuisine || matchesTags;
    });
  }

  // 6. Shuffle and limit
  const result = shuffle(combined).slice(0, limitNum);

  res.json({
    restaurants: result,
    meta: {
      total: combined.length,
      returned: result.length,
      google_count: googleResults.length,
      seed_count: seedResults.length,
      location: { lat: latNum, lng: lngNum },
      radius: radiusNum,
      area_detected: detectArea(latNum, lngNum),
    },
  });
}));

/**
 * GET /api/nearby/areas?lat=&lng=
 *
 * Returns available areas near the user's location
 * with restaurant counts from both Google and seed data.
 */
router.get('/nearby/areas', asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);

  // Get seed data areas
  const all = await dbHelpers.find('restaurants', { is_active: 1 });
  const areaMap = {};
  for (const r of all) {
    if (r.area) areaMap[r.area] = (areaMap[r.area] || 0) + 1;
  }

  // Sort by proximity if coordinates provided
  let areas = Object.entries(areaMap).map(([area, count]) => ({
    area,
    count,
    distance: (!isNaN(latNum) && !isNaN(lngNum))
      ? getAreaDistance(area, latNum, lngNum)
      : null,
  }));

  if (!isNaN(latNum) && !isNaN(lngNum)) {
    areas.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
  } else {
    areas.sort((a, b) => b.count - a.count);
  }

  res.json(areas);
}));

/**
 * POST /api/nearby/save
 *
 * Save a Google Places restaurant to the local database
 * (so it persists for tournament history, favorites, etc.)
 */
router.get('/nearby/lookup/:google_place_id', asyncHandler(async (req, res) => {
  const gpid = safeStr(req.params.google_place_id, 200);

  // Check if already saved
  const existing = await dbHelpers.findOne('restaurants', { google_place_id: gpid });
  if (existing) return res.json(existing);

  // Not found — caller should send the full data via POST
  res.status(404).json({ error: 'Restaurant not in local DB. Use POST to save.' });
}));

router.post('/nearby/save', asyncHandler(async (req, res) => {
  const data = req.body;
  if (!data.google_place_id) {
    throw new ValidationError('google_place_id gerekli', 'google_place_id');
  }

  // Check duplicate
  const existing = await dbHelpers.findOne('restaurants', { google_place_id: data.google_place_id });
  if (existing) return res.json(existing);

  // Save to local DB
  const doc = {
    id: nextNearbyId(),
    google_place_id: data.google_place_id,
    name: safeStr(data.name, 200) || 'Bilinmeyen',
    cuisine: safeStr(data.cuisine, 100) || 'Restoran',
    area: safeStr(data.area, 100) || 'İstanbul',
    rating: Math.min(5, Math.max(0, parseFloat(data.rating) || 0)),
    price_level: Math.min(4, Math.max(1, parseInt(data.price_level) || 2)),
    calories_min: parseInt(data.calories_min) || 350,
    calories_max: parseInt(data.calories_max) || 750,
    image_url: safeStr(data.image_url, 500) || '',
    description: safeStr(data.description, 500) || '',
    address: safeStr(data.address, 300) || '',
    phone: safeStr(data.phone, 20) || '',
    lat: parseFloat(data.lat) || null,
    lng: parseFloat(data.lng) || null,
    google_maps_url: safeStr(data.google_maps_url, 500) || '',
    website: safeStr(data.website, 500) || '',
    yemeksepeti_link: safeStr(data.yemeksepeti_link, 500) || '',
    getir_link: safeStr(data.getir_link, 500) || '',
    trendyol_link: safeStr(data.trendyol_link, 500) || '',
    tags: Array.isArray(data.tags) ? data.tags.slice(0, 10) : [],
    is_active: 1,
    source: 'google_places',
    created_at: new Date().toISOString(),
  };

  await dbHelpers.insert('restaurants', doc);
  res.status(201).json(doc);
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Detect Istanbul area from coordinates
 * Uses approximate bounding boxes for main districts
 */
function detectArea(lat, lng) {
  const districts = [
    { name: 'Kadikoy',   lat: 40.9828, lng: 29.0290, r: 0.03 },
    { name: 'Besiktas',  lat: 41.0420, lng: 29.0070, r: 0.025 },
    { name: 'Beyoglu',   lat: 41.0370, lng: 28.9770, r: 0.025 },
    { name: 'Sisli',     lat: 41.0600, lng: 28.9870, r: 0.03 },
    { name: 'Uskudar',   lat: 41.0235, lng: 29.0153, r: 0.025 },
    { name: 'Fatih',     lat: 41.0186, lng: 28.9497, r: 0.03 },
    { name: 'Bakirkoy',  lat: 40.9800, lng: 28.8720, r: 0.03 },
    { name: 'Atasehir',  lat: 40.9830, lng: 29.1100, r: 0.03 },
    { name: 'Maltepe',   lat: 40.9340, lng: 29.1320, r: 0.03 },
    { name: 'Sariyer',   lat: 41.1670, lng: 29.0500, r: 0.04 },
  ];

  let closest = null;
  let minDist = Infinity;

  for (const d of districts) {
    const dist = Math.sqrt(Math.pow(lat - d.lat, 2) + Math.pow(lng - d.lng, 2));
    if (dist < d.r && dist < minDist) {
      minDist = dist;
      closest = d.name;
    }
  }

  return closest;
}

/**
 * Get approximate distance between a named area and coordinates
 */
function getAreaDistance(areaName, lat, lng) {
  const centers = {
    'Kadikoy': { lat: 40.9828, lng: 29.0290 },
    'Besiktas': { lat: 41.0420, lng: 29.0070 },
    'Beyoglu': { lat: 41.0370, lng: 28.9770 },
    'Sisli': { lat: 41.0600, lng: 28.9870 },
    'Uskudar': { lat: 41.0235, lng: 29.0153 },
    'Fatih': { lat: 41.0186, lng: 28.9497 },
    'Bakirkoy': { lat: 40.9800, lng: 28.8720 },
    'Atasehir': { lat: 40.9830, lng: 29.1100 },
  };

  const center = centers[areaName];
  if (!center) return null;

  // Haversine approximation in km
  const R = 6371;
  const dLat = (lat - center.lat) * Math.PI / 180;
  const dLng = (lng - center.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(center.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Deduplicate restaurants — prefer Google data when names match
 */
function deduplicateRestaurants(googleResults, seedResults) {
  const seen = new Map();

  // Add Google results first (higher priority)
  for (const r of googleResults) {
    const key = r.name.toLowerCase().replace(/\s+/g, '');
    seen.set(key, r);
  }

  // Add seed results that aren't duplicates
  for (const r of seedResults) {
    const key = r.name.toLowerCase().replace(/\s+/g, '');
    if (!seen.has(key)) {
      seen.set(key, r);
    }
  }

  return Array.from(seen.values());
}

module.exports = router;
