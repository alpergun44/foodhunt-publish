/**
 * FoodHunt — Structured Logger
 * Winston-style logging with file + console output
 */
const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', 'logs');
fs.mkdirSync(LOG_DIR, { recursive: true });

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

function formatMsg(level, message, meta = {}) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  });
}

function shouldLog(level) {
  return LEVELS[level] <= LEVELS[LOG_LEVEL];
}

function writeToFile(line) {
  const date = new Date().toISOString().slice(0, 10);
  const logFile = path.join(LOG_DIR, `foodhunt-${date}.log`);
  fs.appendFile(logFile, line + '\n', (err) => {
    if (err) console.error('Log write failed:', err.message);
  });
}

const logger = {};
for (const level of Object.keys(LEVELS)) {
  logger[level] = (message, meta = {}) => {
    if (!shouldLog(level)) return;
    const line = formatMsg(level, message, meta);
    if (level === 'error') console.error(line);
    else if (level === 'warn') console.warn(line);
    else console.log(line);
    writeToFile(line);
  };
}

// Request logger middleware
logger.requestMiddleware = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const meta = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration_ms: duration,
      ip: req.ip,
      user_agent: req.get('user-agent')?.slice(0, 100),
    };
    if (res.statusCode >= 500) logger.error('Request failed', meta);
    else if (res.statusCode >= 400) logger.warn('Client error', meta);
    else logger.info('Request completed', meta);
  });
  next();
};

module.exports = logger;
