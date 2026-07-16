/**
 * GradGrid — Request ID Middleware
 *
 * Attaches a unique request ID to every incoming request
 * for tracing and logging correlation.
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export function requestId(req: Request, _res: Response, next: NextFunction): void {
  req.id = (req.headers['x-request-id'] as string) || uuidv4();
  next();
}
