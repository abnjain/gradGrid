/**
 * GradGrid — Authorization Middleware
 *
 * Guards routes based on required permissions.
 * Must be used after the authenticate middleware.
 *
 * Permission resolution cascade (when enabled):
 *   1. Redis cache (fast) → 2. JWT payload → 3. Database (fallback)
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../shared/types';
import { ForbiddenError, UnauthorizedError } from '../shared/errors';
import {
  getCachedPermissions,
} from '../shared/utils/cache';
import { config } from '../config';

// ---------------------------------------------------------------------------
// Permission loader — resolves via cascade: cache → JWT → DB
// ---------------------------------------------------------------------------

/**
 * Resolve the effective permission set for the authenticated user.
 *
 * Cascade:
 *   1. Redis cache (fast, if enabled)
 *   2. Database query (fallback — requires role/permission tables)
 *
 * Permissions are intentionally NOT embedded in the JWT token to keep the
 * payload small and allow permission changes to take effect immediately
 * (no need to wait for token expiry).
 *
 * The resolved set is stored in `req.user.permissions` and cached in Redis
 * (if enabled) for subsequent requests.
 */
async function resolvePermissions(req: Request): Promise<string[]> {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    throw new UnauthorizedError('Authentication required');
  }

  const { id: userId, institutionId } = user;

  // --- Level 1: Redis cache ---
  if (config.redis.enabled) {
    const cached = await getCachedPermissions(userId, institutionId);
    if (cached) {
      user.permissions = cached;
      return cached;
    }
  }

  // --- Level 2: Database fallback ---
  // This would load from DB via the auth repository.
  // For now, if cache is missing or disabled, deny access.
  // TODO: Implement DB fallback when role/permission tables are created.
  throw new ForbiddenError('No permissions found for this user');
}

// ---------------------------------------------------------------------------
// Middleware: load permissions into the request context
// ---------------------------------------------------------------------------

/**
 * Middleware that loads permissions into `req.user.permissions` using
 * the cascade resolver. Attach after `authenticate` and before `requirePermissions`.
 *
 * @example
 *   router.get('/students',
 *     authenticate,
 *     loadPermissions,
 *     requirePermissions('students.view'),
 *     controller.list
 *   );
 */
export async function loadPermissions(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await resolvePermissions(req);
    next();
  } catch (error) {
    next(error);
  }
}

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------

/**
 * Require that the authenticated user has ALL specified permissions.
 *
 * @param permissions - Array of permission keys (e.g., ['students.view', 'students.create'])
 */
export function requirePermissions(...permissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    const hasAll = permissions.every((perm) =>
      user.permissions.includes(perm)
    );

    if (!hasAll) {
      throw new ForbiddenError(
        `Missing required permissions: ${permissions.join(', ')}`
      );
    }

    next();
  };
}

/**
 * Require that the authenticated user has at least ONE of the specified permissions.
 */
export function requireAnyPermission(...permissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    const hasAny = permissions.some((perm) =>
      user.permissions.includes(perm)
    );

    if (!hasAny) {
      throw new ForbiddenError(
        `Missing any of required permissions: ${permissions.join(', ')}`
      );
    }

    next();
  };
}

/**
 * Require that the request is scoped to the user's institution.
 * Useful for institution-scoped routes to prevent cross-tenant access.
 */
export function requireInstitutionScope(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    throw new UnauthorizedError('Authentication required');
  }

  const requestedInstitutionId =
    req.params.institutionId || req.body.institutionId;

  if (
    requestedInstitutionId &&
    user.institutionId &&
    requestedInstitutionId !== user.institutionId
  ) {
    throw new ForbiddenError('Cross-institution access denied');
  }

  next();
}
