/**
 * GradGrid — AppError Classes
 *
 * Standardized error classes for consistent API error responses.
 * Every thrown AppError maps to a specific HTTP status code.
 */

import httpStatus from 'http-status';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;

  constructor(
    statusCode: number,
    message: string,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(httpStatus.NOT_FOUND, `${resource} not found`, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(httpStatus.UNAUTHORIZED, message, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(httpStatus.FORBIDDEN, message, 'FORBIDDEN');
  }
}

export class ValidationError extends AppError {
  public readonly details?: Record<string, unknown>;

  constructor(message: string = 'Validation failed', details?: Record<string, unknown>) {
    super(httpStatus.BAD_REQUEST, message, 'VALIDATION_ERROR');
    this.details = details;
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(httpStatus.CONFLICT, message, 'CONFLICT');
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request') {
    super(httpStatus.BAD_REQUEST, message, 'BAD_REQUEST');
  }
}

export class InternalError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(httpStatus.INTERNAL_SERVER_ERROR, message, 'INTERNAL_ERROR', false);
  }
}
