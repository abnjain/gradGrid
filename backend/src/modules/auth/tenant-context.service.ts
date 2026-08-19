/**
 * GradGrid — Tenant Context Service
 *
 * Organization / campus (institution) selection for institution portal users.
 */

import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { AuthRepository } from './auth.repository';
import { TenantContextRepository } from './tenant-context.repository';
import { ForbiddenError, NotFoundError, BadRequestError } from '../../shared/errors';
import { auditLog, createContextLogger } from '../../shared/utils/logger';
import { audienceForUserType } from './auth-audience';

const logger = createContextLogger({ module: 'tenant-context' });

export interface WorkspaceOrganization {
  id: string;
  name: string;
  institutions: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}

export interface TenantContextPayload {
  organizationId: string;
  organizationName: string;
  institutionId: string;
  institutionName: string;
  institutionCode: string;
}

export class TenantContextService {
  private authRepository = new AuthRepository();
  private repository = new TenantContextRepository();

  async getWorkspaces(userId: string, userType: string): Promise<{ organizations: WorkspaceOrganization[] }> {
    if (userType === 'platform') {
      throw new ForbiddenError('Platform users do not use institution workspaces');
    }

    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const institutions = await this.repository.findAccessibleInstitutions(
      userId,
      user.institution_id
    );

    const orgMap = new Map<string, WorkspaceOrganization>();

    for (const inst of institutions) {
      const orgId = inst.organization.id;
      if (!orgMap.has(orgId)) {
        orgMap.set(orgId, {
          id: orgId,
          name: inst.organization.name,
          institutions: [],
        });
      }
      orgMap.get(orgId)!.institutions.push({
        id: inst.id,
        name: inst.name,
        code: inst.code,
      });
    }

    return { organizations: Array.from(orgMap.values()) };
  }

  async selectContext(
    userId: string,
    userType: string,
    sessionId: string,
    email: string,
    data: { organizationId: string; institutionId: string }
  ): Promise<{ accessToken: string; context: TenantContextPayload }> {
    if (userType === 'platform') {
      throw new ForbiddenError('Platform users do not use institution workspaces');
    }

    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const institution = await this.repository.findInstitutionById(data.institutionId);
    if (!institution) {
      throw new NotFoundError('Campus not found');
    }

    if (institution.organization_id !== data.organizationId) {
      throw new BadRequestError('Campus does not belong to the selected organization');
    }

    const hasAccess = await this.repository.userHasInstitutionAccess(
      userId,
      data.institutionId,
      user.institution_id
    );

    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this campus');
    }

    await this.authRepository.updateSessionInstitution(sessionId, data.institutionId);

    const context: TenantContextPayload = {
      organizationId: institution.organization.id,
      organizationName: institution.organization.name,
      institutionId: institution.id,
      institutionName: institution.name,
      institutionCode: institution.code,
    };

    const accessToken = jwt.sign(
      {
        sub: userId,
        email,
        userType,
        aud: audienceForUserType(userType),
        sessionId,
        institutionId: context.institutionId,
        organizationId: context.organizationId,
      },
      config.auth.accessTokenSecret,
      { expiresIn: config.auth.accessTokenExpiresIn as jwt.SignOptions['expiresIn'] }
    );

    auditLog('TENANT_CONTEXT_SELECTED', {
      userId,
      role: userType,
      institutionId: context.institutionId,
      resourceType: 'institution',
      resourceId: context.institutionId,
      details: {
        organizationId: context.organizationId,
        organizationName: context.organizationName,
        institutionName: context.institutionName,
      },
    });

    logger.info(
      { userId, organizationId: context.organizationId, institutionId: context.institutionId },
      'Tenant context selected'
    );

    return { accessToken, context };
  }

  async resolveTenantContext(
    userId: string,
    institutionId?: string | null
  ): Promise<TenantContextPayload | null> {
    if (!institutionId) {
      return null;
    }

    const institution = await this.repository.findInstitutionById(institutionId);
    if (!institution) {
      return null;
    }

    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      return null;
    }

    const hasAccess = await this.repository.userHasInstitutionAccess(
      userId,
      institutionId,
      user.institution_id
    );

    if (!hasAccess) {
      return null;
    }

    return {
      organizationId: institution.organization.id,
      organizationName: institution.organization.name,
      institutionId: institution.id,
      institutionName: institution.name,
      institutionCode: institution.code,
    };
  }
}
