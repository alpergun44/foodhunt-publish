/**
 * FoodHunt — API Tests
 * Run: npx jest tests/ --forceExit
 */
const http = require('http');

const BASE = process.env.TEST_API_URL || 'http://localhost:3001';

// Simple HTTP client for testing (no external deps)
function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ─── Validation Unit Tests ───────────────────────────────────────────────────
describe('Validation Utils', () => {
  const { sanitizeRestaurant, safeStr, shuffle, validateEmail, validatePassword } = require('../utils/validation');

  test('sanitizeRestaurant trims and limits name', () => {
    const result = sanitizeRestaurant({ name: '  Test Restaurant  ', unknown_field: 'ignored' });
    expect(result.name).toBe('Test Restaurant');
    expect(result.unknown_field).toBeUndefined();
  });

  test('sanitizeRestaurant clamps rating between 0-5', () => {
    expect(sanitizeRestaurant({ rating: 10 }).rating).toBe(5);
    expect(sanitizeRestaurant({ rating: -1 }).rating).toBe(0);
    expect(sanitizeRestaurant({ rating: 3.5 }).rating).toBe(3.5);
  });

  test('sanitizeRestaurant clamps price_level between 1-4', () => {
    expect(sanitizeRestaurant({ price_level: 0 }).price_level).toBe(1);
    expect(sanitizeRestaurant({ price_level: 5 }).price_level).toBe(4);
  });

  test('safeStr handles various inputs', () => {
    expect(safeStr('hello', 3)).toBe('hel');
    expect(safeStr('  spaced  ')).toBe('spaced');
    expect(safeStr(null)).toBeNull();
    expect(safeStr(123)).toBeNull();
  });

  test('shuffle returns array of same length', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffle(arr);
    expect(shuffled).toHaveLength(5);
    expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  test('shuffle does not modify original', () => {
    const arr = [1, 2, 3];
    shuffle(arr);
    expect(arr).toEqual([1, 2, 3]);
  });

  test('validateEmail', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('bad')).toBe(false);
    expect(validateEmail('')).toBe(false);
    expect(validateEmail(null)).toBe(false);
  });

  test('validatePassword', () => {
    expect(validatePassword('123456')).toBe(true);
    expect(validatePassword('12345')).toBe(false);
    expect(validatePassword('')).toBe(false);
    expect(validatePassword('a'.repeat(129))).toBe(false);
  });
});

// ─── Error Classes Tests ─────────────────────────────────────────────────────
describe('Error Classes', () => {
  const { ValidationError, NotFoundError, UnauthorizedError, RateLimitError } = require('../utils/errors');

  test('ValidationError has correct properties', () => {
    const err = new ValidationError('Bad input', 'email');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.field).toBe('email');
    expect(err.isOperational).toBe(true);
  });

  test('NotFoundError with custom resource', () => {
    const err = new NotFoundError('Restoran');
    expect(err.statusCode).toBe(404);
    expect(err.message).toContain('bulunamadi');
  });

  test('UnauthorizedError', () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
  });

  test('RateLimitError with retryAfter', () => {
    const err = new RateLimitError(120);
    expect(err.statusCode).toBe(429);
    expect(err.retryAfter).toBe(120);
  });
});

// ─── Auth Module Tests ───────────────────────────────────────────────────────
describe('Auth Module', () => {
  const { createToken, verifyToken, hashPassword, comparePassword } = require('../middleware/auth');

  test('createToken and verifyToken round-trip', () => {
    const payload = { id: 1, email: 'test@test.com', role: 'user' };
    const token = createToken(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);

    const decoded = verifyToken(token);
    expect(decoded.id).toBe(1);
    expect(decoded.email).toBe('test@test.com');
  });

  test('verifyToken rejects tampered token', () => {
    const token = createToken({ id: 1 });
    const tampered = token.slice(0, -5) + 'xxxxx';
    expect(verifyToken(tampered)).toBeNull();
  });

  test('verifyToken rejects invalid format', () => {
    expect(verifyToken('not.a.valid.token')).toBeNull();
    expect(verifyToken('')).toBeNull();
  });

  test('hashPassword and comparePassword', async () => {
    const hash = await hashPassword('testpassword');
    expect(hash).toContain(':');
    expect(await comparePassword('testpassword', hash)).toBe(true);
    expect(await comparePassword('wrongpassword', hash)).toBe(false);
  });
});

// ─── Integration Tests (require running server) ─────────────────────────────
describe('API Integration Tests', () => {
  // These tests require the server to be running
  const isServerRunning = async () => {
    try {
      const res = await request('GET', '/api/health');
      return res.status === 200;
    } catch { return false; }
  };

  let serverAvailable = false;

  beforeAll(async () => {
    serverAvailable = await isServerRunning();
    if (!serverAvailable) {
      console.log('Server not running — skipping integration tests. Start with: node server.v2.js');
    }
  });

  test('GET /api/health returns ok', async () => {
    if (!serverAvailable) return;
    const res = await request('GET', '/api/health');
    expect(res.status).toBe(200);
    expect(res.data.status).toBe('ok');
    expect(typeof res.data.restaurants).toBe('number');
  });

  test('GET /api/areas returns array', async () => {
    if (!serverAvailable) return;
    const res = await request('GET', '/api/areas');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });

  test('GET /api/cuisines returns array', async () => {
    if (!serverAvailable) return;
    const res = await request('GET', '/api/cuisines');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });

  test('GET /api/catalog returns shuffled restaurants', async () => {
    if (!serverAvailable) return;
    const res = await request('GET', '/api/catalog?limit=8');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeLessThanOrEqual(8);
  });

  test('GET /api/restaurants/:id returns 404 for non-existent', async () => {
    if (!serverAvailable) return;
    const res = await request('GET', '/api/restaurants/999999999');
    expect(res.status).toBe(404);
  });

  test('GET /api/inspiration returns card', async () => {
    if (!serverAvailable) return;
    const res = await request('GET', '/api/inspiration');
    expect(res.status).toBe(200);
    expect(res.data.text).toBeDefined();
  });

  test('GET /api/docs returns documentation', async () => {
    if (!serverAvailable) return;
    const res = await request('GET', '/api/docs');
    expect(res.status).toBe(200);
    expect(res.data.name).toBe('FoodHunt API');
    expect(res.data.endpoints).toBeDefined();
  });

  test('POST /api/events tracks event', async () => {
    if (!serverAvailable) return;
    const res = await request('POST', '/api/events', {
      event_type: 'test_event',
      session_id: 'test-session',
    });
    expect(res.status).toBe(200);
    expect(res.data.ok).toBe(true);
  });

  test('GET /api/stats/social returns counts', async () => {
    if (!serverAvailable) return;
    const res = await request('GET', '/api/stats/social');
    expect(res.status).toBe(200);
    expect(typeof res.data.total_tournaments).toBe('number');
  });

  // Auth tests
  test('POST /api/auth/register creates user', async () => {
    if (!serverAvailable) return;
    const email = `test${Date.now()}@test.com`;
    const res = await request('POST', '/api/auth/register', {
      email, password: 'test123456', name: 'Test User',
    });
    expect(res.status).toBe(201);
    expect(res.data.token).toBeDefined();
    expect(res.data.user.email).toBe(email);
  });

  test('POST /api/auth/register rejects invalid email', async () => {
    if (!serverAvailable) return;
    const res = await request('POST', '/api/auth/register', {
      email: 'invalid', password: 'test123456', name: 'Test',
    });
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/login rejects wrong password', async () => {
    if (!serverAvailable) return;
    const res = await request('POST', '/api/auth/login', {
      email: 'nonexistent@test.com', password: 'wrong',
    });
    expect(res.status).toBe(401);
  });

  // Admin auth tests
  test('GET /api/admin/stats requires auth', async () => {
    if (!serverAvailable) return;
    const res = await request('GET', '/api/admin/stats');
    expect(res.status).toBe(401);
  });

  // Rate limiting
  test('API validates input types', async () => {
    if (!serverAvailable) return;
    const res = await request('GET', '/api/restaurants/notanumber');
    expect(res.status).toBe(400);
  });
});
