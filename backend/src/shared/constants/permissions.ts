/**
 * GradGrid — Permission Registry Catalog
 *
 * Authoritative list of permission keys (Database Design §5.3).
 * Seeded into permission_registry; not writable by users.
 */

export interface PermissionDefinition {
  module: string;
  action: string;
  key: string;
  description: string;
}

export const PLATFORM_ONLY_MODULES = [
  'platform_users',
  'platform_audit',
  'feature_flags',
] as const;

export const LOCKED_ROLE_NAMES = ['platform_super_admin', 'institution_owner'] as const;

export const PLATFORM_SYSTEM_ROLES = [
  'platform_super_admin',
  'platform_admin',
  'support_executive',
  'customer_success',
  'sales_executive',
  'developer',
  'devops_engineer',
  'security_auditor',
] as const;

export const INSTITUTION_SYSTEM_ROLES = [
  'institution_owner',
  'institution_admin',
  'academic_coordinator',
  'teacher',
  'accountant',
  'librarian',
  'receptionist',
  'hr',
] as const;

export const MODULE_LABELS: Record<string, string> = {
  students: 'Students',
  teachers: 'Teachers',
  admissions: 'Admissions',
  attendance: 'Attendance',
  examination: 'Examination',
  fees: 'Fees',
  salary: 'Salary',
  library: 'Library',
  users: 'Users',
  roles: 'Roles',
  communication: 'Communication',
  documents: 'Documents',
  reports: 'Reports',
  audit_logs: 'Audit Logs',
  settings: 'Settings',
  organization: 'Organization',
  institution: 'Institution',
  platform_users: 'Platform Users',
  platform_audit: 'Platform Audit',
  feature_flags: 'Feature Flags',
};

export const PERMISSION_CATALOG: PermissionDefinition[] = [
  { module: 'students', action: 'view', key: 'students.view', description: 'View student records' },
  { module: 'students', action: 'create', key: 'students.create', description: 'Create student records' },
  { module: 'students', action: 'update', key: 'students.update', description: 'Update student records' },
  { module: 'students', action: 'delete', key: 'students.delete', description: 'Soft-delete student records' },
  { module: 'students', action: 'restore', key: 'students.restore', description: 'Restore deleted student records' },
  { module: 'students', action: 'archive', key: 'students.archive', description: 'Archive student records' },
  { module: 'students', action: 'export', key: 'students.export', description: 'Export student records' },
  { module: 'students', action: 'import', key: 'students.import', description: 'Import student records' },
  { module: 'students', action: 'reveal_sensitive', key: 'students.reveal_sensitive', description: 'Reveal encrypted student fields' },
  { module: 'students', action: 'export_sensitive', key: 'students.export_sensitive', description: 'Export encrypted student fields' },

  { module: 'teachers', action: 'view', key: 'teachers.view', description: 'View teacher records' },
  { module: 'teachers', action: 'create', key: 'teachers.create', description: 'Create teacher records' },
  { module: 'teachers', action: 'update', key: 'teachers.update', description: 'Update teacher records' },
  { module: 'teachers', action: 'delete', key: 'teachers.delete', description: 'Delete teacher records' },
  { module: 'teachers', action: 'restore', key: 'teachers.restore', description: 'Restore teacher records' },
  { module: 'teachers', action: 'export', key: 'teachers.export', description: 'Export teacher records' },
  { module: 'teachers', action: 'import', key: 'teachers.import', description: 'Import teacher records' },
  { module: 'teachers', action: 'reveal_sensitive', key: 'teachers.reveal_sensitive', description: 'Reveal encrypted teacher fields' },

  { module: 'admissions', action: 'view', key: 'admissions.view', description: 'View admission enquiries' },
  { module: 'admissions', action: 'create', key: 'admissions.create', description: 'Create admission enquiries' },
  { module: 'admissions', action: 'update', key: 'admissions.update', description: 'Update admission enquiries' },
  { module: 'admissions', action: 'approve', key: 'admissions.approve', description: 'Approve admission applications' },
  { module: 'admissions', action: 'convert', key: 'admissions.convert', description: 'Convert admissions to students' },
  { module: 'admissions', action: 'export', key: 'admissions.export', description: 'Export admission data' },

  { module: 'attendance', action: 'view', key: 'attendance.view', description: 'View attendance' },
  { module: 'attendance', action: 'mark', key: 'attendance.mark', description: 'Mark attendance' },
  { module: 'attendance', action: 'update', key: 'attendance.update', description: 'Update attendance records' },
  { module: 'attendance', action: 'export', key: 'attendance.export', description: 'Export attendance' },

  { module: 'examination', action: 'view', key: 'examination.view', description: 'View examinations' },
  { module: 'examination', action: 'configure', key: 'examination.configure', description: 'Configure examinations' },
  { module: 'examination', action: 'enter_marks', key: 'examination.enter_marks', description: 'Enter examination marks' },
  { module: 'examination', action: 'approve_marks', key: 'examination.approve_marks', description: 'Approve examination marks' },
  { module: 'examination', action: 'generate', key: 'examination.generate', description: 'Generate exam artefacts' },
  { module: 'examination', action: 'export', key: 'examination.export', description: 'Export examination data' },

  { module: 'fees', action: 'view', key: 'fees.view', description: 'View fee records' },
  { module: 'fees', action: 'create', key: 'fees.create', description: 'Create fee structures' },
  { module: 'fees', action: 'update', key: 'fees.update', description: 'Update fee records' },
  { module: 'fees', action: 'record_payment', key: 'fees.record_payment', description: 'Record fee payments' },
  { module: 'fees', action: 'apply_discount', key: 'fees.apply_discount', description: 'Apply fee discounts' },
  { module: 'fees', action: 'export', key: 'fees.export', description: 'Export fee data' },
  { module: 'fees', action: 'generate', key: 'fees.generate', description: 'Generate fee artefacts' },

  { module: 'salary', action: 'view', key: 'salary.view', description: 'View salary records' },
  { module: 'salary', action: 'view_own', key: 'salary.view_own', description: 'View own salary' },
  { module: 'salary', action: 'manage', key: 'salary.manage', description: 'Manage payroll' },
  { module: 'salary', action: 'export', key: 'salary.export', description: 'Export salary data' },

  { module: 'library', action: 'view', key: 'library.view', description: 'View library records' },
  { module: 'library', action: 'manage', key: 'library.manage', description: 'Manage library catalogue' },
  { module: 'library', action: 'issue', key: 'library.issue', description: 'Issue and return books' },
  { module: 'library', action: 'generate', key: 'library.generate', description: 'Generate library artefacts' },

  { module: 'users', action: 'view', key: 'users.view', description: 'View users' },
  { module: 'users', action: 'invite', key: 'users.invite', description: 'Invite users' },
  { module: 'users', action: 'update', key: 'users.update', description: 'Update users' },
  { module: 'users', action: 'deactivate', key: 'users.deactivate', description: 'Deactivate users' },

  { module: 'roles', action: 'view', key: 'roles.view', description: 'View roles and permissions' },
  { module: 'roles', action: 'create', key: 'roles.create', description: 'Create custom roles' },
  { module: 'roles', action: 'update', key: 'roles.update', description: 'Update roles and permission mappings' },
  { module: 'roles', action: 'delete', key: 'roles.delete', description: 'Delete custom roles' },
  { module: 'roles', action: 'assign', key: 'roles.assign', description: 'Assign roles to users' },

  { module: 'communication', action: 'view', key: 'communication.view', description: 'View communications' },
  { module: 'communication', action: 'send', key: 'communication.send', description: 'Send communications' },
  { module: 'communication', action: 'manage_templates', key: 'communication.manage_templates', description: 'Manage communication templates' },

  { module: 'documents', action: 'view', key: 'documents.view', description: 'View documents' },
  { module: 'documents', action: 'generate', key: 'documents.generate', description: 'Generate documents' },
  { module: 'documents', action: 'share', key: 'documents.share', description: 'Share documents' },

  { module: 'reports', action: 'view', key: 'reports.view', description: 'View reports' },
  { module: 'reports', action: 'export', key: 'reports.export', description: 'Export reports' },

  { module: 'audit_logs', action: 'view', key: 'audit_logs.view', description: 'View institution audit logs' },
  { module: 'audit_logs', action: 'export', key: 'audit_logs.export', description: 'Export institution audit logs' },
  { module: 'audit_logs', action: 'view_own', key: 'audit_logs.view_own', description: 'View own audit activity' },

  { module: 'settings', action: 'view', key: 'settings.view', description: 'View institution settings' },
  { module: 'settings', action: 'update', key: 'settings.update', description: 'Update institution settings' },
  { module: 'settings', action: 'configure_branding', key: 'settings.configure_branding', description: 'Configure institution branding' },

  { module: 'organization', action: 'view', key: 'organization.view', description: 'View organizations' },
  { module: 'organization', action: 'manage', key: 'organization.manage', description: 'Manage organizations' },

  { module: 'institution', action: 'view', key: 'institution.view', description: 'View institutions' },
  { module: 'institution', action: 'manage', key: 'institution.manage', description: 'Manage institutions' },

  { module: 'platform_users', action: 'view', key: 'platform_users.view', description: 'View platform users and signup requests' },
  { module: 'platform_users', action: 'manage', key: 'platform_users.manage', description: 'Manage platform users and approve signups' },

  { module: 'platform_audit', action: 'view', key: 'platform_audit.view', description: 'View platform audit logs' },
  { module: 'platform_audit', action: 'export', key: 'platform_audit.export', description: 'Export platform audit logs' },

  { module: 'feature_flags', action: 'manage', key: 'feature_flags.manage', description: 'Manage feature flags' },
];

export const ALL_PERMISSION_KEYS = PERMISSION_CATALOG.map((p) => p.key);

export function isLockedRole(name: string): boolean {
  return (LOCKED_ROLE_NAMES as readonly string[]).includes(name);
}

export function isPlatformOnlyKey(key: string): boolean {
  const moduleName = key.split('.')[0];
  return (
    (PLATFORM_ONLY_MODULES as readonly string[]).includes(moduleName) ||
    key === 'organization.manage'
  );
}

export function institutionPermissionKeys(): string[] {
  return ALL_PERMISSION_KEYS.filter((key) => !isPlatformOnlyKey(key));
}

export function groupPermissionsByModule(keys?: string[]) {
  const allowed = keys ? new Set(keys) : null;
  const modules = new Map<
    string,
    { key: string; label: string; permissions: PermissionDefinition[] }
  >();

  for (const entry of PERMISSION_CATALOG) {
    if (allowed && !allowed.has(entry.key)) continue;
    const existing = modules.get(entry.module);
    if (existing) {
      existing.permissions.push(entry);
    } else {
      modules.set(entry.module, {
        key: entry.module,
        label: MODULE_LABELS[entry.module] || entry.module,
        permissions: [entry],
      });
    }
  }

  return Array.from(modules.values());
}
