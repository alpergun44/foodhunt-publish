/**
 * FoodHunt — CORS Configuration
 */
const cors = require('cors');

function createCorsMiddleware() {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'];

  return cors({
    origin: (origin, cb) => {
      // Allow same-origin requests (no Origin header) and allowed origins
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      // In production, also allow the configured domain
      if (process.env.NODE_ENV === 'production' && process.env.APP_URL) {
        if (origin === process.env.APP_URL) return cb(null, true);
      }
      cb(new Error('CORS not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
}

module.exports = { createCorsMiddleware };
