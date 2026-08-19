/**
 * GradGrid — Default Role Permission Mappings (PRD §8.2)
 *
 * Legend in product docs: full / view-only / limited / configurable / none.
 * Configurable roles start with a curated subset that admins can later edit.
 */

import {
  ALL_PERMISSION_KEYS,
  INSTITUTION_SYSTEM_ROLES,
  PLATFORM_SYSTEM_ROLES,
  institutionPermissionKeys,
} from './permissions';

export interface RoleTemplate {
  name: string;
  description: string;
  isSystemRole: true;
  permissionKeys: string[];
}

function keysMatching(...prefixesOrExact: string[]): string[] {
  const exact = new Set(prefixesOrExact.filter((k) => k.includes('.')));
  const prefixes = prefixesOrExact.filter((k) => !k.includes('.'));
  return ALL_PERMISSION_KEYS.filter(
    (key) => exact.has(key) || prefixes.some((moduleName) => key.startsWith(`${moduleName}.`))
  );
}

export const PLATFORM_ROLE_TEMPLATES: RoleTemplate[] = [
  {
    name: 'platform_super_admin',
    description: 'Platform Super Admin — full platform control',
    isSystemRole: true,
    permissionKeys: [...ALL_PERMISSION_KEYS],
  },
  {
    name: 'platform_admin',
    description: 'Platform Admin — tenant and user administration',
    isSystemRole: true,
    permissionKeys: ALL_PERMISSION_KEYS.filter((key) => key !== 'feature_flags.manage'),
  },
  {
    name: 'support_executive',
    description: 'Support Executive — view tenants and users',
    isSystemRole: true,
    permissionKeys: [
      'platform_users.view',
      'organization.view',
      'institution.view',
      'users.view',
      'platform_audit.view',
    ],
  },
  {
    name: 'customer_success',
    description: 'Customer Success — tenant health and onboarding',
    isSystemRole: true,
    permissionKeys: [
      'platform_users.view',
      'organization.view',
      'institution.view',
      'institution.manage',
      'users.view',
      'reports.view',
    ],
  },
  {
    name: 'sales_executive',
    description: 'Sales Executive — organization and institution visibility',
    isSystemRole: true,
    permissionKeys: ['organization.view', 'institution.view', 'platform_users.view'],
  },
  {
    name: 'developer',
    description: 'Developer — feature flags and diagnostics',
    isSystemRole: true,
    permissionKeys: ['feature_flags.manage', 'settings.view', 'platform_audit.view'],
  },
  {
    name: 'devops_engineer',
    description: 'DevOps Engineer — feature flags and configuration',
    isSystemRole: true,
    permissionKeys: ['feature_flags.manage', 'settings.view'],
  },
  {
    name: 'security_auditor',
    description: 'Security Auditor — platform and institution audit access',
    isSystemRole: true,
    permissionKeys: [
      'platform_audit.view',
      'platform_audit.export',
      'audit_logs.view',
      'audit_logs.export',
    ],
  },
];

export const INSTITUTION_ROLE_TEMPLATES: RoleTemplate[] = [
  {
    name: 'institution_owner',
    description: 'Institution Owner — full institution control',
    isSystemRole: true,
    permissionKeys: institutionPermissionKeys(),
  },
  {
    name: 'institution_admin',
    description: 'Institution Admin — configurable administration',
    isSystemRole: true,
    permissionKeys: institutionPermissionKeys().filter(
      (key) =>
        !key.endsWith('.reveal_sensitive') &&
        !key.endsWith('.export_sensitive') &&
        key !== 'roles.delete' &&
        key !== 'institution.manage'
    ),
  },
  {
    name: 'academic_coordinator',
    description: 'Academic Coordinator — academics, attendance, and exams',
    isSystemRole: true,
    permissionKeys: [
      ...keysMatching('students', 'attendance', 'examination'),
      'teachers.view',
      'reports.view',
      'reports.export',
      'communication.view',
      'communication.send',
      'documents.view',
      'documents.generate',
      'audit_logs.view_own',
    ],
  },
  {
    name: 'teacher',
    description: 'Teacher — assigned class operations',
    isSystemRole: true,
    permissionKeys: [
      'students.view',
      'teachers.view',
      'attendance.view',
      'attendance.mark',
      'attendance.update',
      'examination.view',
      'examination.enter_marks',
      'library.view',
      'reports.view',
      'communication.view',
      'salary.view_own',
      'audit_logs.view_own',
    ],
  },
  {
    name: 'accountant',
    description: 'Accountant — finance and payroll',
    isSystemRole: true,
    permissionKeys: [
      'students.view',
      'teachers.view',
      ...keysMatching('fees', 'salary'),
      'reports.view',
      'reports.export',
      'audit_logs.view_own',
    ],
  },
  {
    name: 'librarian',
    description: 'Librarian — library operations',
    isSystemRole: true,
    permissionKeys: [
      'students.view',
      ...keysMatching('library'),
      'reports.view',
      'audit_logs.view_own',
    ],
  },
  {
    name: 'receptionist',
    description: 'Receptionist — admissions and front desk',
    isSystemRole: true,
    permissionKeys: [
      'students.view',
      'students.create',
      'students.update',
      ...keysMatching('admissions'),
      'communication.view',
      'communication.send',
      'audit_logs.view_own',
    ],
  },
  {
    name: 'hr',
    description: 'HR — staff and payroll configuration',
    isSystemRole: true,
    permissionKeys: [
      ...keysMatching('teachers'),
      'users.view',
      'users.invite',
      'users.update',
      'salary.view',
      'salary.manage',
      'salary.export',
      'reports.view',
      'audit_logs.view_own',
    ],
  },
];

const TEMPLATE_BY_NAME = new Map(
  [...PLATFORM_ROLE_TEMPLATES, ...INSTITUTION_ROLE_TEMPLATES].map((role) => [role.name, role])
);

export function getRoleTemplate(name: string): RoleTemplate | undefined {
  return TEMPLATE_BY_NAME.get(name);
}

export function defaultPermissionKeysForRole(name: string): string[] {
  return TEMPLATE_BY_NAME.get(name)?.permissionKeys ?? [];
}

export function isSystemRoleName(name: string, scope: 'platform' | 'institution'): boolean {
  const list = scope === 'platform' ? PLATFORM_SYSTEM_ROLES : INSTITUTION_SYSTEM_ROLES;
  return (list as readonly string[]).includes(name);
}
