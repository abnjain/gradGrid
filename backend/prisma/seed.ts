/**
 * GradGrid — Database Seed
 *
 * Creates RBAC registry, platform super-admin, and multi-campus demo data.
 * Run: npm run prisma:seed
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { createPgPool } from '../src/config/pg-pool';
import {
  assignPlatformSuperAdmin,
  seedRbacRegistryAndPlatformRoles,
} from '../src/modules/rbac/seed-rbac';
import { roleService } from '../src/modules/rbac/role.service';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required. For Render external access append ?sslmode=require');
}

const pool = createPgPool(process.env.DATABASE_URL);
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PLATFORM_ADMIN_EMAIL = process.env.SEED_PLATFORM_ADMIN_EMAIL || 'admin@gradgrid.app';
const PLATFORM_ADMIN_PASSWORD = process.env.SEED_PLATFORM_ADMIN_PASSWORD || 'Admin@12345';
const DEMO_OWNER_EMAIL = process.env.SEED_DEMO_OWNER_EMAIL || 'owner@demo.edu';
const DEMO_TEACHER_EMAIL = process.env.SEED_DEMO_TEACHER_EMAIL || 'teacher@demo.edu';
const DEMO_ACCOUNTANT_EMAIL = process.env.SEED_DEMO_ACCOUNTANT_EMAIL || 'accountant@demo.edu';
const DEMO_COMMON_PASSWORD = process.env.SEED_DEMO_COMMON_PASSWORD || 'GradGrid@12345';
const RESET_SEED_PASSWORDS = process.env.SEED_RESET_PASSWORDS === 'true';

async function ensureUserPassword(
  userId: string,
  password: string,
  resetExisting = RESET_SEED_PASSWORDS
) {
  const currentPassword = await prisma.user_passwords.findFirst({
    where: { user_id: userId, is_current: true },
  });
  if (currentPassword && !resetExisting) return;

  if (currentPassword) {
    await prisma.user_passwords.updateMany({
      where: { user_id: userId, is_current: true },
      data: { is_current: false },
    });
  }

  await prisma.user_passwords.create({
    data: {
      user_id: userId,
      password_hash: await bcrypt.hash(password, 12),
      is_current: true,
    },
  });
}

async function seedPlatformAdmin() {
  const existing = await prisma.users.findUnique({
    where: { email: PLATFORM_ADMIN_EMAIL },
  });

  if (existing) {
    console.log(`Platform admin already exists: ${PLATFORM_ADMIN_EMAIL}`);
    await prisma.users.update({
      where: { id: existing.id },
      data: {
        first_name: 'Platform',
        last_name: 'Admin',
        user_type: 'platform',
        email_verified: true,
        is_active: true,
      },
    });
    // The platform administrator is intentionally never reset by the demo
    // password flag; preserve the administrator's existing credential.
    await ensureUserPassword(existing.id, PLATFORM_ADMIN_PASSWORD, false);
    await assignPlatformSuperAdmin(existing.id);
    return existing.id;
  }

  const passwordHash = await bcrypt.hash(PLATFORM_ADMIN_PASSWORD, 12);
  const user = await prisma.users.create({
    data: {
      first_name: 'Platform',
      last_name: 'Admin',
      email: PLATFORM_ADMIN_EMAIL,
      user_type: 'platform',
      email_verified: true,
      is_active: true,
    },
  });

  await prisma.user_passwords.create({
    data: {
      user_id: user.id,
      password_hash: passwordHash,
      is_current: true,
    },
  });

  await assignPlatformSuperAdmin(user.id);

  console.log('Platform admin created:');
  console.log(`  Email:    ${PLATFORM_ADMIN_EMAIL}`);
  console.log(`  Password: ${PLATFORM_ADMIN_PASSWORD}`);
  return user.id;
}

async function ensureInstitutionUser(opts: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  institutionId: string;
  roleName: string;
  extraCampuses?: Array<{ institutionId: string; roleName: string }>;
}) {
  const existing = await prisma.users.findUnique({ where: { email: opts.email } });
  const user = existing
    ? await prisma.users.update({
        where: { id: existing.id },
        data: {
          first_name: opts.firstName,
          last_name: opts.lastName,
          user_type: 'institution',
          institution_id: opts.institutionId,
          email_verified: true,
          is_active: true,
        },
      })
    : await prisma.users.create({
        data: {
          first_name: opts.firstName,
          last_name: opts.lastName,
          email: opts.email,
          user_type: 'institution',
          institution_id: opts.institutionId,
          email_verified: true,
          is_active: true,
        },
      });

  await ensureUserPassword(user.id, opts.password);

  await roleService.assignByName(user.id, opts.roleName, opts.institutionId, user.id);
  for (const extra of opts.extraCampuses || []) {
    await roleService.assignByName(user.id, extra.roleName, extra.institutionId, user.id);
  }

  console.log(
    `Demo ${opts.roleName} ${existing ? 'updated' : 'created'}: ${opts.email} / ${opts.password}`
  );
  return user.id;
}

async function ensurePortalUser(opts: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'student' | 'parent';
  institutionId: string;
}) {
  const existing = await prisma.users.findUnique({ where: { email: opts.email } });
  const user = existing
    ? await prisma.users.update({
        where: { id: existing.id },
        data: {
          first_name: opts.firstName,
          last_name: opts.lastName,
          user_type: opts.userType,
          institution_id: opts.institutionId,
          email_verified: true,
          is_active: true,
        },
      })
    : await prisma.users.create({
        data: {
          first_name: opts.firstName,
          last_name: opts.lastName,
          email: opts.email,
          user_type: opts.userType,
          institution_id: opts.institutionId,
          email_verified: true,
          is_active: true,
        },
      });

  await ensureUserPassword(user.id, opts.password);
  console.log(
    `Portal ${opts.userType} ${existing ? 'updated' : 'created'}: ${opts.email} / ${opts.password}`
  );
  return user;
}

async function seedMultiCampusDemo() {
  let organization = await prisma.organizations.findFirst({
    where: { slug: 'edutrust-foundation', deleted_at: null },
  });

  if (!organization) {
    organization = await prisma.organizations.create({
      data: {
        name: 'EduTrust Foundation',
        slug: 'edutrust-foundation',
        email: 'contact@edutrust.edu',
      },
    });
  }

  let campusA = await prisma.institutions.findFirst({
    where: { code: 'GHS-001', deleted_at: null },
  });
  if (!campusA) {
    campusA = await prisma.institutions.create({
      data: {
        organization_id: organization.id,
        name: 'Greenwood High School',
        code: 'GHS-001',
        city: 'Mumbai',
        state: 'Maharashtra',
      },
    });
  }

  let campusB = await prisma.institutions.findFirst({
    where: { code: 'RA-002', deleted_at: null },
  });
  if (!campusB) {
    campusB = await prisma.institutions.create({
      data: {
        organization_id: organization.id,
        name: 'Riverside Academy',
        code: 'RA-002',
        city: 'Pune',
        state: 'Maharashtra',
      },
    });
  }

  await roleService.provisionInstitutionRoles(campusA.id, null);
  await roleService.provisionInstitutionRoles(campusB.id, null);

  async function ensureAcademicSession(institutionId: string) {
    const existing = await prisma.academic_sessions.findFirst({
      where: { institution_id: institutionId, name: '2026-27', deleted_at: null },
    });
    return (
      existing ||
      prisma.academic_sessions.create({
        data: {
          institution_id: institutionId,
          name: '2026-27',
          start_date: new Date('2026-04-01'),
          end_date: new Date('2027-03-31'),
          is_current: true,
        },
      })
    );
  }

  const session = await ensureAcademicSession(campusA.id);
  await ensureAcademicSession(campusB.id);
  console.log('Academic sessions ready for demo campuses');

  await ensureInstitutionUser({
    email: DEMO_OWNER_EMAIL,
    password: DEMO_COMMON_PASSWORD,
    firstName: 'Anita',
    lastName: 'Sharma',
    institutionId: campusA.id,
    roleName: 'institution_owner',
    extraCampuses: [{ institutionId: campusB.id, roleName: 'institution_owner' }],
  });

  await ensureInstitutionUser({
    email: DEMO_TEACHER_EMAIL,
    password: DEMO_COMMON_PASSWORD,
    firstName: 'Ravi',
    lastName: 'Kumar',
    institutionId: campusA.id,
    roleName: 'teacher',
  });

  await ensureInstitutionUser({
    email: DEMO_ACCOUNTANT_EMAIL,
    password: DEMO_COMMON_PASSWORD,
    firstName: 'Priya',
    lastName: 'Iyer',
    institutionId: campusA.id,
    roleName: 'accountant',
    extraCampuses: [{ institutionId: campusB.id, roleName: 'accountant' }],
  });

  const demoClass =
    (await prisma.classes.findFirst({
      where: {
        institution_id: campusA.id,
        academic_session_id: session.id,
        name: 'Class 10',
        deleted_at: null,
      },
    })) ||
    (await prisma.classes.create({
      data: {
        institution_id: campusA.id,
        academic_session_id: session.id,
        name: 'Class 10',
        sort_order: 10,
      },
    }));

  const demoSection =
    (await prisma.sections.findFirst({
      where: { class_id: demoClass.id, name: 'A', deleted_at: null },
    })) ||
    (await prisma.sections.create({
      data: {
        institution_id: campusA.id,
        class_id: demoClass.id,
        name: 'A',
      },
    }));

  const DEMO_STUDENT_EMAIL = process.env.SEED_DEMO_STUDENT_EMAIL || 'student@demo.edu';
  const DEMO_PARENT_EMAIL = process.env.SEED_DEMO_PARENT_EMAIL || 'parent@demo.edu';

  const studentUser = await ensurePortalUser({
    email: DEMO_STUDENT_EMAIL,
    password: DEMO_COMMON_PASSWORD,
    firstName: 'Aarav',
    lastName: 'Sharma',
    userType: 'student',
    institutionId: campusA.id,
  });

  let student = await prisma.students.findFirst({
    where: { institution_id: campusA.id, admission_number: 'ADM-1001', deleted_at: null },
  });
  if (!student) {
    student = await prisma.students.create({
      data: {
        institution_id: campusA.id,
        academic_session_id: session.id,
        user_id: studentUser.id,
        first_name: 'Aarav',
        last_name: 'Sharma',
        admission_number: 'ADM-1001',
        roll_number: '10101',
        email: DEMO_STUDENT_EMAIL,
        status: 'active',
        gender: 'male',
        date_of_birth: new Date('2010-07-15'),
        class_id: demoClass.id,
        section_id: demoSection.id,
        phone: '+919876543211',
        address: '12 Demo Road, Mumbai',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
      },
    });
  } else {
    student = await prisma.students.update({
      where: { id: student.id },
      data: {
        user_id: studentUser.id,
        academic_session_id: session.id,
        first_name: 'Aarav',
        last_name: 'Sharma',
        roll_number: '10101',
        email: DEMO_STUDENT_EMAIL,
        status: 'active',
        gender: 'male',
        date_of_birth: new Date('2010-07-15'),
        class_id: demoClass.id,
        section_id: demoSection.id,
        phone: '+919876543211',
        address: '12 Demo Road, Mumbai',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
      },
    });
  }

  const enrollment = await prisma.student_section_enrollments.findFirst({
    where: { student_id: student.id, academic_session_id: session.id },
  });
  if (!enrollment) {
    await prisma.student_section_enrollments.create({
      data: {
        institution_id: campusA.id,
        section_id: demoSection.id,
        student_id: student.id,
        academic_session_id: session.id,
      },
    });
  } else {
    await prisma.student_section_enrollments.update({
      where: { id: enrollment.id },
      data: { institution_id: campusA.id, section_id: demoSection.id },
    });
  }

  const parentUser = await ensurePortalUser({
    email: DEMO_PARENT_EMAIL,
    password: DEMO_COMMON_PASSWORD,
    firstName: 'Neha',
    lastName: 'Sharma',
    userType: 'parent',
    institutionId: campusA.id,
  });

  let parent = await prisma.parents.findFirst({
    where: { institution_id: campusA.id, email: DEMO_PARENT_EMAIL, deleted_at: null },
  });
  if (!parent) {
    parent = await prisma.parents.create({
      data: {
        institution_id: campusA.id,
        user_id: parentUser.id,
        first_name: 'Neha',
        last_name: 'Sharma',
        relation: 'mother',
        phone: '+919876543210',
        email: DEMO_PARENT_EMAIL,
      },
    });
  } else {
    parent = await prisma.parents.update({
      where: { id: parent.id },
      data: {
        user_id: parentUser.id,
        first_name: 'Neha',
        last_name: 'Sharma',
        relation: 'mother',
        phone: '+919876543210',
        email: DEMO_PARENT_EMAIL,
      },
    });
  }

  const link = await prisma.student_parent_links.findFirst({
    where: { student_id: student.id, parent_id: parent.id },
  });
  if (!link) {
    await prisma.student_parent_links.create({
      data: { student_id: student.id, parent_id: parent.id, is_primary: true },
    });
  } else if (!link.is_primary) {
    await prisma.student_parent_links.update({
      where: { id: link.id },
      data: { is_primary: true },
    });
  }

  console.log('Multi-campus demo ready:');
  console.log(`  Organization: ${organization.name}`);
  console.log(`  Campuses:     ${campusA.name}, ${campusB.name}`);
  console.log('  Portal:       /portal/login (student@demo.edu, parent@demo.edu)');
}

async function main() {
  await seedRbacRegistryAndPlatformRoles();
  console.log('RBAC permission registry and platform roles seeded');
  await seedPlatformAdmin();
  await seedMultiCampusDemo();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
