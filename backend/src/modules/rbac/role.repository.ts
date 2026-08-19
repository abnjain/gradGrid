/**
 * GradGrid — RBAC Role Repository
 */

import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

type DbClient = Prisma.TransactionClient | typeof prisma;

export class RoleRepository {
  private db: DbClient;

  constructor(db: DbClient = prisma) {
    this.db = db;
  }

  async findById(id: string) {
    return this.db.roles.findFirst({
      where: { id, deleted_at: null },
      include: {
        role_permissions: { include: { permission: true } },
        _count: {
          select: { role_assignments: { where: { deleted_at: null } } },
        },
      },
    });
  }

  async findByName(name: string, institutionId: string | null) {
    return this.db.roles.findFirst({
      where: {
        name,
        deleted_at: null,
        ...(institutionId
          ? { institution_id: institutionId }
          : { institution_id: { equals: null } }),
      },
    });
  }

  async list(institutionId: string | null) {
    return this.db.roles.findMany({
      where: {
        deleted_at: null,
        ...(institutionId
          ? { institution_id: institutionId }
          : { institution_id: { equals: null } }),
      },
      include: {
        role_permissions: { include: { permission: true } },
        _count: {
          select: { role_assignments: { where: { deleted_at: null } } },
        },
      },
      orderBy: [{ is_system_role: 'desc' }, { name: 'asc' }],
    });
  }

  async create(data: {
    name: string;
    description?: string | null;
    institutionId: string | null;
    isSystemRole?: boolean;
    isActive?: boolean;
  }) {
    return this.db.roles.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        institution_id: data.institutionId,
        is_system_role: data.isSystemRole ?? false,
        is_active: data.isActive ?? true,
      },
    });
  }

  async update(
    id: string,
    data: { name?: string; description?: string | null; isActive?: boolean }
  ) {
    return this.db.roles.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.isActive !== undefined ? { is_active: data.isActive } : {}),
        updated_at: new Date(),
      },
    });
  }

  async softDelete(id: string) {
    return this.db.roles.update({
      where: { id },
      data: { deleted_at: new Date(), is_active: false, updated_at: new Date() },
    });
  }

  async replacePermissions(roleId: string, permissionIds: string[]) {
    await this.db.role_permissions.deleteMany({ where: { role_id: roleId } });
    if (permissionIds.length === 0) return;
    await this.db.role_permissions.createMany({
      data: permissionIds.map((permission_id) => ({
        role_id: roleId,
        permission_id,
      })),
      skipDuplicates: true,
    });
  }

  async createAssignment(data: {
    userId: string;
    roleId: string;
    institutionId: string | null;
    assignedBy: string;
  }) {
    const existing = await this.db.role_assignments.findFirst({
      where: {
        user_id: data.userId,
        role_id: data.roleId,
        deleted_at: null,
        ...(data.institutionId
          ? { institution_id: data.institutionId }
          : { institution_id: { equals: null } }),
      },
    });
    if (existing) return existing;

    return this.db.role_assignments.create({
      data: {
        user_id: data.userId,
        role_id: data.roleId,
        institution_id: data.institutionId,
        assigned_by: data.assignedBy,
      },
    });
  }

  async listAssignmentUserIds(roleId: string) {
    const rows = await this.db.role_assignments.findMany({
      where: { role_id: roleId, deleted_at: null },
      select: { user_id: true },
    });
    return rows.map((row) => row.user_id);
  }
}
