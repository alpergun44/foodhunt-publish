/**
 * FoodHunt — Firebase Auth Routes
 * Handles OTP, Google, Apple sign-in via Firebase
 */
const { Router } = require('express');
const { asyncHandler, ValidationError } = require('../utils/errors');
const { verifyFirebaseToken, isFirebaseReady } = require('../middleware/firebase');
const { createToken } = require('../middleware/auth');
const { dbHelpers } = require('../models/db');
const logger = require('../utils/logger');

const router = Router();

let _nextUserId = Date.now();
function nextUserId() {
  const id = ++_nextUserId;
  const now = Date.now();
  if (now > _nextUserId) _nextUserId = now;
  return id;
}

/**
 * POST /api/auth/firebase
 * Verify Firebase ID token → find or create user → return FoodHunt JWT
 *
 * Body: { idToken: string }
 * Returns: { token, user }
 */
router.post('/firebase', asyncHandler(async (req, res) => {
  if (!isFirebaseReady()) {
    return res.status(503).json({ error: { code: 'FIREBASE_NOT_READY', message: 'Firebase authentication is not configured' } });
  }

  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: { code: 'MISSING_TOKEN', message: 'Firebase ID token required' } });
  }

  // Verify the Firebase token
  let firebaseUser;
  try {
    firebaseUser = await verifyFirebaseToken(idToken);
  } catch (err) {
    logger.warn('Firebase token verification failed', { error: err.message });
    return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid Firebase token' } });
  }

  // Find existing user by firebase_uid or email or phone
  let user = null;

  if (firebaseUser.uid) {
    user = await dbHelpers.findOne('users', { firebase_uid: firebaseUser.uid });
  }

  if (!user && firebaseUser.email) {
    user = await dbHelpers.findOne('users', { email: firebaseUser.email.toLowerCase() });
  }

  if (!user && firebaseUser.phone) {
    user = await dbHelpers.findOne('users', { phone: firebaseUser.phone });
  }

  const now = new Date().toISOString();

  if (user) {
    // Update existing user with Firebase info
    const updates = {
      firebase_uid: firebaseUser.uid,
      last_login: now,
      login_count: (user.login_count || 0) + 1,
    };
    if (firebaseUser.name && !user.name) updates.name = firebaseUser.name;
    if (firebaseUser.email && !user.email) updates.email = firebaseUser.email.toLowerCase();
    if (firebaseUser.phone && !user.phone) updates.phone = firebaseUser.phone;
    if (firebaseUser.picture && !user.avatar) updates.avatar = firebaseUser.picture;
    if (firebaseUser.provider) updates.auth_provider = firebaseUser.provider;

    await dbHelpers.update('users', { id: user.id }, { $set: updates });
    user = { ...user, ...updates };
  } else {
    // Create new user
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    user = {
      id: nextUserId(),
      firebase_uid: firebaseUser.uid,
      email: firebaseUser.email ? firebaseUser.email.toLowerCase() : null,
      phone: firebaseUser.phone || null,
      name: firebaseUser.name || (firebaseUser.phone ? 'Kullanıcı' : null),
      avatar: firebaseUser.picture || null,
      auth_provider: firebaseUser.provider,
      role: 'user',
      plan: 'free',
      points: 0,
      daily_tournaments: 0,
      daily_reset_at: tomorrow.toISOString(),
      preferences: { dark_mode: true, sound: false },
      created_at: now,
      last_login: now,
      login_count: 1,
    };
    await dbHelpers.insert('users', user);
    logger.info('New Firebase user created', { uid: firebaseUser.uid, provider: firebaseUser.provider });
  }

  // Create FoodHunt JWT
  const token = createToken({
    id: user.id,
    email: user.email,
    role: user.role || 'user',
    name: user.name,
  });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      avatar: user.avatar,
      points: user.points || 0,
      role: user.role || 'user',
      auth_provider: user.auth_provider,
      preferences: user.preferences,
    },
  });
}));

/**
 * GET /api/auth/firebase/status
 * Check if Firebase auth is available
 */
router.get('/firebase/status', (_req, res) => {
  res.json({
    available: isFirebaseReady(),
    providers: isFirebaseReady() ? ['phone', 'google.com', 'apple.com', 'password'] : [],
  });
});

module.exports = router;
