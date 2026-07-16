/**
 * GradGrid — Application Configuration
 *
 * Loads environment variables and provides a typed config object.
 * All secrets are sourced from process.env (never hardcoded).
 */

import 'dotenv/config';

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  host: process.env.HOST || '0.0.0.0',

  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  db: {
    url: process.env.DATABASE_URL!,
  },

  auth: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || 'dev-access-secret',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret',
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },

  encryption: {
    key: process.env.ENCRYPTION_KEY || '',
    masterKey: process.env.MASTER_ENCRYPTION_KEY || '',
  },

  api: {
    prefix: process.env.API_PREFIX || '/api/v1',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || '',
  },

  log: {
    level: process.env.LOG_LEVEL || 'info',
  },

  /**
   * Redis cache — optional. Only connects if REDIS_URL is set.
   * Used for permission caching, rate limiting, and session store.
   */
  redis: {
    url: process.env.REDIS_URL || '',
    enabled: !!process.env.REDIS_URL,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'gradgrid:',
  },
} as const;
