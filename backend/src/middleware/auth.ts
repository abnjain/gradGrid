/**
 * GradGrid — Authentication Middleware
 *
 * Verifies JWT access tokens from the Authorization header.
 * Checks that the session is still active (not logged out).
 * Attaches the authenticated user to req.user.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthenticatedRequest, AuthUser } from '../shared/types';
import { UnauthorizedError } from '../shared/errors';
import { AuthRepository } from '../modules/auth/auth.repository';

const authRepository = new AuthRepository();

interface JwtPayload {
  sub: string;
  email: string;
  userType: 'platform' | 'institution';
  sessionId: string;
  institutionId?: string | null;
  organizationId?: string | null;
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(
      token,
      config.auth.accessTokenSecret
    ) as JwtPayload;

    // Verify the session is still active (not logged out / deactivated)
    const session = await authRepository.findActiveSession(payload.sessionId);
    if (!session) {
      throw new UnauthorizedError('Session has been terminated. Please login again.');
    }

    (req as AuthenticatedRequest).user = {
      id: payload.sub,
      email: payload.email,
      userType: payload.userType,
      institutionId: payload.institutionId,
      organizationId: payload.organizationId,
      sessionId: payload.sessionId,
      roleId: '',
      roleName: '',
      permissions: [],
    } satisfies AuthUser;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Access token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid access token');
    }
    throw error;
  }
}

/**
 * Optional authentication — attaches user if token present,
 * but does not fail if missing.
 */
export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(
      token,
      config.auth.accessTokenSecret
    ) as JwtPayload;

    (req as AuthenticatedRequest).user = {
      id: payload.sub,
      email: payload.email,
      userType: payload.userType,
      institutionId: payload.institutionId,
      organizationId: payload.organizationId,
      sessionId: payload.sessionId,
      roleId: '',
      roleName: '',
      permissions: [],
    };
  } catch {
    // Silently ignore invalid tokens for optional auth
  }

  next();
}
