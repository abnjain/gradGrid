/**
 * GradGrid — Prisma Client Singleton
 *
 * Implements the singleton pattern for PrismaClient to prevent
 * multiple instances during hot-reload in development.
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { config } from './index';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const pool = new pg.Pool({ connectionString: config.db.url });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      config.isDev
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
  });

if (!config.isProd) {
  globalForPrisma.prisma = prisma;
}
