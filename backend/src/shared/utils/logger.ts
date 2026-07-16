/**
 * GradGrid — Structured Logger
 *
 * Centralized logging utility built on pino.
 * Provides structured JSON logging with severity levels.
 */

import pino from 'pino';
import { config } from '../../config';

const transport = config.isDev
  ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
        ignore: 'pid,hostname',
      },
    }
  : undefined;

export const logger = pino({
  level: config.log.level,
  transport,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'body.password',
      'body.token',
      'body.secret',
    ],
    censor: '[REDACTED]',
  },
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
});

/**
 * Creates a child logger with contextual bindings.
 * Use this to add module/request context to logs.
 */
export function createContextLogger(context: Record<string, unknown>) {
  return logger.child(context);
}

/**
 * Audit logger — writes immutable audit trail entries.
 * In production, this would write to a separate audit log index/table.
 */
export function auditLog(
  action: string,
  metadata: {
    userId: string;
    role: string;
    institutionId?: string;
    ipAddress?: string;
    userAgent?: string;
    resourceType: string;
    resourceId?: string;
    details?: Record<string, unknown>;
  }
): void {
  logger.info(
    {
      audit: true,
      timestamp: new Date().toISOString(),
      action,
      ...metadata,
    },
    `[AUDIT] ${action}`
  );
}
