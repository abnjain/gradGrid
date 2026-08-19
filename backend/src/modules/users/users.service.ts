/**
 * GradGrid — User management service
 */

import crypto from 'crypto';
import { prisma } from '../../config/database';
import { hashPassword } from '../../shared/utils/password';
import { sendEmail } from '../../shared/utils/email';
import { config } from '../../config';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../shared/errors';
import { RoleRepository } from '../rbac/role.repository';
import { permissionService } from '../rbac/permission.service';
import { auditLog } from '../../shared/utils/logger';

function formatRoleLabel(name: string) {
  return name
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function temporaryPassword() {
  return `Gg${crypto.randomBytes(4).toString('hex')}!A1`;
}

export class UsersService {
  private roles = new RoleRepository();

  async listInstitutionUsers(institutionId: string) {
    const assignments = await prisma.role_assignments.findMany({
      where: { institution_id: institutionId, deleted_at: null },
      include: {
        user: true,
        role: true,
      },
      orderBy: { created_at: 'desc' },
    });

    const byUser = new Map<
      string,
      {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string | null;
        isActive: boolean;
        lastLoginAt: Date | null;
        roles: string[];
      }
    >();

    for (const row of assignments) {
      const existing = byUser.get(row.user_id);
      if (existing) {
        existing.roles.push(row.role.name);
        continue;
      }
      byUser.set(row.user_id, {
        id: row.user.id,
        firstName: row.user.first_name,
        lastName: row.user.last_name,
        email: row.user.email,
        phone: row.user.phone,
        isActive: row.user.is_active,
        lastLoginAt: null,
        roles: [row.role.name],
      });
    }

    return Array.from(byUser.values()).map((user) => ({
      ...user,
      roleName: user.roles[0],
      roleLabel: formatRoleLabel(user.roles[0]),
      name: `${user.firstName} ${user.lastName}`.trim(),
    }));
  }

  async listPlatformUsers() {
    const users = await prisma.users.findMany({
      where: { user_type: 'platform', deleted_at: null },
      include: {
        role_assignments: {
          where: { deleted_at: null, institution_id: null },
          include: { role: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return users.map((user) => {
      const roleName = user.role_assignments[0]?.role.name || 'platform_admin';
      return {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        name: `${user.first_name} ${user.last_name}`.trim(),
        email: user.email,
        isActive: user.is_active,
        lastLoginAt: null,
        roleName,
        roleLabel: formatRoleLabel(roleName),
      };
    });
  }

  async inviteInstitutionUser(
    actor: { id: string; roleName: string },
    institutionId: string,
    data: {
      email: string;
      firstName: string;
      lastName: string;
      roleName: string;
      phone?: string;
    }
  ) {
    const email = data.email.trim().toLowerCase();
    const role = await this.roles.findByName(data.roleName, institutionId);
    if (!role || !role.is_active) {
      throw new BadRequestError('Selected role is not available for this institution');
    }
    if (role.name === 'institution_owner') {
      throw new ForbiddenError('Cannot invite users as institution owner via invite flow');
    }

    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictError('A user with this email already exists', 'EMAIL_ALREADY_REGISTERED');
    }

    const tempPassword = temporaryPassword();
    const passwordHash = await hashPassword(tempPassword);

    const user = await prisma.users.create({
      data: {
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        email,
        phone: data.phone?.trim() || null,
        user_type: 'institution',
        institution_id: institutionId,
        email_verified: true,
        is_active: true,
      },
    });

    await prisma.user_passwords.create({
      data: {
        user_id: user.id,
        password_hash: passwordHash,
        is_current: true,
      },
    });

    await this.roles.createAssignment({
      userId: user.id,
      roleId: role.id,
      institutionId,
      assignedBy: actor.id,
    });

    await sendEmail({
      to: email,
      subject: 'You are invited to GradGrid',
      text: `Hello ${data.firstName},\n\nYou have been invited to GradGrid.\nEmail: ${email}\nTemporary password: ${tempPassword}\nSign in: ${config.frontend.url}/login\n\nPlease change your password after signing in.`,
      html: `<p>Hello ${data.firstName},</p><p>You have been invited to GradGrid.</p><p><strong>Email:</strong> ${email}<br/><strong>Temporary password:</strong> ${tempPassword}</p><p><a href="${config.frontend.url}/login">Sign in</a> and change your password.</p>`,
    });

    auditLog('USER_INVITED', {
      userId: actor.id,
      role: actor.roleName,
      institutionId,
      resourceType: 'user',
      resourceId: user.id,
      details: { email, roleName: role.name },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      roleName: role.name,
      temporaryPassword: config.smtp.host ? undefined : tempPassword,
    };
  }

  async invitePlatformUser(
    actor: { id: string; roleName: string },
    data: { email: string; firstName: string; lastName: string; roleName: string }
  ) {
    const email = data.email.trim().toLowerCase();
    const role = await this.roles.findByName(data.roleName, null);
    if (!role || !role.is_active) {
      throw new BadRequestError('Selected platform role is not available');
    }
    if (role.name === 'platform_super_admin' && actor.roleName !== 'platform_super_admin') {
      throw new ForbiddenError('Only a super admin can invite another super admin');
    }

    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictError('A user with this email already exists', 'EMAIL_ALREADY_REGISTERED');
    }

    const tempPassword = temporaryPassword();
    const passwordHash = await hashPassword(tempPassword);

    const user = await prisma.users.create({
      data: {
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        email,
        user_type: 'platform',
        email_verified: true,
        is_active: true,
      },
    });

    await prisma.user_passwords.create({
      data: {
        user_id: user.id,
        password_hash: passwordHash,
        is_current: true,
      },
    });

    await this.roles.createAssignment({
      userId: user.id,
      roleId: role.id,
      institutionId: null,
      assignedBy: actor.id,
    });

    await sendEmail({
      to: email,
      subject: 'GradGrid platform access',
      text: `Hello ${data.firstName},\n\nYou have been invited as a GradGrid platform user.\nEmail: ${email}\nTemporary password: ${tempPassword}\nSign in: ${config.frontend.url}/login`,
      html: `<p>Hello ${data.firstName},</p><p>You have been invited as a GradGrid platform user.</p><p><strong>Email:</strong> ${email}<br/><strong>Temporary password:</strong> ${tempPassword}</p><p><a href="${config.frontend.url}/login">Sign in</a>.</p>`,
    });

    auditLog('PLATFORM_USER_INVITED', {
      userId: actor.id,
      role: actor.roleName,
      resourceType: 'user',
      resourceId: user.id,
      details: { email, roleName: role.name },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      roleName: role.name,
      temporaryPassword: config.smtp.host ? undefined : tempPassword,
    };
  }

  async setActive(
    actor: { id: string; roleName: string },
    userId: string,
    isActive: boolean,
    scope: { type: 'institution'; institutionId: string } | { type: 'platform' }
  ) {
    if (userId === actor.id) {
      throw new BadRequestError('You cannot deactivate your own account');
    }

    const user = await prisma.users.findFirst({
      where: { id: userId, deleted_at: null },
    });
    if (!user) throw new NotFoundError('User');

    if (scope.type === 'institution') {
      if (user.user_type !== 'institution') {
        throw new ForbiddenError('User is not an institution account');
      }
      const assignment = await prisma.role_assignments.findFirst({
        where: {
          user_id: userId,
          institution_id: scope.institutionId,
          deleted_at: null,
        },
        include: { role: true },
      });
      if (!assignment) throw new NotFoundError('User in this institution');
      if (assignment.role.name === 'institution_owner') {
        throw new ForbiddenError('Cannot deactivate the institution owner');
      }
    } else {
      if (user.user_type !== 'platform') {
        throw new ForbiddenError('User is not a platform account');
      }
      const assignment = await prisma.role_assignments.findFirst({
        where: { user_id: userId, institution_id: null, deleted_at: null },
        include: { role: true },
      });
      if (assignment?.role.name === 'platform_super_admin') {
        throw new ForbiddenError('Cannot deactivate a platform super admin');
      }
    }

    await prisma.users.update({
      where: { id: userId },
      data: { is_active: isActive, updated_at: new Date() },
    });

    if (!isActive) {
      await prisma.user_sessions.updateMany({
        where: { user_id: userId, is_active: true },
        data: { is_active: false },
      });
    }

    await permissionService.invalidateUser(
      userId,
      scope.type === 'institution' ? scope.institutionId : null
    );

    auditLog(isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED', {
      userId: actor.id,
      role: actor.roleName,
      institutionId: scope.type === 'institution' ? scope.institutionId : undefined,
      resourceType: 'user',
      resourceId: userId,
      details: { email: user.email },
    });

    return { id: userId, isActive };
  }

  async assignInstitutionRole(
    actor: { id: string; roleName: string },
    institutionId: string,
    userId: string,
    roleName: string
  ) {
    const role = await this.roles.findByName(roleName, institutionId);
    if (!role || !role.is_active) {
      throw new BadRequestError('Selected role is not available');
    }
    if (role.name === 'institution_owner') {
      throw new ForbiddenError('Cannot assign institution owner via this endpoint');
    }

    const assignment = await prisma.role_assignments.findFirst({
      where: {
        user_id: userId,
        institution_id: institutionId,
        deleted_at: null,
      },
    });
    if (!assignment) throw new NotFoundError('User in this institution');

    await prisma.role_assignments.update({
      where: { id: assignment.id },
      data: { deleted_at: new Date() },
    });

    await this.roles.createAssignment({
      userId,
      roleId: role.id,
      institutionId,
      assignedBy: actor.id,
    });

    await permissionService.invalidateUser(userId, institutionId);

    auditLog('ROLE_ASSIGNED', {
      userId: actor.id,
      role: actor.roleName,
      institutionId,
      resourceType: 'user',
      resourceId: userId,
      details: { roleName },
    });

    return { userId, roleName };
  }
}

export const usersService = new UsersService();
