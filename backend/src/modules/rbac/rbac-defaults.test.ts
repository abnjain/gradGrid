/**
 * GradGrid — RBAC default mapping tests
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { defaultPermissionKeysForRole } from '../../shared/constants/rbac-defaults';
import {
  ALL_PERMISSION_KEYS,
  institutionPermissionKeys,
  isLockedRole,
  isPlatformOnlyKey,
} from '../../shared/constants/permissions';

describe('RBAC default mappings', () => {
  it('gives platform super admin every catalog key', () => {
    const keys = defaultPermissionKeysForRole('platform_super_admin');
    assert.equal(keys.length, ALL_PERMISSION_KEYS.length);
  });

  it('gives institution owner all non-platform keys', () => {
    const keys = defaultPermissionKeysForRole('institution_owner');
    const expected = institutionPermissionKeys();
    assert.deepEqual([...keys].sort(), [...expected].sort());
    assert.equal(keys.some(isPlatformOnlyKey), false);
  });

  it('gives accountant fee and salary access without student create', () => {
    const keys = new Set(defaultPermissionKeysForRole('accountant'));
    assert.equal(keys.has('fees.record_payment'), true);
    assert.equal(keys.has('salary.manage'), true);
    assert.equal(keys.has('students.view'), true);
    assert.equal(keys.has('students.create'), false);
    assert.equal(keys.has('roles.update'), false);
  });

  it('locks owner and platform super admin roles', () => {
    assert.equal(isLockedRole('institution_owner'), true);
    assert.equal(isLockedRole('platform_super_admin'), true);
    assert.equal(isLockedRole('teacher'), false);
  });
});
