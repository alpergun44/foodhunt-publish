/**
 * FoodHunt — CORS Configuration
 */
const cors = require('cors');

function createCorsMiddleware() {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3001')
    .split(',')
    .map(o => o.trim());

  // Railway otomatik domain destegi
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    allowedOrigins.push(`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
  }
  // Also allow APP_URL if set
  if (process.env.APP_URL) {
    allowedOrigins.push(process.env.APP_URL);
  }

  return cors({
    origin: (origin, cb) => {
      // Allow same-origin requests (no Origin header) and allowed origins
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error('CORS not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
}

module.exports = { createCorsMiddleware };
