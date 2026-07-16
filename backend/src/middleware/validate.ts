/**
 * GradGrid — Validate Middleware
 *
 * Validates request bodies, query params, and path params
 * against Zod schemas.
 *
 * Usage:
 *   validate({ body: bodySchema })       // validate req.body
 *   validate({ query: querySchema })     // validate req.query
 *   validate({ params: paramsSchema })   // validate req.params
 *   validate({ body: loginBodySchema, query: paginationSchema })
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../shared/errors';

export interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Middleware factory that validates the request against provided Zod schemas.
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as Record<string, string>;
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as Record<string, string>;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
          code: e.code,
        }));
        throw new ValidationError('Validation failed', { fields: details });
      }
      throw error;
    }
  };
}
