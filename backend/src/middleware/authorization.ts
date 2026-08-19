/**
 * GradGrid — Authorization Middleware
 *
 * Guards routes based on required permissions.
 * Must be used after the authenticate middleware.
 *
 * Permission resolution cascade:
 *   1. Redis cache (fast, if enabled)
 *   2. Database via PermissionService
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../shared/types';
import { ForbiddenError, UnauthorizedError } from '../shared/errors';
import { permissionService } from '../modules/rbac/permission.service';

async function resolvePermissions(req: Request): Promise<string[]> {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    throw new UnauthorizedError('Authentication required');
  }

  const resolved = await permissionService.resolvePermissions(user.id, user.institutionId);
  user.permissions = resolved.keys;
  if (resolved.roleName) user.roleName = resolved.roleName;
  if (resolved.roleId) user.roleId = resolved.roleId;
  return resolved.keys;
}

/**
 * Middleware that loads permissions into `req.user.permissions`.
 * Attach after `authenticate` and before `requirePermissions`.
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

export function requirePermissions(...permissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    const hasAll = permissions.every((perm) => user.permissions.includes(perm));
    if (!hasAll) {
      throw new ForbiddenError(`Missing required permissions: ${permissions.join(', ')}`);
    }

    next();
  };
}

export function requireAnyPermission(...permissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    const hasAny = permissions.some((perm) => user.permissions.includes(perm));
    if (!hasAny) {
      throw new ForbiddenError(`Missing any of required permissions: ${permissions.join(', ')}`);
    }

    next();
  };
}

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

export function requirePlatformUser(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    throw new UnauthorizedError('Authentication required');
  }
  if (user.userType !== 'platform') {
    throw new ForbiddenError('Platform access required');
  }
  next();
}
