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
import {
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} from '../../shared/errors';
import { createContextLogger, auditLog } from '../../shared/utils/logger';

const logger = createContextLogger({ module: 'auth' });

export class AuthService {
  private repository: AuthRepository;

  constructor() {
    this.repository = new AuthRepository();
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

    // Generate tokens
    // Create session first
    const session = await this.repository.createSession({
      userId: user.id,
      ipAddress: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // matches access token expiry
    });

    const tokens = await this.generateTokens(user.id, user.email, user.user_type, session.id, user.institution_id);
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

    // Build permissions array (for MVP, this would come from role assignments)
    const permissions: string[] = [];

    return {
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        userType: user.user_type,
        roleName: user.user_type === 'platform' ? 'Platform User' : 'Institution User',
        permissions,
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
    institutionId?: string | null
  ): Promise<TokenPair> {
    const accessToken = jwt.sign(
      {
        sub: userId,
        email,
        userType,
        sessionId,
        institutionId,
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

    // Create new session for the refreshed token
    const session = await this.repository.createSession({
      userId: user.id,
      ipAddress: 'unknown',
      userAgent: 'token_refresh',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    return this.generateTokens(user.id, user.email, user.user_type, session.id, user.institution_id);
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

    logger.info({ userId: user.id }, 'User registered');
    return user;
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
