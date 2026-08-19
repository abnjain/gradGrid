/**
 * GradGrid — Seed RBAC registry, platform roles, and mappings
 */

import { prisma } from '../../config/database';
import { PermissionRepository } from './permission.repository';
import { RoleRepository } from './role.repository';
import { PLATFORM_ROLE_TEMPLATES } from '../../shared/constants/rbac-defaults';

export async function seedRbacRegistryAndPlatformRoles() {
  const permissions = new PermissionRepository();
  const roles = new RoleRepository();

  await permissions.upsertRegistry();
  const registry = await permissions.listActive();
  const byKey = new Map(registry.map((row) => [row.key, row.id]));

  for (const template of PLATFORM_ROLE_TEMPLATES) {
    const existing = await roles.findByName(template.name, null);
    const role =
      existing ||
      (await roles.create({
        name: template.name,
        description: template.description,
        institutionId: null,
        isSystemRole: true,
      }));

    if (existing && (existing.description !== template.description || !existing.is_system_role)) {
      await roles.update(role.id, { description: template.description });
    }

    const permissionIds = template.permissionKeys
      .map((key) => byKey.get(key))
      .filter((id): id is string => Boolean(id));
    await roles.replacePermissions(role.id, permissionIds);
  }
}

export async function assignPlatformSuperAdmin(userId: string) {
  const roles = new RoleRepository();
  const role = await roles.findByName('platform_super_admin', null);
  if (!role) return;
  await roles.createAssignment({
    userId,
    roleId: role.id,
    institutionId: null,
    assignedBy: userId,
  });
}

export async function findUserIdByEmail(email: string) {
  const user = await prisma.users.findUnique({
    where: { email },
    select: { id: true },
  });
  return user?.id ?? null;
}
