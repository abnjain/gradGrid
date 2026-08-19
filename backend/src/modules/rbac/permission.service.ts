/**
 * GradGrid — Permission Service
 *
 * Resolves effective permission keys for a user. Results are cached in Redis
 * when REDIS_URL is configured; otherwise every request hits the database.
 */

import { PermissionRepository } from './permission.repository';
import {
  getCachedPermissions,
  setCachedPermissions,
  invalidatePermissionCache,
} from '../../shared/utils/cache';
import { groupPermissionsByModule } from '../../shared/constants/permissions';

export class PermissionService {
  private repository = new PermissionRepository();

  async resolvePermissions(userId: string, institutionId?: string | null) {
    const cached = await getCachedPermissions(userId, institutionId);
    if (cached) {
      return { keys: cached, roleName: '', roleId: '' };
    }
    return this.resolveFresh(userId, institutionId);
  }

  async resolveFresh(userId: string, institutionId?: string | null) {
    const resolved = await this.repository.resolveKeysForUser(userId, institutionId);
    await setCachedPermissions(userId, resolved.keys, institutionId);
    return resolved;
  }

  async getRegistry(scope: 'platform' | 'institution') {
    const rows = await this.repository.listActive();
    const keys = rows
      .filter((row) =>
        scope === 'platform'
          ? true
          : !['platform_users', 'platform_audit', 'feature_flags'].includes(row.module) &&
            row.key !== 'organization.manage'
      )
      .map((row) => row.key);
    return groupPermissionsByModule(keys);
  }

  async invalidateUser(userId: string, institutionId?: string | null) {
    await invalidatePermissionCache(userId, institutionId);
  }

  async invalidateUsers(userIds: string[], institutionId?: string | null) {
    await Promise.all(userIds.map((id) => this.invalidateUser(id, institutionId)));
  }
}

export const permissionService = new PermissionService();
