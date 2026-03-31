# FoodHunt v2.2 — Upgrade Guide

## Overview

This upgrade addresses all 6 weaknesses identified in the analysis report, plus adds growth features for the Turkish market MVP launch.

## What Changed

### 1. Database Architecture (6.1 — Critical Risk RESOLVED)
**Before:** Single `server.js` with embedded NeDB, no migration path
**After:** `models/db.js` — Database abstraction layer supporting both NeDB and MongoDB

**How to switch to MongoDB:**
```bash
# 1. Set environment variables
DB_TYPE=mongo
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/foodhunt

# 2. Run the new seed script
node seed.v2.js

# 3. Start with new server
node server.v2.js
```

The `dbHelpers` module provides a unified API — same code works with both databases.

### 2. Test Infrastructure (6.2 — RESOLVED)
**Before:** Zero tests
**After:** `tests/api.test.js` — 25+ unit tests + integration test suite

```bash
# Run tests
cd backend && npx jest tests/ --forceExit

# Tests cover:
# - Validation utilities (sanitize, safe string, email, password)
# - Error classes (ValidationError, NotFoundError, etc.)
# - JWT token creation/verification
# - Password hashing/comparison
# - API endpoints (when server is running)
```

### 3. Component Refactoring (6.3 — RESOLVED)
**Before:** App.tsx (24KB monolith), Admin.tsx (26KB monolith)
**After:** Modular structure:

```
Backend:
  routes/public.js    — Public API endpoints
  routes/auth.js      — Authentication routes
  routes/user.js      — User features (favorites, history)
  routes/admin.js     — Admin endpoints
  middleware/auth.js   — JWT + admin auth
  middleware/cors.js   — CORS configuration
  models/db.js        — Database abstraction
  utils/errors.js     — Error classes + handler
  utils/logger.js     — Structured logging
  utils/validation.js — Input validation

Frontend:
  hooks/useTournament.ts   — Tournament logic (extracted from App.tsx)
  hooks/useApi.ts          — API client (replaces api.ts)
  context/AuthContext.tsx   — Auth state management
  components/ui/           — Reusable UI components
```

### 4. User Authentication (6.4 — RESOLVED)
**Before:** No user system
**After:** Full JWT auth system

- `POST /api/auth/register` — User registration
- `POST /api/auth/login` — Login with email/password
- `GET /api/auth/me` — Get profile
- `PATCH /api/auth/me/preferences` — Update preferences
- Passwords hashed with scrypt (no external dependency)
- Token expiry configurable via JWT_EXPIRY env

### 5. Business Model Infrastructure (6.5 — PARTIALLY RESOLVED)
**Before:** No monetization infrastructure
**After:**
- Deeplink tracking via events API
- Affiliate click tracking ready
- User analytics foundation
- Admin export (JSON + CSV) for data analysis
- Social proof endpoint for engagement

**Recommended model:** Affiliate (deeplinks) + Sponsored tournaments

### 6. API Documentation & Error Handling (6.6 — RESOLVED)
**Before:** No docs, generic error messages
**After:**
- `GET /api/docs` — Live API documentation endpoint
- Custom error classes: `ValidationError`, `NotFoundError`, `UnauthorizedError`, `RateLimitError`
- Consistent JSON error format: `{ error: { code, message, field? } }`
- `asyncHandler` wrapper eliminates try/catch boilerplate
- Structured JSON logging with file output (`logs/` directory)
- Request logging middleware with duration tracking

## Additional Features Added

### PWA Support
- `manifest.json` — Installable on mobile
- `sw.js` — Service worker with cache strategies
- Apple touch icon support

### Frontend Components
- `Onboarding.tsx` — 3-step intro for new users
- `CookieConsent.tsx` — KVKK-compliant cookie banner
- `ThemeToggle.tsx` — Dark/light mode toggle
- `ShareButton.tsx` — Native Web Share API + clipboard fallback
- `SocialProof.tsx` — "X people played today" counter
- `LoadingSkeleton.tsx` — Shimmer loading states
- `EmptyState.tsx` — Beautiful empty states

### User Features
- Favorites (add/remove restaurants)
- Tournament history (last 50)
- Quick recommend (random from favorites or top-rated)

### 200+ Istanbul Restaurant Data
- Kadikoy (30 restaurants)
- Besiktas (25 restaurants)
- Beyoglu (30 restaurants)
- Sisli (25 restaurants)
- 20+ cuisine types

### Deploy Configuration
- `vercel.json` — Frontend deploy config
- `railway.json` — Backend deploy config
- `Dockerfile.backend` — Container support
- `.github/workflows/ci.yml` — CI/CD pipeline

## Migration Steps

```bash
# 1. Install new backend dependencies
cd backend
npm install jest --save-dev
npm install mongodb --save  # only if using MongoDB

# 2. Update .env from .env.example (add new variables)

# 3. Seed new restaurant data
node seed.v2.js

# 4. Switch to new server
# Option A: Replace server.js
cp server.js server.v1.backup.js
cp server.v2.js server.js

# Option B: Update start script
# Edit start.sh to use server.v2.js

# 5. Run tests to verify
npx jest tests/ --forceExit

# 6. Start server
node server.v2.js
```

## File Structure (New)

```
foodhunt-publish/
├── backend/
│   ├── middleware/
│   │   ├── auth.js          ← JWT auth + admin auth + rate limiting
│   │   └── cors.js          ← CORS configuration
│   ├── models/
│   │   └── db.js            ← NeDB/MongoDB abstraction layer
│   ├── routes/
│   │   ├── admin.js         ← Admin endpoints (CRUD, stats, export)
│   │   ├── auth.js          ← Register, login, profile
│   │   ├── public.js        ← Catalog, areas, cuisines, events
│   │   └── user.js          ← Favorites, history, recommend
│   ├── tests/
│   │   └── api.test.js      ← Unit + integration tests
│   ├── utils/
│   │   ├── errors.js        ← Error classes + handler + asyncHandler
│   │   ├── logger.js        ← Structured JSON logging
│   │   └── validation.js    ← Input sanitization
│   ├── server.js            ← Original (keep as backup)
│   ├── server.v2.js         ← NEW modular server
│   ├── seed.js              ← Original seed
│   └── seed.v2.js           ← NEW 200+ Istanbul restaurants
├── frontend/
│   ├── public/
│   │   ├── manifest.json    ← PWA manifest
│   │   └── sw.js            ← Service worker
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── CookieConsent.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── LoadingSkeleton.tsx
│   │   │   │   ├── Onboarding.tsx
│   │   │   │   ├── ShareButton.tsx
│   │   │   │   ├── SocialProof.tsx
│   │   │   │   └── ThemeToggle.tsx
│   │   │   └── Tile.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/
│   │   │   ├── useApi.ts
│   │   │   └── useTournament.ts
│   │   └── pages/
│   ├── index.html            ← Updated with PWA + JSON-LD
│   └── ...
├── .github/workflows/ci.yml  ← CI/CD pipeline
├── Dockerfile.backend         ← Docker support
├── vercel.json                ← Frontend deploy
├── railway.json               ← Backend deploy
└── UPGRADE_GUIDE.md           ← This file
```
