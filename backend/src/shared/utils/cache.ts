/**
 * GradGrid — Redis Cache Utility
 *
 * Optional Redis-based caching layer for permissions, sessions, and rate limiting.
 * Only connects if REDIS_URL is configured — no-op otherwise.
 * Swap in your own Redis client (ioredis, redis) by implementing the ICache interface.
 */

import { config } from '../../config';
import { createContextLogger } from './logger';

const logger = createContextLogger({ module: 'cache' });

// ---------------------------------------------------------------------------
// Cache interface — implement this for any backend (Redis, Memcached, in-memory)
// ---------------------------------------------------------------------------
export interface ICache {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  /** Clear all keys matching the pattern (e.g. "gradgrid:permissions:*") */
  delPattern(pattern: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Null cache — used when Redis is not configured
// ---------------------------------------------------------------------------
class NullCache implements ICache {
  async get<T>(): Promise<T | null> {
    return null;
  }
  async set(): Promise<void> {
    // no-op
  }
  async del(): Promise<void> {
    // no-op
  }
  async exists(): Promise<boolean> {
    return false;
  }
  async delPattern(): Promise<void> {
    // no-op
  }
}

// ---------------------------------------------------------------------------
// Cache instance — export this, use it everywhere
// ---------------------------------------------------------------------------
let cacheInstance: ICache = new NullCache();

/**
 * Initialise the cache. Call once at server startup.
 * If REDIS_URL is set, connects to Redis; otherwise stays a no-op.
 *
 * @example
 *   import { initCache } from './shared/utils/cache';
 *   await initCache();
 */
export async function initCache(): Promise<void> {
  if (!config.redis.enabled) {
    logger.info('Redis not configured — cache disabled');
    return;
  }

  try {
    // Dynamically import ioredis so the dependency is optional
    const Redis = (await import('ioredis')).default;
    const client = new Redis(config.redis.url, {
      keyPrefix: config.redis.keyPrefix,
      lazyConnect: true,
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        if (times > 5) {
          logger.error('Redis connection failed after 5 retries — falling back to null cache');
          return null; // stop retrying
        }
        return Math.min(times * 200, 3000);
      },
    });

    await client.connect();
    logger.info('Redis connected');

    // Implement the ICache interface over ioredis
    cacheInstance = {
      async get<T>(key: string): Promise<T | null> {
        const raw = await client.get(key);
        if (!raw) return null;
        try {
          return JSON.parse(raw) as T;
        } catch {
          return raw as unknown as T;
        }
      },
      async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
        const serialised = typeof value === 'string' ? value : JSON.stringify(value);
        await client.setex(key, ttlSeconds, serialised);
      },
      async del(key: string): Promise<void> {
        await client.del(key);
      },
      async exists(key: string): Promise<boolean> {
        return (await client.exists(key)) === 1;
      },
      async delPattern(pattern: string): Promise<void> {
        let cursor = '0';
        do {
          const [nextCursor, keys] = await client.scan(
            cursor,
            'MATCH',
            `${config.redis.keyPrefix}${pattern}`,
            'COUNT',
            100
          );
          cursor = nextCursor;
          if (keys.length > 0) {
            await client.del(...keys);
          }
        } while (cursor !== '0');
      },
    };

    client.on('error', (err) => {
      logger.error({ err }, 'Redis client error');
    });

    client.on('end', () => {
      logger.warn('Redis connection closed');
    });
  } catch (error) {
    logger.warn({ err: error }, 'Redis not available — cache disabled');
    cacheInstance = new NullCache();
  }
}

/**
 * Get the current cache instance. Always returns a valid ICache
 * (no-op if Redis is not configured or connection failed).
 */
export function getCache(): ICache {
  return cacheInstance;
}

// ---------------------------------------------------------------------------
// Permission-specific helpers
// ---------------------------------------------------------------------------

const PERMISSION_TTL = 300; // 5 minutes

/**
 * Build a cache key for a user's permission set.
 */
function permissionCacheKey(userId: string, institutionId?: string | null): string {
  return `permissions:${userId}:${institutionId || 'platform'}`;
}

/**
 * Get cached permissions for a user. Returns null if not cached / Redis disabled.
 */
export async function getCachedPermissions(
  userId: string,
  institutionId?: string | null
): Promise<string[] | null> {
  const cache = getCache();
  return cache.get<string[]>(permissionCacheKey(userId, institutionId));
}

/**
 * Cache a user's permissions for 5 minutes.
 */
export async function setCachedPermissions(
  userId: string,
  permissions: string[],
  institutionId?: string | null
): Promise<void> {
  const cache = getCache();
  await cache.set(permissionCacheKey(userId, institutionId), permissions, PERMISSION_TTL);
}

/**
 * Invalidate cached permissions for a user (call after role change).
 */
export async function invalidatePermissionCache(
  userId: string,
  institutionId?: string | null
): Promise<void> {
  const cache = getCache();
  await cache.del(permissionCacheKey(userId, institutionId));
}
