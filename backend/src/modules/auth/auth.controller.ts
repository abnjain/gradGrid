/**
 * GradGrid — Auth Controller
 *
 * HTTP layer for authentication endpoints.
 * Refresh token is set as an httpOnly cookie for XSS protection.
 * Access token remains in the response body for in-memory storage on the client.
 */

import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { AuthService } from './auth.service';
import { config } from '../../config';
import { AuthenticatedRequest } from '../../shared/types';

const authService = new AuthService();

/**
 * Cookie configuration for the refresh token.
 * - httpOnly: prevents JavaScript access (XSS protection)
 * - secure: only sent over HTTPS in production
 * - sameSite: strict prevents CSRF
 * - maxAge: matches refresh token expiry
 * - path: only sent to the refresh endpoint
 */
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.isProd,
  sameSite: 'strict' as const,
  path: `${config.api.prefix}/auth/refresh`,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  /**
   * POST /api/v1/auth/login
   *
   * Sets refreshToken as httpOnly cookie on success.
   * Also returns it in the response body for backward compatibility.
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];
      const result = await authService.login(req.body, ipAddress, userAgent);

      // Set refresh token as httpOnly cookie — never expose to JS
      const { refreshToken, ...publicTokens } = result.tokens;
      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

      res.status(httpStatus.OK).json({
        success: true,
        data: {
          user: result.user,
          tokens: publicTokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.register(req.body);
      res.status(httpStatus.CREATED).json({
        success: true,
        data: { user },
        message: 'User registered successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/refresh
   *
   * Reads refreshToken from httpOnly cookie first, falls back to request body.
   * Rotates the token and sets the new one as a cookie.
   */
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      // Prefer httpOnly cookie over body (body kept for backward compat / mobile clients)
      const token = req.cookies?.refreshToken || req.body.refreshToken;

      if (!token) {
        res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          error: {
            code: 'REFRESH_TOKEN_MISSING',
            message: 'Refresh token is required',
          },
        });
        return;
      }

      const tokens = await authService.refreshToken(token);

      // Rotate the httpOnly cookie — never expose the new refresh token to JS
      const { refreshToken, ...publicTokens } = tokens;
      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

      res.status(httpStatus.OK).json({
        success: true,
        data: { tokens: publicTokens },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   *
   * Clears the refresh token cookie.
   * Token invalidation should be implemented in the service layer.
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const { id: userId, sessionId, userType } = authReq.user;

      // Deactivate the session server-side
      await authService.logout(sessionId, userId, userType);

      // Clear the refresh token cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: config.isProd,
        sameSite: 'strict' as const,
        path: `${config.api.prefix}/auth/refresh`,
      });

      res.status(httpStatus.OK).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/me
   */
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(httpStatus.OK).json({
        success: true,
        data: { user: (req as any).user },
      });
    } catch (error) {
      next(error);
    }
  }
}
