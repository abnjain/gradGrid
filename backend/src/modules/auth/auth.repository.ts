/**
 * GradGrid — Auth Repository
 *
 * Data access layer for authentication-related database operations.
 */

import { prisma } from '../../config/database';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.users.findUnique({
      where: { email },
      include: {
        user_passwords: {
          where: { is_current: true },
          take: 1,
        },
      },
    });
  }

  async findUserById(id: string) {
    return prisma.users.findUnique({
      where: { id },
      include: {
        role_assignments: {
          where: { deleted_at: null },
          include: {
            role: {
              include: {
                role_permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async createUser(data: {
    first_name: string;
    last_name: string;
    email: string;
    user_type: 'platform' | 'institution';
    institution_id?: string | null;
  }) {
    return prisma.users.create({ data });
  }

  async createPassword(userId: string, passwordHash: string) {
    // Deactivate any existing current passwords
    await prisma.user_passwords.updateMany({
      where: { user_id: userId, is_current: true },
      data: { is_current: false },
    });

    return prisma.user_passwords.create({
      data: {
        user_id: userId,
        password_hash: passwordHash,
        is_current: true,
      },
    });
  }

  async createRefreshToken(data: {
    userId: string;
    tokenHash: string;
    familyId: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.refresh_tokens.create({
      data: {
        user_id: data.userId,
        token_hash: data.tokenHash,
        family_id: data.familyId,
        expires_at: data.expiresAt,
        ip_address: data.ipAddress,
        device_info: data.userAgent,
      },
    });
  }

  async findRefreshToken(tokenHash: string) {
    return prisma.refresh_tokens.findFirst({
      where: { token_hash: tokenHash },
    });
  }

  async revokeRefreshTokenFamily(familyId: string) {
    return prisma.refresh_tokens.updateMany({
      where: { family_id: familyId, is_revoked: false },
      data: { is_revoked: true },
    });
  }

  async createSession(data: {
    userId: string;
    ipAddress: string;
    userAgent: string;
    deviceLabel?: string;
    expiresAt: Date;
  }) {
    return prisma.user_sessions.create({
      data: {
        user_id: data.userId,
        ip_address: data.ipAddress,
        device_info: data.userAgent,
        last_active_at: new Date(),
      },
    });
  }

  async updateLastLogin(userId: string) {
    return prisma.users.update({
      where: { id: userId },
      data: { updated_at: new Date() },
    });
  }

  async findActiveSession(sessionId: string) {
    return prisma.user_sessions.findFirst({
      where: { id: sessionId, is_active: true, logged_out_at: null },
    });
  }

  async deactivateSession(sessionId: string) {
    return prisma.user_sessions.update({
      where: { id: sessionId },
      data: { is_active: false, logged_out_at: new Date() },
    });
  }

  async deactivateAllUserSessions(userId: string) {
    return prisma.user_sessions.updateMany({
      where: { user_id: userId, is_active: true },
      data: { is_active: false, logged_out_at: new Date() },
    });
  }
}
