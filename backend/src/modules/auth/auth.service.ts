/**
 * GradGrid — Auth Service
 *
 * Business logic for authentication: login, token generation,
 * token refresh, logout, and password management.
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../../config';
import { AuthRepository } from './auth.repository';
import { TokenPair, LoginRequest, LoginResponse } from './auth.types';
import { hashPassword, verifyPassword } from '../../shared/utils/password';
import { sendEmail } from '../../shared/utils/email';
import {
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  BadRequestError,
  InternalError,
  EmailNotVerifiedError,
} from '../../shared/errors';
import { SignupRequestService } from '../platform/signup-request.service';
import { TenantContextService } from './tenant-context.service';
import { permissionService } from '../rbac/permission.service';
import { createContextLogger, auditLog } from '../../shared/utils/logger';

const logger = createContextLogger({ module: 'auth' });

export class AuthService {
  private repository: AuthRepository;
  private signupService: SignupRequestService;
  private tenantContextService: TenantContextService;

  constructor() {
    this.repository = new AuthRepository();
    this.signupService = new SignupRequestService();
    this.tenantContextService = new TenantContextService();
  }

  /**
   * Authenticate a user with email and password.
   */
  async login(
    data: LoginRequest,
    ipAddress?: string,
    userAgent?: string
  ): Promise<LoginResponse> {
    logger.info({ email: data.email }, 'Login attempt');

    await this.signupService.checkLoginBlocked(data.email);

    const user = await this.repository.findUserByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const currentPassword = user.user_passwords[0];
    if (!currentPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await verifyPassword(data.password, currentPassword.password_hash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.is_active) {
      throw new UnauthorizedError('Account is deactivated');
    }

    if (!user.email_verified) {
      throw new EmailNotVerifiedError();
    }

    // Generate tokens
    // Create session first
    const session = await this.repository.createSession({
      userId: user.id,
      ipAddress: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // matches access token expiry
    });

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.user_type,
      session.id,
      user.user_type === 'platform' ? user.institution_id : null,
      null
    );
    await this.repository.updateLastLogin(user.id);

    auditLog('LOGIN_SUCCESS', {
      userId: user.id,
      role: user.user_type,
      institutionId: user.institution_id || undefined,
      ipAddress,
      userAgent,
      resourceType: 'session',
      details: { email: data.email },
    });

    const resolved = await permissionService.resolveFresh(
      user.id,
      user.user_type === 'platform' ? null : user.institution_id
    );

    return {
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        userType: user.user_type,
        roleName:
          resolved.roleName ||
          (user.user_type === 'platform' ? 'Platform User' : 'Institution User'),
        permissions: resolved.keys,
        sessionId: session.id,
      },
      tokens,
    };
  }

  /**
   * Generate access and refresh token pair.
   */
  private async generateTokens(
    userId: string,
    email: string,
    userType: string,
    sessionId: string,
    institutionId?: string | null,
    organizationId?: string | null
  ): Promise<TokenPair> {
    const accessToken = jwt.sign(
      {
        sub: userId,
        email,
        userType,
        sessionId,
        institutionId: institutionId || undefined,
        organizationId: organizationId || undefined,
      },
      config.auth.accessTokenSecret,
      { expiresIn: config.auth.accessTokenExpiresIn as jwt.SignOptions['expiresIn'] }
    );

    const refreshTokenFamily = crypto.randomUUID();
    const refreshTokenValue = crypto.randomUUID();
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshTokenValue)
      .digest('hex');

    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

    await this.repository.createRefreshToken({
      userId,
      tokenHash,
      familyId: refreshTokenFamily,
      expiresAt: refreshTokenExpiry,
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }

  /**
   * Refresh an access token using a valid refresh token.
   */
  async refreshToken(
    refreshTokenValue: string
  ): Promise<TokenPair> {
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshTokenValue)
      .digest('hex');

    const storedToken = await this.repository.findRefreshToken(tokenHash);
    if (!storedToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (storedToken.is_revoked) {
      // Token reuse detected — revoke entire family
      await this.repository.revokeRefreshTokenFamily(storedToken.family_id);
      throw new UnauthorizedError('Refresh token has been revoked');
    }

    if (new Date() > storedToken.expires_at) {
      throw new UnauthorizedError('Refresh token has expired');
    }

    // Revoke the used token (rotation)
    await this.repository.revokeRefreshTokenFamily(storedToken.family_id);

    const user = await this.repository.findUserById(storedToken.user_id);
    if (!user || !user.is_active) {
      throw new UnauthorizedError('User not found or deactivated');
    }

    let session = await this.repository.findLatestActiveSession(user.id);
    if (!session) {
      session = await this.repository.createSession({
        userId: user.id,
        ipAddress: 'unknown',
        userAgent: 'token_refresh',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      });
    } else {
      await this.repository.touchSession(session.id);
    }

    let organizationId: string | null = null;
    const institutionId = session.institution_id;
    if (institutionId) {
      const tenantContext = await this.tenantContextService.resolveTenantContext(
        user.id,
        institutionId
      );
      organizationId = tenantContext?.organizationId || null;
    }

    return this.generateTokens(
      user.id,
      user.email,
      user.user_type,
      session.id,
      institutionId,
      organizationId
    );
  }

  /**
   * Register a new user (institution-scoped).
   */
  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    institutionId?: string;
  }) {
    const existing = await this.repository.findUserByEmail(data.email);
    if (existing) {
      throw new ConflictError('A user with this email already exists');
    }

    const user = await this.repository.createUser({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      user_type: 'institution',
      institution_id: data.institutionId || null,
    });

    const passwordHash = await hashPassword(data.password);
    await this.repository.createPassword(user.id, passwordHash);

    auditLog('USER_REGISTERED', {
      userId: user.id,
      role: user.user_type,
      institutionId: user.institution_id || undefined,
      resourceType: 'user',
      resourceId: user.id,
      details: { email: data.email },
    });

    logger.info({ userId: user.id }, 'User registered');
    return user;
  }

  /**
   * Get a user's public profile (used by GET /auth/me).
   */
  async getProfile(userId: string, sessionInstitutionId?: string | null) {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const tenantContext = await this.tenantContextService.resolveTenantContext(
      userId,
      sessionInstitutionId || null
    );

    const resolved = await permissionService.resolveFresh(
      userId,
      user.user_type === 'platform' ? null : tenantContext?.institutionId || user.institution_id
    );

    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone || '',
      userType: user.user_type,
      roleName: resolved.roleName || undefined,
      permissions: resolved.keys,
      institutionId: tenantContext?.institutionId || null,
      organizationId: tenantContext?.organizationId || null,
      organizationName: tenantContext?.organizationName || null,
      institutionName: tenantContext?.institutionName || null,
      tenantContext,
    };
  }

  /**
   * Update a user's profile (first/last name, phone).
   */
  async updateProfile(
    userId: string,
    data: { firstName: string; lastName: string; phone?: string | null }
  ) {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await this.repository.updateUser(userId, {
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone === '' ? null : data.phone,
    });

    auditLog('PROFILE_UPDATED', {
      userId,
      role: user.user_type,
      institutionId: user.institution_id || undefined,
      resourceType: 'user',
      resourceId: userId,
      details: { firstName: data.firstName, lastName: data.lastName },
    });

    logger.info({ userId }, 'User profile updated');

    return {
      id: user.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: user.email,
      phone: data.phone === '' ? '' : data.phone || '',
      userType: user.user_type,
      institutionId: user.institution_id,
    };
  }

  /**
   * Change a user's password after verifying the current password.
   * Keeps the current session active; revokes all other sessions.
   */
  async changePassword(
    userId: string,
    currentSessionId: string,
    data: { currentPassword: string; newPassword: string }
  ) {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const currentPassword = await this.repository.findCurrentPassword(userId);
    if (!currentPassword) {
      throw new UnauthorizedError('No password set for this account');
    }

    const isValid = await verifyPassword(data.currentPassword, currentPassword.password_hash);
    if (!isValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // New password must differ from the current one
    const isSame = await verifyPassword(data.newPassword, currentPassword.password_hash);
    if (isSame) {
      throw new BadRequestError('New password must be different from the current password');
    }

    const passwordHash = await hashPassword(data.newPassword);
    await this.repository.createPassword(userId, passwordHash);

    // Revoke all OTHER sessions (keep the current one alive so the user
    // stays signed in on this device).
    const sessions = await this.repository.listUserSessions(userId);
    for (const session of sessions) {
      if (session.id !== currentSessionId && session.is_active) {
        await this.repository.deactivateSession(session.id);
      }
    }

    // Revoke all refresh tokens belonging to other sessions.
    const existingTokens = await this.repository.findUserRefreshTokens(userId);
    for (const t of existingTokens) {
      if (!t.is_revoked) {
        await this.repository.revokeRefreshTokenFamily(t.family_id);
      }
    }

    auditLog('PASSWORD_CHANGED', {
      userId,
      role: user.user_type,
      institutionId: user.institution_id || undefined,
      resourceType: 'user',
      resourceId: userId,
      details: { keepSession: currentSessionId },
    });

    logger.info({ userId }, 'User password changed');

    return { changed: true };
  }

  /**
   * List a user's active sessions (most recent first).
   */
  async listSessions(userId: string) {
    const sessions = await this.repository.listUserSessions(userId);

    return sessions.map((s) => ({
      id: s.id,
      deviceInfo: s.device_info,
      ipAddress: s.ip_address,
      isActive: s.is_active,
      lastActiveAt: s.last_active_at,
      createdAt: s.created_at,
      loggedOutAt: s.logged_out_at,
    }));
  }

  /**
   * Revoke a session (logout remotely). Prevents revoking the current session.
   */
  async revokeSession(userId: string, sessionId: string, currentSessionId: string) {
    if (sessionId === currentSessionId) {
      throw new BadRequestError('Cannot revoke the current session. Use Logout instead');
    }

    const user = await this.repository.findUserById(userId);
    const sessions = await this.repository.listUserSessions(userId);
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) {
      throw new NotFoundError('Session not found');
    }

    if (!session.is_active) {
      return { revoked: false, alreadyInactive: true };
    }

    await this.repository.deactivateSession(sessionId);

    auditLog('SESSION_REVOKED', {
      userId,
      role: user?.user_type || 'institution',
      resourceType: 'session',
      resourceId: sessionId,
      details: { currentSession: currentSessionId },
    });

    logger.info({ userId, sessionId }, 'Session revoked');

    return { revoked: true };
  }

  /**
   * Request a password reset email.
   *
   * Always returns success when the email format is valid, even if the
   * account does not exist — prevents user enumeration.
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await this.repository.findUserByEmail(email);

    // No user — simulate the flow so the response is indistinguishable.
    if (!user) {
      logger.info({ email }, 'Password reset requested for unknown email');
      return;
    }

    if (!user.is_active) {
      logger.info({ userId: user.id }, 'Password reset skipped — user inactive');
      return;
    }

    // Single-use opaque token, stored as SHA-256 hash.
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    await this.repository.createPasswordReset({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const resetUrl = `${config.frontend.url}/reset-password?token=${rawToken}`;

    const sent = await sendEmail({
      to: user.email,
      subject: 'Reset your GradGrid password',
      text: [
        'Hello,',
        '',
        'We received a request to reset your GradGrid password.',
        'Click the link below to choose a new password. This link expires in 1 hour.',
        '',
        resetUrl,
        '',
        'If you did not request this, you can safely ignore this email.',
        '',
        '— The GradGrid Team',
      ].join('\n'),
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111827;">
          <h2 style="margin:0 0 16px;">Reset your GradGrid password</h2>
          <p style="line-height:1.6;margin:0 0 20px;">
            We received a request to reset your password. Click the button below to
            choose a new one. This link expires in <strong>1 hour</strong>.
          </p>
          <a href="${resetUrl}" style="display:inline-block;background:#0d9488;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:8px;">
            Reset password
          </a>
          <p style="line-height:1.6;margin:20px 0 0;color:#6b7280;font-size:13px;">
            Or copy this link into your browser:<br />
            ${resetUrl}
          </p>
          <p style="line-height:1.6;margin:20px 0 0;color:#6b7280;font-size:13px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    if (!sent) {
      throw new InternalError('Failed to send password reset email');
    }

    auditLog('PASSWORD_RESET_REQUESTED', {
      userId: user.id,
      role: user.user_type,
      institutionId: user.institution_id || undefined,
      resourceType: 'user',
      resourceId: user.id,
      details: { email },
    });

    logger.info({ userId: user.id }, 'Password reset email sent');
  }

  /**
   * Reset a password using a single-use reset token.
   * Invalidates all other outstanding reset tokens and active sessions.
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const record = await this.repository.findPasswordReset(tokenHash);

    if (!record || record.is_used) {
      throw new BadRequestError('This reset link is invalid or has already been used');
    }

    if (new Date() > record.expires_at) {
      throw new BadRequestError('This reset link has expired. Please request a new one');
    }

    const user = record.user;
    if (!user || !user.is_active) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Hash the new password and mark every outstanding token used.
    const passwordHash = await hashPassword(newPassword);
    await this.repository.createPassword(user.id, passwordHash);
    await this.repository.invalidatePasswordResets(user.id);

    // Force re-login everywhere — kill all sessions + refresh tokens.
    await this.repository.deactivateAllUserSessions(user.id);
    const existingTokens = await this.repository.findUserRefreshTokens(user.id);
    for (const t of existingTokens) {
      if (!t.is_revoked) {
        await this.repository.revokeRefreshTokenFamily(t.family_id);
      }
    }

    auditLog('PASSWORD_RESET_COMPLETED', {
      userId: user.id,
      role: user.user_type,
      institutionId: user.institution_id || undefined,
      resourceType: 'user',
      resourceId: user.id,
    });

    logger.info({ userId: user.id }, 'Password reset completed');
  }

  /**
   * Logout — deactivate the user's session so the access token is immediately invalid.
   */
  async logout(sessionId: string, userId: string, userType: string) {
    await this.repository.deactivateSession(sessionId);

    auditLog('LOGOUT', {
      userId,
      role: userType,
      resourceType: 'session',
      details: { sessionId },
    });

    logger.info({ userId, sessionId }, 'User logged out');
  }
}
