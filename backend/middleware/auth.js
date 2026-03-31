/**
 * FoodHunt — Authentication Middleware
 * JWT-based user auth + admin token auth
 */
const crypto = require('crypto');
const { UnauthorizedError, RateLimitError } = require('../utils/errors');
const { safeCompare } = require('../utils/validation');

// Simple JWT implementation (no external dependency)
let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  // Auto-generate a secret if not provided (tokens won't survive restarts)
  JWT_SECRET = crypto.randomBytes(48).toString('hex');
  console.warn('WARNING: JWT_SECRET not set — auto-generated. Tokens will reset on restart. Set JWT_SECRET env var for persistence.');
}
if (!JWT_SECRET) JWT_SECRET = 'dev-only-secret-do-not-use-in-production';
const JWT_EXPIRY = parseInt(process.env.JWT_EXPIRY) || 7 * 24 * 60 * 60; // 7 days

function base64url(str) {
  return Buffer.from(str).toString('base64url');
}

function createToken(payload) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY,
  }));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
  try {
    const [header, body, signature] = token.split('.');
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
    if (!safeCompare(signature, expectedSig)) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// Hash password with scrypt
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      resolve(`${salt}:${key.toString('hex')}`);
    });
  });
}

async function comparePassword(password, hash) {
  const [salt, key] = hash.split(':');
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(safeCompare(derivedKey.toString('hex'), key));
    });
  });
}

// Middleware: extract user from JWT (optional — does not block)
function optionalAuth(req, _res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token) {
    const payload = verifyToken(token);
    if (payload) req.user = payload;
  }
  next();
}

// Middleware: require authenticated user
function requireAuth(req, _res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) throw new UnauthorizedError('Giris yapmaniz gerekiyor');
    const payload = verifyToken(token);
    if (!payload) throw new UnauthorizedError('Oturum suresi dolmus. Tekrar giris yapin.');
    req.user = payload;
    next();
  } catch (err) {
    next(err);
  }
}

// Middleware: require admin token (legacy admin auth)
function requireAdmin(req, _res, next) {
  try {
    const ADMIN_TOKEN = process.env.ADMIN_TOKEN || global.__ADMIN_TOKEN;
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!safeCompare(token, ADMIN_TOKEN)) throw new UnauthorizedError('Admin yetkisi gerekli');
    next();
  } catch (err) {
    next(err);
  }
}

// Rate limiter with cleanup
const rateBuckets = {};
const loginAttempts = {};

setInterval(() => {
  const now = Date.now();
  for (const ip of Object.keys(rateBuckets)) {
    if (now - rateBuckets[ip].start > 120000) delete rateBuckets[ip];
  }
  for (const ip of Object.keys(loginAttempts)) {
    if (now - loginAttempts[ip].last > 900000) delete loginAttempts[ip];
  }
}, 300000);

function rateLimit(maxRequests = 300, windowMs = 60000) {
  return (req, _res, next) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    const w = rateBuckets[ip];
    if (!w || now - w.start > windowMs) {
      rateBuckets[ip] = { start: now, count: 1 };
    } else if (w.count >= maxRequests) {
      throw new RateLimitError(Math.ceil(windowMs / 1000));
    } else {
      w.count++;
    }
    next();
  };
}

function loginRateLimit(req, _res, next) {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  if (!loginAttempts[ip]) loginAttempts[ip] = { count: 0, last: now };
  const la = loginAttempts[ip];
  if (now - la.last > 900000) la.count = 0;
  la.last = now;
  la.count++;
  if (la.count > 5) throw new RateLimitError(900);
  next();
}

function resetLoginAttempts(ip) {
  if (loginAttempts[ip]) loginAttempts[ip].count = 0;
}

// Tournament limit check middleware (freemium)
async function checkTournamentLimit(req, _res, next) {
  if (!req.user) return next();
  try {
    const { dbHelpers } = require('../models/db');
    const user = await dbHelpers.findOne('users', { id: req.user.id });
    if (!user) return next();

    // Reset daily count if past reset time
    if (user.daily_reset_at && new Date(user.daily_reset_at) <= new Date()) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      await dbHelpers.update('users', { id: user.id }, {
        $set: { daily_tournaments: 0, daily_reset_at: tomorrow.toISOString() },
      });
      user.daily_tournaments = 0;
    }

    const limit = user.plan === 'premium' ? 999 : 3;
    req.tournament_info = {
      used: user.daily_tournaments || 0,
      limit,
      remaining: Math.max(0, limit - (user.daily_tournaments || 0)),
      can_play: (user.daily_tournaments || 0) < limit,
    };
  } catch (e) {
    // Non-blocking — continue if check fails
  }
  next();
}

module.exports = {
  createToken,
  verifyToken,
  hashPassword,
  comparePassword,
  optionalAuth,
  requireAuth,
  requireAdmin,
  rateLimit,
  loginRateLimit,
  resetLoginAttempts,
  checkTournamentLimit,
};
