/**
 * GradGrid — Server Entry Point
 *
 * Starts the HTTP server with graceful shutdown support.
 */

import app from './app';
import { config, validateProductionConfig } from './config';
import { logger } from './shared/utils/logger';
import { prisma } from './config/database';
import { initCache } from './shared/utils/cache';
import { verifyEmailTransport } from './shared/utils/email';

let server: ReturnType<typeof app.listen>;

async function main(): Promise<void> {
  validateProductionConfig();

  // Verify database connection
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error({ err: error }, 'Failed to connect to database');
    process.exit(1);
  }

  // Initialise optional Redis cache (only connects if REDIS_URL is set)
  if (config.redis.enabled) {
    await initCache();
  }

  if (config.isProd && !(await verifyEmailTransport())) {
    logger.error('SMTP is unavailable; refusing to start without transactional email');
    await prisma.$disconnect();
    process.exit(1);
  }

  server = app.listen(Number(config.port), () => {
    logger.info(
      {
        host: config.host,
        port: config.port,
        env: config.env,
        prefix: config.api.prefix,
      },
      `GradGrid API server started at http://${config.host}:${config.port}${config.api.prefix}`
    );
  });
}

/**
 * Graceful shutdown — closes DB and HTTP connections.
 */
async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, 'Shutdown signal received');

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');

      await prisma.$disconnect();
      logger.info('Database connection closed');

      process.exit(0);
    });

    // Force shutdown after 30s
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  } else {
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Graceful shutdown handlers
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Unhandled rejections
process.on('unhandledRejection', (reason: Error) => {
  logger.error({ err: reason }, 'Unhandled Promise rejection');
});

// Uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error({ err: error }, 'Uncaught exception');
  process.exit(1);
});

main();
