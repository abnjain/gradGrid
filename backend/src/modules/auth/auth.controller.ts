/**
 * GradGrid — Auth Controller
 *
 * Audience-aware HTTP layer for platform / institution / portal auth.
 */

import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { AuthService } from './auth.service';
import { SignupRequestService } from '../platform/signup-request.service';
import { TenantContextService } from './tenant-context.service';
import { config } from '../../config';
import { AuthenticatedRequest } from '../../shared/types';
import {
  AuthAudience,
  audienceForUserType,
  refreshCookieName,
} from './auth-audience';

const authService = new AuthService();
const signupService = new SignupRequestService();
const tenantContextService = new TenantContextService();

function getRefreshCookieOptions(audience: AuthAudience, overrides?: { path?: string }) {
  const defaultPath = `${config.api.prefix}/auth/${audience}/refresh`;
  const path = overrides?.path ?? (config.cookies.path || defaultPath);
  const sameSite = config.cookies.sameSite || (config.isProd ? 'strict' : 'lax');

  return {
    httpOnly: true,
    secure: config.isProd,
    sameSite: sameSite as 'strict' | 'lax' | 'none',
    path,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function clearAudienceRefreshCookies(res: Response, audience: AuthAudience) {
  const name = refreshCookieName(audience);
  const paths = new Set<string>([
    config.cookies.path || '/',
    `${config.api.prefix}/auth/${audience}/refresh`,
    `${config.api.prefix}/auth/refresh`,
    '/',
  ]);
  for (const path of paths) {
    res.clearCookie(name, getRefreshCookieOptions(audience, { path }));
    // Legacy single cookie during migration
    res.clearCookie('refreshToken', getRefreshCookieOptions(audience, { path }));
  }
}

function readRefreshToken(req: Request, audience: AuthAudience): string | undefined {
  const name = refreshCookieName(audience);
  return (
    req.cookies?.[name] ||
    req.cookies?.refreshToken ||
    req.body?.refreshToken ||
    undefined
  );
}

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction, audience: AuthAudience) {
    try {
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];
      const result = await authService.login(req.body, ipAddress, userAgent, audience);

      const { refreshToken, ...publicTokens } = result.tokens;
      res.cookie(refreshCookieName(audience), refreshToken, getRefreshCookieOptions(audience));

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

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await signupService.verifyEmail(req.body.email, req.body.otp);
      res.status(httpStatus.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await signupService.resendOtp(req.body.email);
      res.status(httpStatus.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async signupStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const email = String(req.query.email || '');
      const result = await signupService.getSignupStatus(email);
      res.status(httpStatus.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction, audience: AuthAudience) {
    try {
      const token = readRefreshToken(req, audience);

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

      const tokens = await authService.refreshToken(token, audience);
      const { refreshToken, ...publicTokens } = tokens;
      res.cookie(refreshCookieName(audience), refreshToken, getRefreshCookieOptions(audience));

      res.status(httpStatus.OK).json({
        success: true,
        data: { tokens: publicTokens },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const { id: userId, sessionId, userType } = authReq.user;
      await authService.logout(sessionId, userId, userType);
      const audience = audienceForUserType(userType);
      clearAudienceRefreshCookies(res, audience);

      res.status(httpStatus.OK).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthenticatedRequest).user;
      const user = await authService.getProfile(authUser.id, authUser.institutionId);
      res.status(httpStatus.OK).json({
        success: true,
        data: { user: { ...user, sessionId: authUser.sessionId } },
      });
    } catch (error) {
      next(error);
    }
  }

  async workspaces(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthenticatedRequest).user;
      const result = await tenantContextService.getWorkspaces(authUser.id, authUser.userType);
      res.status(httpStatus.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async selectContext(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthenticatedRequest).user;
      const result = await tenantContextService.selectContext(
        authUser.id,
        authUser.userType,
        authUser.sessionId,
        authUser.email,
        req.body
      );
      res.status(httpStatus.OK).json({
        success: true,
        data: {
          tokens: { accessToken: result.accessToken },
          context: result.context,
        },
        message: 'Workspace context selected',
      });
    } catch (error) {
      next(error);
    }
  }

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
