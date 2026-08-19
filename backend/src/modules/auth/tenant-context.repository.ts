/**
 * GradGrid — Tenant Context Repository
 *
 * Resolves organizations and institutions accessible to an institution user.
 */

import { prisma } from '../../config/database';

export interface AccessibleInstitution {
  id: string;
  name: string;
  code: string;
  organizationId: string;
}

export class TenantContextRepository {
  async findAccessibleInstitutions(userId: string, primaryInstitutionId?: string | null) {
    const institutionIds = new Set<string>();

    if (primaryInstitutionId) {
      institutionIds.add(primaryInstitutionId);
    }

    const assignments = await prisma.role_assignments.findMany({
      where: { user_id: userId, deleted_at: null },
      select: { institution_id: true },
    });

    for (const assignment of assignments) {
      if (assignment.institution_id) {
        institutionIds.add(assignment.institution_id);
      }
    }

    if (institutionIds.size === 0) {
      return [];
    }

    return prisma.institutions.findMany({
      where: {
        id: { in: Array.from(institutionIds) },
        is_active: true,
        deleted_at: null,
        organization: { is_active: true, deleted_at: null },
      },
      select: {
        id: true,
        name: true,
        code: true,
        organization_id: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ organization: { name: 'asc' } }, { name: 'asc' }],
    });
  }

  async findInstitutionById(institutionId: string) {
    return prisma.institutions.findFirst({
      where: {
        id: institutionId,
        is_active: true,
        deleted_at: null,
        organization: { is_active: true, deleted_at: null },
      },
      select: {
        id: true,
        name: true,
        code: true,
        organization_id: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async userHasInstitutionAccess(userId: string, institutionId: string, primaryInstitutionId?: string | null) {
    if (primaryInstitutionId === institutionId) {
      return true;
    }

    const assignment = await prisma.role_assignments.findFirst({
      where: {
        user_id: userId,
        institution_id: institutionId,
        deleted_at: null,
      },
    });

    return !!assignment;
  }
}
