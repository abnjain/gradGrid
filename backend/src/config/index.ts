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
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
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

  /**
   * Transactional email via an HTTPS provider. Resend is the default Render
   * provider because free Render web services cannot open SMTP ports.
   * Leave RESEND_API_KEY empty in development to log emails instead.
   */
  email: {
    provider: (process.env.EMAIL_PROVIDER || 'resend').toLowerCase(),
    resendApiKey: process.env.RESEND_API_KEY || '',
    from: process.env.EMAIL_FROM || 'GradGrid <no-reply@gradgrid.app>',
  },

  /**
   * Frontend origin — used to build password reset links.
   */
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
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

  /** Behind Render / reverse proxy — trust X-Forwarded-* headers */
  trustProxy: process.env.TRUST_PROXY === 'true',

  cookies: {
    path: process.env.COOKIE_PATH || '',
    sameSite: (process.env.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none' | undefined) || undefined,
  },
} as const;

const INSECURE_SECRET_MARKERS = ['change-me', 'dev-access-secret', 'dev-refresh-secret'];

function isInsecureSecret(value: string): boolean {
  if (!value || value.length < 32) return true;
  const lower = value.toLowerCase();
  return INSECURE_SECRET_MARKERS.some((marker) => lower.includes(marker));
}

/** Fail fast in production when required secrets are missing or still use dev defaults. */
export function validateProductionConfig(): void {
  if (!config.isProd) return;

  const missing: string[] = [];

  if (!config.db.url) missing.push('DATABASE_URL');
  if (isInsecureSecret(config.auth.accessTokenSecret)) missing.push('ACCESS_TOKEN_SECRET');
  if (isInsecureSecret(config.auth.refreshTokenSecret)) missing.push('REFRESH_TOKEN_SECRET');
  if (!config.encryption.key || config.encryption.key.length < 32) missing.push('ENCRYPTION_KEY');
  if (!config.encryption.masterKey || config.encryption.masterKey.length < 32) {
    missing.push('MASTER_ENCRYPTION_KEY');
  }

  // Signup verification, password resets, and account invitations require a
  // real HTTPS email provider in production. Do not silently report success
  // while the email service is only using the development log fallback.
  if (config.email.provider !== 'resend') {
    missing.push('EMAIL_PROVIDER=resend');
  } else {
    if (!config.email.resendApiKey) missing.push('RESEND_API_KEY');
    if (!process.env.EMAIL_FROM) missing.push('EMAIL_FROM');
  }

  if (missing.length > 0) {
    throw new Error(
      `Production configuration invalid. Set secure values for: ${missing.join(', ')}`
    );
  }
}
