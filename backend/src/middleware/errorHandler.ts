/**
 * GradGrid — Error Handler Middleware
 *
 * Global error handler that transforms all errors into
 * consistent API response format.
 */

import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { AppError } from '../shared/errors';
import { logger } from '../shared/utils/logger';
import { config } from '../config';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Express requires the four-argument error-handler signature.
  void _next;

  // Log the error
  if (err instanceof AppError && err.isOperational) {
    logger.warn({ err, requestId: req.id }, 'Operational error');
  } else {
    logger.error({ err, requestId: req.id }, 'Unexpected error');
  }

  // Determine status code
  const statusCode =
    err instanceof AppError
      ? err.statusCode
      : httpStatus.INTERNAL_SERVER_ERROR;

  // Determine error code
  const code =
    err instanceof AppError ? err.code : 'INTERNAL_ERROR';

  // Details for validation errors
  const details =
    err instanceof AppError && 'details' in err && err.details
      ? err.details
      : undefined;

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: err.message || httpStatus[statusCode as keyof typeof httpStatus],
      ...(details && { details }),
      ...(config.isDev && !(err instanceof AppError && err.isOperational)
        ? { stack: err.stack }
        : {}),
    },
  });
}
