/**
 * GradGrid — Role Service
 */

import { RoleRepository } from './role.repository';
import { PermissionRepository } from './permission.repository';
import { permissionService } from './permission.service';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../shared/errors';
import { isLockedRole } from '../../shared/constants/permissions';
import { INSTITUTION_ROLE_TEMPLATES } from '../../shared/constants/rbac-defaults';
import { auditLog } from '../../shared/utils/logger';
import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';

function slugifyRoleName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

export class RoleService {
  private roles = new RoleRepository();
  private permissions = new PermissionRepository();

  async list(institutionId: string | null) {
    const roles = await this.roles.list(institutionId);
    return roles.map((role) => this.toRoleDto(role));
  }

  async create(
    actor: { id: string; roleName: string; institutionId?: string | null },
    institutionId: string | null,
    data: { name: string; description?: string; permissionKeys?: string[] }
  ) {
    const name = slugifyRoleName(data.name);
    if (!name) throw new BadRequestError('Role name is required');

    const existing = await this.roles.findByName(name, institutionId);
    if (existing) throw new ConflictError('A role with this name already exists');

    const role = await this.roles.create({
      name,
      description: data.description ?? null,
      institutionId,
      isSystemRole: false,
    });

    if (data.permissionKeys?.length) {
      await this.replacePermissions(actor, role.id, institutionId, data.permissionKeys);
    }

    auditLog('ROLE_CREATED', {
      userId: actor.id,
      role: actor.roleName,
      institutionId: institutionId || undefined,
      resourceType: 'role',
      resourceId: role.id,
      details: { name },
    });

    const fresh = await this.roles.findById(role.id);
    return this.toRoleDto(fresh!);
  }

  async update(
    actor: { id: string; roleName: string },
    roleId: string,
    institutionId: string | null,
    data: { description?: string; isActive?: boolean }
  ) {
    const role = await this.requireScopedRole(roleId, institutionId);
    if (isLockedRole(role.name) && data.isActive === false) {
      throw new ForbiddenError('This system role cannot be deactivated');
    }

    await this.roles.update(roleId, {
      description: data.description,
      isActive: data.isActive,
    });

    await this.invalidateRoleAssignees(roleId, institutionId);

    auditLog('ROLE_UPDATED', {
      userId: actor.id,
      role: actor.roleName,
      institutionId: institutionId || undefined,
      resourceType: 'role',
      resourceId: roleId,
      details: data,
    });

    const fresh = await this.roles.findById(roleId);
    return this.toRoleDto(fresh!);
  }

  async delete(
    actor: { id: string; roleName: string },
    roleId: string,
    institutionId: string | null
  ) {
    const role = await this.requireScopedRole(roleId, institutionId);
    if (role.is_system_role) {
      throw new ForbiddenError('System roles cannot be deleted');
    }
    if (role._count.role_assignments > 0) {
      throw new ConflictError('Remove role assignments before deleting this role');
    }

    await this.roles.softDelete(roleId);

    auditLog('ROLE_DELETED', {
      userId: actor.id,
      role: actor.roleName,
      institutionId: institutionId || undefined,
      resourceType: 'role',
      resourceId: roleId,
      details: { name: role.name },
    });
  }

  async replacePermissions(
    actor: { id: string; roleName: string },
    roleId: string,
    institutionId: string | null,
    permissionKeys: string[]
  ) {
    const role = await this.requireScopedRole(roleId, institutionId);
    if (isLockedRole(role.name)) {
      throw new ForbiddenError('Permissions for this role are locked');
    }

    const uniqueKeys = Array.from(new Set(permissionKeys));
    const records = await this.permissions.findByKeys(uniqueKeys);
    if (records.length !== uniqueKeys.length) {
      throw new BadRequestError('One or more permission keys are invalid');
    }

    await this.roles.replacePermissions(
      roleId,
      records.map((row) => row.id)
    );
    await this.invalidateRoleAssignees(roleId, institutionId);

    auditLog('PERMISSION_MATRIX_UPDATED', {
      userId: actor.id,
      role: actor.roleName,
      institutionId: institutionId || undefined,
      resourceType: 'role',
      resourceId: roleId,
      details: { roleName: role.name, permissionKeys: uniqueKeys },
    });

    const fresh = await this.roles.findById(roleId);
    return this.toRoleDto(fresh!);
  }

  async provisionInstitutionRoles(
    institutionId: string,
    ownerUserId: string | null,
    db: Prisma.TransactionClient | typeof prisma = prisma
  ) {
    const roles = new RoleRepository(db);
    const permissions = new PermissionRepository();
    const registry = await permissions.listActive();
    const byKey = new Map(registry.map((row) => [row.key, row.id]));

    let ownerRoleId = '';

    for (const template of INSTITUTION_ROLE_TEMPLATES) {
      const existing = await roles.findByName(template.name, institutionId);
      const role =
        existing ||
        (await roles.create({
          name: template.name,
          description: template.description,
          institutionId,
          isSystemRole: true,
        }));

      const permissionIds = template.permissionKeys
        .map((key) => byKey.get(key))
        .filter((id): id is string => Boolean(id));
      await roles.replacePermissions(role.id, permissionIds);

      if (template.name === 'institution_owner') {
        ownerRoleId = role.id;
      }
    }

    if (ownerUserId && ownerRoleId) {
      await roles.createAssignment({
        userId: ownerUserId,
        roleId: ownerRoleId,
        institutionId,
        assignedBy: ownerUserId,
      });
    }
  }

  async assignByName(
    userId: string,
    roleName: string,
    institutionId: string | null,
    assignedBy: string
  ) {
    const role = await this.roles.findByName(roleName, institutionId);
    if (!role) throw new NotFoundError('Role');
    return this.roles.createAssignment({
      userId,
      roleId: role.id,
      institutionId,
      assignedBy,
    });
  }

  private async requireScopedRole(roleId: string, institutionId: string | null) {
    const role = await this.roles.findById(roleId);
    if (!role) throw new NotFoundError('Role');
    const roleInstitution = role.institution_id ?? null;
    if (roleInstitution !== institutionId) {
      throw new ForbiddenError('Role does not belong to this workspace');
    }
    return role;
  }

  private async invalidateRoleAssignees(roleId: string, institutionId: string | null) {
    const userIds = await this.roles.listAssignmentUserIds(roleId);
    await permissionService.invalidateUsers(userIds, institutionId);
  }

  private toRoleDto(role: {
    id: string;
    name: string;
    description: string | null;
    is_system_role: boolean;
    is_active: boolean;
    role_permissions: Array<{ permission: { key: string } }>;
    _count: { role_assignments: number };
  }) {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystemRole: role.is_system_role,
      isLocked: isLockedRole(role.name),
      isActive: role.is_active,
      memberCount: role._count.role_assignments,
      permissionKeys: role.role_permissions.map((row) => row.permission.key).sort(),
    };
  }
}

export const roleService = new RoleService();
