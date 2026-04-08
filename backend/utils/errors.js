/**
 * FoodHunt — Custom Error Classes & Error Handler Middleware
 */

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.field = field;
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} bulunamadi`, 404, 'NOT_FOUND');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Yetkisiz erisim') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Erisim reddedildi') {
    super(message, 403, 'FORBIDDEN');
  }
}

class RateLimitError extends AppError {
  constructor(retryAfter = 60) {
    super('Cok fazla istek. Lutfen bekleyin.', 429, 'RATE_LIMIT');
    this.retryAfter = retryAfter;
  }
}

// Global error handler middleware
function errorHandler(err, req, res, _next) {
  const logger = require('./logger');

  if (err.isOperational) {
    logger.warn('Operational error', {
      code: err.code,
      message: err.message,
      path: req.originalUrl,
      method: req.method,
    });

    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.field && { field: err.field }),
        ...(err.retryAfter && { retry_after: err.retryAfter }),
      },
    });
  }

  // Unexpected errors — send to Sentry if available
  try {
    const Sentry = require('@sentry/node');
    if (Sentry.isInitialized && Sentry.isInitialized()) {
      Sentry.captureException(err, { extra: { path: req.originalUrl, method: req.method } });
    }
  } catch (_) { /* Sentry not installed or not initialized */ }

  logger.error('Unexpected error', {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Beklenmeyen bir hata olustu',
    },
  });
}

// Async route wrapper — eliminates try/catch boilerplate
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  RateLimitError,
  errorHandler,
  asyncHandler,
};
