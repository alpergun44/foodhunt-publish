/**
 * FoodHunt — Input Validation & Sanitization Utilities
 */
const crypto = require('crypto');

const R_FIELDS = [
  'name', 'cuisine', 'area', 'price_level', 'rating',
  'calories_min', 'calories_max', 'yemeksepeti_link', 'getir_link',
  'trendyol_link', 'image_url', 'description', 'is_active',
  'lat', 'lng', 'address', 'phone', 'tags',
  'google_place_id', 'google_maps_url', 'website', 'rating_count', 'source',
  'competition_slots',  // [{ slot: "lunch", start: "11:00", end: "14:00" }, ...]
  'available_hours',    // { open: "09:00", close: "23:00", days: [1,2,3,4,5,6,7] }
  'district',           // Tuzla sub-areas
];

function sanitizeRestaurant(body) {
  const c = {};
  for (const k of R_FIELDS) {
    if (body[k] !== undefined) c[k] = body[k];
  }
  if (c.name && typeof c.name === 'string') c.name = c.name.trim().slice(0, 200);
  if (c.cuisine && typeof c.cuisine === 'string') c.cuisine = c.cuisine.trim().slice(0, 100);
  if (c.area && typeof c.area === 'string') c.area = c.area.trim().slice(0, 100);
  if (c.description && typeof c.description === 'string') c.description = c.description.trim().slice(0, 500);
  if (c.address && typeof c.address === 'string') c.address = c.address.trim().slice(0, 300);
  if (c.phone && typeof c.phone === 'string') c.phone = c.phone.trim().slice(0, 20);
  if (c.rating !== undefined) c.rating = Math.min(5, Math.max(0, parseFloat(c.rating) || 0));
  if (c.price_level !== undefined) c.price_level = Math.min(4, Math.max(1, parseInt(c.price_level) || 2));
  if (c.calories_min !== undefined) c.calories_min = Math.max(0, parseInt(c.calories_min) || 0);
  if (c.calories_max !== undefined) c.calories_max = Math.max(0, parseInt(c.calories_max) || 0);
  if (c.lat !== undefined) c.lat = parseFloat(c.lat) || null;
  if (c.lng !== undefined) c.lng = parseFloat(c.lng) || null;
  if (c.is_active !== undefined) c.is_active = c.is_active ? 1 : 0;
  if (c.tags && Array.isArray(c.tags)) c.tags = c.tags.slice(0, 10).map(t => String(t).trim().slice(0, 50));
  if (c.district && typeof c.district === 'string') c.district = c.district.trim().slice(0, 100);

  // competition_slots validation
  if (c.competition_slots && Array.isArray(c.competition_slots)) {
    c.competition_slots = c.competition_slots.slice(0, 10).map(s => ({
      slot: String(s.slot || '').trim().slice(0, 50),
      start: String(s.start || '').trim().slice(0, 5),
      end: String(s.end || '').trim().slice(0, 5),
    }));
  }

  // available_hours validation
  if (c.available_hours && typeof c.available_hours === 'object') {
    c.available_hours = {
      open: String(c.available_hours.open || '09:00').slice(0, 5),
      close: String(c.available_hours.close || '23:00').slice(0, 5),
      days: Array.isArray(c.available_hours.days)
        ? c.available_hours.days.map(d => Math.max(1, Math.min(7, parseInt(d)))).filter(d => !isNaN(d))
        : [1, 2, 3, 4, 5, 6, 7],
    };
  }

  return c;
}

function safeStr(v, max = 500) {
  return typeof v === 'string' ? v.trim().slice(0, max) : null;
}

function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bA = Buffer.from(a);
  const bB = Buffer.from(b);
  if (bA.length !== bB.length) {
    const dummy = Buffer.alloc(bA.length);
    crypto.timingSafeEqual(bA, dummy);
    return false;
  }
  return crypto.timingSafeEqual(bA, bB);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function validateEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 6 && password.length <= 128;
}

module.exports = {
  sanitizeRestaurant,
  safeStr,
  safeCompare,
  shuffle,
  validateEmail,
  validatePassword,
  R_FIELDS,
};
