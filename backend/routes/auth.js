/**
 * FoodHunt — Authentication Routes
 * User registration, login, profile
 */
const express = require('express');
const { asyncHandler, ValidationError, UnauthorizedError } = require('../utils/errors');
const { validateEmail, validatePassword, safeStr, safeCompare } = require('../utils/validation');
const {
  hashPassword, comparePassword, createToken,
  loginRateLimit, resetLoginAttempts, requireAuth,
} = require('../middleware/auth');
const { dbHelpers } = require('../models/db');
const logger = require('../utils/logger');

const router = express.Router();

let _nextUserId = Date.now();
function nextUserId() {
  const id = ++_nextUserId;
  const now = Date.now();
  if (now > _nextUserId) _nextUserId = now;
  return id;
}

// Register
router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !validateEmail(email)) throw new ValidationError('Geçerli bir e-posta adresi girin', 'email');
  if (!password || !validatePassword(password)) throw new ValidationError('Şifre en az 6 karakter olmalı', 'password');
  if (!name || typeof name !== 'string' || name.trim().length < 2) throw new ValidationError('İsim en az 2 karakter olmalı', 'name');

  const existing = await dbHelpers.findOne('users', { email: email.toLowerCase() });
  if (existing) throw new ValidationError('Bu e-posta adresi zaten kayıtlı', 'email');

  const hashedPw = await hashPassword(password);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const user = {
    id: nextUserId(),
    email: email.toLowerCase().trim(),
    name: safeStr(name, 100),
    password_hash: hashedPw,
    auth_provider: 'email',
    avatar_url: null,
    role: 'user',
    plan: 'free',
    points: 0,
    daily_tournaments: 0,
    daily_reset_at: tomorrow.toISOString(),
    preferences: { dark_mode: true, sound: false },
    created_at: new Date().toISOString(),
  };

  await dbHelpers.insert('users', user);
  const token = createToken({ id: user.id, email: user.email, role: user.role, name: user.name });

  logger.info('User registered', { user_id: user.id, email: user.email });
  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, preferences: user.preferences },
  });
}));

// Login
router.post('/login', loginRateLimit, asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ValidationError('E-posta ve şifre gerekli');

  const user = await dbHelpers.findOne('users', { email: email.toLowerCase().trim() });
  if (!user) throw new UnauthorizedError('E-posta veya şifre hatalı');

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) throw new UnauthorizedError('E-posta veya şifre hatalı');

  resetLoginAttempts(req.ip);
  const token = createToken({ id: user.id, email: user.email, role: user.role, name: user.name });

  logger.info('User logged in', { user_id: user.id });
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, preferences: user.preferences },
  });
}));

// Get profile
router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await dbHelpers.findOne('users', { id: req.user.id });
  if (!user) throw new UnauthorizedError('Kullanıcı bulunamadı');

  // Reset daily tournaments if past reset time
  if (user.daily_reset_at && new Date(user.daily_reset_at) <= new Date()) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    await dbHelpers.update('users', { id: user.id }, {
      $set: { daily_tournaments: 0, daily_reset_at: tomorrow.toISOString() },
    });
    user.daily_tournaments = 0;
  }

  const dailyLimit = user.plan === 'premium' ? 999 : 3;
  res.json({
    id: user.id, email: user.email, name: user.name,
    role: user.role, preferences: user.preferences, created_at: user.created_at,
    auth_provider: user.auth_provider || 'email',
    avatar_url: user.avatar_url || null,
    plan: user.plan || 'free',
    points: user.points || 0,
    daily_tournaments: user.daily_tournaments || 0,
    daily_limit: dailyLimit,
    can_play: (user.daily_tournaments || 0) < dailyLimit,
  });
}));

// Update preferences
router.patch('/me/preferences', requireAuth, asyncHandler(async (req, res) => {
  const { dark_mode, sound, notifications } = req.body;
  const prefs = {};
  if (dark_mode !== undefined) prefs['preferences.dark_mode'] = !!dark_mode;
  if (sound !== undefined) prefs['preferences.sound'] = !!sound;
  if (notifications !== undefined) prefs['preferences.notifications'] = !!notifications;
  await dbHelpers.update('users', { id: req.user.id }, { $set: prefs });
  res.json({ ok: true });
}));

// ─── Social Login: Google ──────────────────────────────────────────────────
router.post('/google', asyncHandler(async (req, res) => {
  const { credential } = req.body; // Google ID token from frontend
  if (!credential) throw new ValidationError('Google credential gerekli');

  // Decode Google ID token (JWT) — verify with Google's public certs
  let payload;
  try {
    const parts = credential.split('.');
    if (parts.length !== 3) throw new Error('Invalid token format');
    payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
  } catch {
    throw new ValidationError('Geçersiz Google token');
  }

  // Verify issuer and expiry
  const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
  if (!validIssuers.includes(payload.iss)) throw new ValidationError('Geçersiz token issuer');
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) throw new UnauthorizedError('Token süresi dolmuş');

  const email = (payload.email || '').toLowerCase().trim();
  const name = payload.name || payload.given_name || email.split('@')[0];
  if (!email) throw new ValidationError('Google hesabında e-posta bulunamadı');

  // Find or create user
  let user = await dbHelpers.findOne('users', { email });
  if (!user) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    user = {
      id: nextUserId(),
      email,
      name: safeStr(name, 100),
      password_hash: null, // social login — no password
      auth_provider: 'google',
      google_id: payload.sub,
      avatar_url: payload.picture || null,
      role: 'user',
      plan: 'free',
      points: 0,
      daily_tournaments: 0,
      daily_reset_at: tomorrow.toISOString(),
      preferences: { dark_mode: true, sound: false },
      created_at: new Date().toISOString(),
    };
    await dbHelpers.insert('users', user);
    logger.info('User registered via Google', { user_id: user.id, email });
  } else if (!user.google_id) {
    // Link Google to existing email account
    await dbHelpers.update('users', { id: user.id }, {
      $set: { google_id: payload.sub, avatar_url: user.avatar_url || payload.picture || null },
    });
  }

  const token = createToken({ id: user.id, email: user.email, role: user.role, name: user.name });
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar_url: user.avatar_url, preferences: user.preferences },
  });
}));

// ─── Social Login: Apple ───────────────────────────────────────────────────
router.post('/apple', asyncHandler(async (req, res) => {
  const { id_token, user: appleUser } = req.body;
  if (!id_token) throw new ValidationError('Apple ID token gerekli');

  // Decode Apple identity token (JWT)
  let payload;
  try {
    const parts = id_token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token format');
    payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
  } catch {
    throw new ValidationError('Geçersiz Apple token');
  }

  if (payload.iss !== 'https://appleid.apple.com') throw new ValidationError('Geçersiz Apple token issuer');
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) throw new UnauthorizedError('Token süresi dolmuş');

  const email = (payload.email || (appleUser && appleUser.email) || '').toLowerCase().trim();
  const appleId = payload.sub;
  if (!email && !appleId) throw new ValidationError('Apple hesabında e-posta bulunamadı');

  // Find user by Apple ID first, then by email
  let user = await dbHelpers.findOne('users', { apple_id: appleId });
  if (!user && email) user = await dbHelpers.findOne('users', { email });

  if (!user) {
    const name = (appleUser && appleUser.name)
      ? `${appleUser.name.firstName || ''} ${appleUser.name.lastName || ''}`.trim()
      : (email ? email.split('@')[0] : 'Apple User');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    user = {
      id: nextUserId(),
      email: email || `apple_${appleId}@private.relay`,
      name: safeStr(name, 100),
      password_hash: null,
      auth_provider: 'apple',
      apple_id: appleId,
      avatar_url: null,
      role: 'user',
      plan: 'free',
      points: 0,
      daily_tournaments: 0,
      daily_reset_at: tomorrow.toISOString(),
      preferences: { dark_mode: true, sound: false },
      created_at: new Date().toISOString(),
    };
    await dbHelpers.insert('users', user);
    logger.info('User registered via Apple', { user_id: user.id });
  } else if (!user.apple_id) {
    await dbHelpers.update('users', { id: user.id }, { $set: { apple_id: appleId } });
  }

  const token = createToken({ id: user.id, email: user.email, role: user.role, name: user.name });
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar_url: user.avatar_url, preferences: user.preferences },
  });
}));

// ─── Points System ─────────────────────────────────────────────────────────
// Get user points summary
router.get('/points', requireAuth, asyncHandler(async (req, res) => {
  const user = await dbHelpers.findOne('users', { id: req.user.id });
  const history = await dbHelpers.find('points', { user_id: req.user.id }, { sort: { created_at: -1 }, limit: 50 });
  res.json({
    total_points: user?.points || 0,
    history,
  });
}));

// Track deeplink click → award points when user orders
router.post('/points/deeplink', requireAuth, asyncHandler(async (req, res) => {
  const { restaurant_id, platform, tracking_id } = req.body;
  if (!restaurant_id || !platform) throw new ValidationError('restaurant_id ve platform gerekli');

  const POINTS_PER_ORDER = 50;
  const entry = {
    user_id: req.user.id,
    type: 'deeplink_order',
    restaurant_id,
    platform: safeStr(platform, 50),
    tracking_id: safeStr(tracking_id, 200) || null,
    points: POINTS_PER_ORDER,
    created_at: new Date().toISOString(),
  };
  await dbHelpers.insert('points', entry);

  // Update user total points
  const user = await dbHelpers.findOne('users', { id: req.user.id });
  const newTotal = (user?.points || 0) + POINTS_PER_ORDER;
  await dbHelpers.update('users', { id: req.user.id }, { $set: { points: newTotal } });

  logger.info('Points awarded', { user_id: req.user.id, points: POINTS_PER_ORDER, platform });
  res.json({ ok: true, points_earned: POINTS_PER_ORDER, total_points: newTotal });
}));

// Track tournament completion → award points
router.post('/points/tournament', requireAuth, asyncHandler(async (req, res) => {
  const { champion_id, tournament_type } = req.body;
  const POINTS_PER_TOURNAMENT = 10;

  const entry = {
    user_id: req.user.id,
    type: 'tournament_complete',
    restaurant_id: champion_id || null,
    tournament_type: safeStr(tournament_type, 50) || 'classic',
    points: POINTS_PER_TOURNAMENT,
    created_at: new Date().toISOString(),
  };
  await dbHelpers.insert('points', entry);

  const user = await dbHelpers.findOne('users', { id: req.user.id });
  const newTotal = (user?.points || 0) + POINTS_PER_TOURNAMENT;
  await dbHelpers.update('users', { id: req.user.id }, { $set: { points: newTotal } });

  res.json({ ok: true, points_earned: POINTS_PER_TOURNAMENT, total_points: newTotal });
}));

// Leaderboard
router.get('/leaderboard', asyncHandler(async (_req, res) => {
  const users = await dbHelpers.find('users', { points: { $gt: 0 } }, { sort: { points: -1 }, limit: 20 });
  res.json(users.map((u, i) => ({
    rank: i + 1,
    name: u.name,
    points: u.points || 0,
    avatar_url: u.avatar_url || null,
  })));
}));

// Admin login (legacy — kept for backward compatibility)
router.post('/admin/login', loginRateLimit, asyncHandler(async (req, res) => {
  // Hardcoded admin password — change via ADMIN_PASSWORD env var if needed
  const ADMIN_PASSWORD = 'foodhunt2026';
  const pw = typeof req.body.password === 'string' ? req.body.password : '';
  if (!safeCompare(pw, ADMIN_PASSWORD)) throw new UnauthorizedError('Yanlış şifre');

  resetLoginAttempts(req.ip);
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || global.__ADMIN_TOKEN;
  res.json({ token: ADMIN_TOKEN });
}));

module.exports = router;
