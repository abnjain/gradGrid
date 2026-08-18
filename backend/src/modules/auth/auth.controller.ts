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
import { SignupRequestService } from '../platform/signup-request.service';
import { config } from '../../config';
import { AuthenticatedRequest } from '../../shared/types';

const authService = new AuthService();
const signupService = new SignupRequestService();

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
   * POST /api/v1/auth/register-institution
   * Submit a self-service institution signup application (pending admin approval).
   */
  async registerInstitution(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await signupService.submitRequest(req.body);
      res.status(httpStatus.CREATED).json({
        success: true,
        data: result,
        message: 'Application submitted. Please verify your email.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/verify-email
   */
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await signupService.verifyEmail(req.body.email, req.body.otp);
      res.status(httpStatus.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/resend-otp
   */
  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await signupService.resendOtp(req.body.email);
      res.status(httpStatus.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/signup-status?email=
   */
  async signupStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const email = String(req.query.email || '');
      const result = await signupService.getSignupStatus(email);
      res.status(httpStatus.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @deprecated Use registerInstitution
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
      const authUser = (req as AuthenticatedRequest).user;
      const user = await authService.getProfile(authUser.id);
      res.status(httpStatus.OK).json({
        success: true,
        data: { user: { ...user, sessionId: authUser.sessionId } },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/forgot-password
   *
   * Sends a password reset email. Always responds 200 when the email
   * is valid — even for unknown accounts (prevents user enumeration).
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.forgotPassword(req.body.email);
      res.status(httpStatus.OK).json({
        success: true,
        message: 'If that email is registered, a password reset link has been sent',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/reset-password
   *
   * Exchanges a single-use reset token for a new password.
   */
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.resetPassword(req.body.token, req.body.password);
      res.status(httpStatus.OK).json({
        success: true,
        message: 'Password has been reset. Please sign in with your new password.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/auth/profile
   *
   * Updates the authenticated user's profile (first/last name, phone).
   */
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthenticatedRequest).user;
      const user = await authService.updateProfile(authUser.id, {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone ?? null,
      });
      res.status(httpStatus.OK).json({
        success: true,
        data: { user },
        message: 'Profile updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/change-password
   *
   * Verifies the current password, then sets a new one.
   * Keeps the current session; revokes all others.
   */
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthenticatedRequest).user;
      await authService.changePassword(authUser.id, authUser.sessionId, {
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword,
      });
      res.status(httpStatus.OK).json({
        success: true,
        message: 'Password changed successfully. Other sessions have been signed out.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/sessions
   *
   * Lists all of the authenticated user's sessions (most recent first).
   */
  async listSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthenticatedRequest).user;
      const sessions = await authService.listSessions(authUser.id);
      res.status(httpStatus.OK).json({
        success: true,
        data: { sessions },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/auth/sessions/:sessionId
   *
   * Revokes a session. The current session cannot be revoked here.
   */
  async revokeSession(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthenticatedRequest).user;
      const sessionId = String(req.params.sessionId);
      const result = await authService.revokeSession(
        authUser.id,
        sessionId,
        authUser.sessionId
      );
      res.status(httpStatus.OK).json({
        success: true,
        data: result,
        message: 'Session revoked successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
