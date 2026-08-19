/**
 * GradGrid — RBAC Permission Repository
 */

import { prisma } from '../../config/database';
import { PERMISSION_CATALOG } from '../../shared/constants/permissions';

export class PermissionRepository {
  async upsertRegistry() {
    for (const entry of PERMISSION_CATALOG) {
      await prisma.permission_registry.upsert({
        where: { key: entry.key },
        update: {
          module: entry.module,
          action: entry.action,
          description: entry.description,
          is_active: true,
        },
        create: {
          module: entry.module,
          action: entry.action,
          key: entry.key,
          description: entry.description,
          is_active: true,
        },
      });
    }
  }

  async listActive() {
    return prisma.permission_registry.findMany({
      where: { is_active: true },
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });
  }

  async findByKeys(keys: string[]) {
    if (keys.length === 0) return [];
    return prisma.permission_registry.findMany({
      where: { key: { in: keys }, is_active: true },
    });
  }

  async resolveKeysForUser(userId: string, institutionId?: string | null) {
    const assignments = await prisma.role_assignments.findMany({
      where: {
        user_id: userId,
        deleted_at: null,
        role: { is_active: true, deleted_at: null },
        ...(institutionId
          ? { institution_id: institutionId }
          : { institution_id: { equals: null } }),
      },
      include: {
        role: {
          include: {
            role_permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    const keys = new Set<string>();
    let roleName = '';
    let roleId = '';

    for (const assignment of assignments) {
      if (!roleName) {
        roleName = assignment.role.name;
        roleId = assignment.role.id;
      }
      for (const mapping of assignment.role.role_permissions) {
        if (mapping.permission.is_active) {
          keys.add(mapping.permission.key);
        }
      }
    }

    return { keys: Array.from(keys).sort(), roleName, roleId };
  }
}
