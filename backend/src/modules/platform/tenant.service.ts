/**
 * GradGrid — Platform tenant service (organizations, institutions, sessions)
 */

import { prisma } from '../../config/database';
import { BadRequestError, ConflictError, NotFoundError } from '../../shared/errors';
import { roleService } from '../rbac/role.service';
import { auditLog } from '../../shared/utils/logger';

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}

export class TenantService {
  async listOrganizations() {
    const rows = await prisma.organizations.findMany({
      where: { deleted_at: null },
      include: {
        _count: { select: { institutions: { where: { deleted_at: null } } } },
      },
      orderBy: { name: 'asc' },
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      email: row.email,
      phone: row.phone,
      city: row.city,
      state: row.state,
      isActive: row.is_active,
      institutionCount: row._count.institutions,
      createdAt: row.created_at,
    }));
  }

  async getOrganization(id: string) {
    const row = await prisma.organizations.findFirst({
      where: { id, deleted_at: null },
      include: {
        institutions: {
          where: { deleted_at: null },
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
            code: true,
            city: true,
            state: true,
            is_active: true,
          },
        },
      },
    });
    if (!row) throw new NotFoundError('Organization');
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      email: row.email,
      phone: row.phone,
      city: row.city,
      state: row.state,
      isActive: row.is_active,
      institutions: row.institutions.map((inst) => ({
        id: inst.id,
        name: inst.name,
        code: inst.code,
        city: inst.city,
        state: inst.state,
        isActive: inst.is_active,
      })),
    };
  }

  async createOrganization(
    actor: { id: string; roleName: string },
    data: {
      name: string;
      slug?: string;
      email?: string;
      phone?: string;
      city?: string;
      state?: string;
    }
  ) {
    const slug = data.slug || slugify(data.name);
    const existing = await prisma.organizations.findFirst({
      where: { slug, deleted_at: null },
    });
    if (existing) throw new ConflictError('An organization with this slug already exists');

    const row = await prisma.organizations.create({
      data: {
        name: data.name.trim(),
        slug,
        email: data.email || null,
        phone: data.phone || null,
        city: data.city || null,
        state: data.state || null,
      },
    });

    auditLog('ORGANIZATION_CREATED', {
      userId: actor.id,
      role: actor.roleName,
      resourceType: 'organization',
      resourceId: row.id,
      details: { name: row.name, slug: row.slug },
    });

    return this.getOrganization(row.id);
  }

  async updateOrganization(
    actor: { id: string; roleName: string },
    id: string,
    data: {
      name?: string;
      email?: string | null;
      phone?: string | null;
      city?: string | null;
      state?: string | null;
      isActive?: boolean;
    }
  ) {
    await this.getOrganization(id);
    await prisma.organizations.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.city !== undefined ? { city: data.city } : {}),
        ...(data.state !== undefined ? { state: data.state } : {}),
        ...(data.isActive !== undefined ? { is_active: data.isActive } : {}),
        updated_at: new Date(),
      },
    });

    auditLog('ORGANIZATION_UPDATED', {
      userId: actor.id,
      role: actor.roleName,
      resourceType: 'organization',
      resourceId: id,
      details: data,
    });

    return this.getOrganization(id);
  }

  async listInstitutions() {
    const rows = await prisma.institutions.findMany({
      where: { deleted_at: null },
      include: {
        organization: { select: { id: true, name: true } },
        _count: { select: { students: { where: { deleted_at: null } } } },
      },
      orderBy: { name: 'asc' },
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      code: row.code,
      organizationId: row.organization_id,
      organizationName: row.organization.name,
      city: row.city,
      state: row.state,
      isActive: row.is_active,
      studentCount: row._count.students,
      createdAt: row.created_at,
    }));
  }

  async getInstitution(id: string) {
    const row = await prisma.institutions.findFirst({
      where: { id, deleted_at: null },
      include: {
        organization: { select: { id: true, name: true, slug: true } },
        academic_sessions: {
          where: { deleted_at: null },
          orderBy: { start_date: 'desc' },
        },
      },
    });
    if (!row) throw new NotFoundError('Institution');
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      email: row.email,
      phone: row.phone,
      city: row.city,
      state: row.state,
      isActive: row.is_active,
      organization: {
        id: row.organization.id,
        name: row.organization.name,
        slug: row.organization.slug,
      },
      academicSessions: row.academic_sessions.map((session) => ({
        id: session.id,
        name: session.name,
        startDate: session.start_date,
        endDate: session.end_date,
        isCurrent: session.is_current,
      })),
    };
  }

  async createInstitution(
    actor: { id: string; roleName: string },
    data: {
      organizationId: string;
      name: string;
      code: string;
      email?: string;
      phone?: string;
      city?: string;
      state?: string;
    }
  ) {
    const org = await prisma.organizations.findFirst({
      where: { id: data.organizationId, deleted_at: null },
    });
    if (!org) throw new NotFoundError('Organization');

    const code = data.code.trim().toUpperCase();
    const existing = await prisma.institutions.findFirst({
      where: { code, deleted_at: null },
    });
    if (existing) throw new ConflictError('Institution code already in use');

    const row = await prisma.institutions.create({
      data: {
        organization_id: data.organizationId,
        name: data.name.trim(),
        code,
        email: data.email || null,
        phone: data.phone || null,
        city: data.city || null,
        state: data.state || null,
      },
    });

    await roleService.provisionInstitutionRoles(row.id, null);

    auditLog('INSTITUTION_CREATED', {
      userId: actor.id,
      role: actor.roleName,
      institutionId: row.id,
      resourceType: 'institution',
      resourceId: row.id,
      details: { name: row.name, code: row.code },
    });

    return this.getInstitution(row.id);
  }

  async updateInstitution(
    actor: { id: string; roleName: string },
    id: string,
    data: {
      name?: string;
      email?: string | null;
      phone?: string | null;
      city?: string | null;
      state?: string | null;
      isActive?: boolean;
    }
  ) {
    await this.getInstitution(id);
    await prisma.institutions.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.city !== undefined ? { city: data.city } : {}),
        ...(data.state !== undefined ? { state: data.state } : {}),
        ...(data.isActive !== undefined ? { is_active: data.isActive } : {}),
        updated_at: new Date(),
      },
    });

    auditLog('INSTITUTION_UPDATED', {
      userId: actor.id,
      role: actor.roleName,
      institutionId: id,
      resourceType: 'institution',
      resourceId: id,
      details: data,
    });

    return this.getInstitution(id);
  }

  async listAcademicSessions(institutionId: string) {
    await this.getInstitution(institutionId);
    const rows = await prisma.academic_sessions.findMany({
      where: { institution_id: institutionId, deleted_at: null },
      orderBy: { start_date: 'desc' },
    });
    return rows.map((session) => ({
      id: session.id,
      name: session.name,
      startDate: session.start_date,
      endDate: session.end_date,
      isCurrent: session.is_current,
    }));
  }

  async createAcademicSession(
    actor: { id: string; roleName: string },
    institutionId: string,
    data: { name: string; startDate: string; endDate: string; isCurrent?: boolean }
  ) {
    await this.getInstitution(institutionId);
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end < start) throw new BadRequestError('End date must be after start date');

    if (data.isCurrent) {
      await prisma.academic_sessions.updateMany({
        where: { institution_id: institutionId, deleted_at: null },
        data: { is_current: false },
      });
    }

    const row = await prisma.academic_sessions.create({
      data: {
        institution_id: institutionId,
        name: data.name.trim(),
        start_date: start,
        end_date: end,
        is_current: data.isCurrent ?? false,
      },
    });

    auditLog('ACADEMIC_SESSION_CREATED', {
      userId: actor.id,
      role: actor.roleName,
      institutionId,
      resourceType: 'academic_session',
      resourceId: row.id,
      details: { name: row.name },
    });

    return {
      id: row.id,
      name: row.name,
      startDate: row.start_date,
      endDate: row.end_date,
      isCurrent: row.is_current,
    };
  }
}

export const tenantService = new TenantService();
