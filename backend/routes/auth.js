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

  if (!email || !validateEmail(email)) throw new ValidationError('Gecerli bir e-posta adresi girin', 'email');
  if (!password || !validatePassword(password)) throw new ValidationError('Sifre en az 6 karakter olmali', 'password');
  if (!name || typeof name !== 'string' || name.trim().length < 2) throw new ValidationError('Isim en az 2 karakter olmali', 'name');

  const existing = await dbHelpers.findOne('users', { email: email.toLowerCase() });
  if (existing) throw new ValidationError('Bu e-posta adresi zaten kayitli', 'email');

  const hashedPw = await hashPassword(password);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const user = {
    id: nextUserId(),
    email: email.toLowerCase().trim(),
    name: safeStr(name, 100),
    password_hash: hashedPw,
    role: 'user',
    plan: 'free',
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
  if (!email || !password) throw new ValidationError('E-posta ve sifre gerekli');

  const user = await dbHelpers.findOne('users', { email: email.toLowerCase().trim() });
  if (!user) throw new UnauthorizedError('E-posta veya sifre hatali');

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) throw new UnauthorizedError('E-posta veya sifre hatali');

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
  if (!user) throw new UnauthorizedError('Kullanici bulunamadi');

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
    plan: user.plan || 'free',
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

// Admin login (legacy — kept for backward compatibility)
router.post('/admin/login', loginRateLimit, asyncHandler(async (req, res) => {
  if (!process.env.ADMIN_PASSWORD && process.env.NODE_ENV === 'production') {
    console.error('CRITICAL: ADMIN_PASSWORD environment variable is required in production!');
    process.exit(1);
  }
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // dev only
  const pw = typeof req.body.password === 'string' ? req.body.password : '';
  if (!safeCompare(pw, ADMIN_PASSWORD)) throw new UnauthorizedError('Yanlis sifre');

  resetLoginAttempts(req.ip);
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || global.__ADMIN_TOKEN;
  res.json({ token: ADMIN_TOKEN });
}));

module.exports = router;
