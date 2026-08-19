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
const DEMO_OWNER_PASSWORD = process.env.SEED_DEMO_OWNER_PASSWORD || 'Owner@12345';
const DEMO_TEACHER_EMAIL = process.env.SEED_DEMO_TEACHER_EMAIL || 'teacher@demo.edu';
const DEMO_TEACHER_PASSWORD = process.env.SEED_DEMO_TEACHER_PASSWORD || 'Teacher@12345';
const DEMO_ACCOUNTANT_EMAIL = process.env.SEED_DEMO_ACCOUNTANT_EMAIL || 'accountant@demo.edu';
const DEMO_ACCOUNTANT_PASSWORD = process.env.SEED_DEMO_ACCOUNTANT_PASSWORD || 'Accountant@12345';

async function seedPlatformAdmin() {
  const existing = await prisma.users.findUnique({
    where: { email: PLATFORM_ADMIN_EMAIL },
  });

  if (existing) {
    console.log(`Platform admin already exists: ${PLATFORM_ADMIN_EMAIL}`);
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
  if (existing) {
    console.log(`Demo user already exists: ${opts.email}`);
    return existing.id;
  }

  const passwordHash = await bcrypt.hash(opts.password, 12);
  const user = await prisma.users.create({
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

  await prisma.user_passwords.create({
    data: {
      user_id: user.id,
      password_hash: passwordHash,
      is_current: true,
    },
  });

  await roleService.assignByName(user.id, opts.roleName, opts.institutionId, user.id);
  for (const extra of opts.extraCampuses || []) {
    await roleService.assignByName(user.id, extra.roleName, extra.institutionId, user.id);
  }

  console.log(`Demo ${opts.roleName} created: ${opts.email} / ${opts.password}`);
  return user.id;
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

  const existingSession = await prisma.academic_sessions.findFirst({
    where: { institution_id: campusA.id, deleted_at: null },
  });
  if (!existingSession) {
    await prisma.academic_sessions.create({
      data: {
        institution_id: campusA.id,
        name: '2026-27',
        start_date: new Date('2026-04-01'),
        end_date: new Date('2027-03-31'),
        is_current: true,
      },
    });
    await prisma.academic_sessions.create({
      data: {
        institution_id: campusB.id,
        name: '2026-27',
        start_date: new Date('2026-04-01'),
        end_date: new Date('2027-03-31'),
        is_current: true,
      },
    });
    console.log('Academic sessions created for demo campuses');
  }

  await ensureInstitutionUser({
    email: DEMO_OWNER_EMAIL,
    password: DEMO_OWNER_PASSWORD,
    firstName: 'Anita',
    lastName: 'Sharma',
    institutionId: campusA.id,
    roleName: 'institution_owner',
    extraCampuses: [{ institutionId: campusB.id, roleName: 'institution_owner' }],
  });

  await ensureInstitutionUser({
    email: DEMO_TEACHER_EMAIL,
    password: DEMO_TEACHER_PASSWORD,
    firstName: 'Ravi',
    lastName: 'Kumar',
    institutionId: campusA.id,
    roleName: 'teacher',
  });

  await ensureInstitutionUser({
    email: DEMO_ACCOUNTANT_EMAIL,
    password: DEMO_ACCOUNTANT_PASSWORD,
    firstName: 'Priya',
    lastName: 'Iyer',
    institutionId: campusA.id,
    roleName: 'accountant',
    extraCampuses: [{ institutionId: campusB.id, roleName: 'accountant' }],
  });

  const session =
    (await prisma.academic_sessions.findFirst({
      where: { institution_id: campusA.id, deleted_at: null },
    })) ||
    (await prisma.academic_sessions.create({
      data: {
        institution_id: campusA.id,
        name: '2026-27',
        start_date: new Date('2026-04-01'),
        end_date: new Date('2027-03-31'),
        is_current: true,
      },
    }));

  const DEMO_STUDENT_EMAIL = process.env.SEED_DEMO_STUDENT_EMAIL || 'student@demo.edu';
  const DEMO_STUDENT_PASSWORD = process.env.SEED_DEMO_STUDENT_PASSWORD || 'Student@12345';
  const DEMO_PARENT_EMAIL = process.env.SEED_DEMO_PARENT_EMAIL || 'parent@demo.edu';
  const DEMO_PARENT_PASSWORD = process.env.SEED_DEMO_PARENT_PASSWORD || 'Parent@12345';

  let studentUser = await prisma.users.findUnique({ where: { email: DEMO_STUDENT_EMAIL } });
  if (!studentUser) {
    studentUser = await prisma.users.create({
      data: {
        first_name: 'Aarav',
        last_name: 'Sharma',
        email: DEMO_STUDENT_EMAIL,
        user_type: 'student',
        institution_id: campusA.id,
        email_verified: true,
        is_active: true,
      },
    });
    await prisma.user_passwords.create({
      data: {
        user_id: studentUser.id,
        password_hash: await bcrypt.hash(DEMO_STUDENT_PASSWORD, 12),
        is_current: true,
      },
    });
    console.log(`Portal student: ${DEMO_STUDENT_EMAIL} / ${DEMO_STUDENT_PASSWORD}`);
  }

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
      },
    });
  } else if (!student.user_id) {
    await prisma.students.update({
      where: { id: student.id },
      data: { user_id: studentUser.id },
    });
  }

  let parentUser = await prisma.users.findUnique({ where: { email: DEMO_PARENT_EMAIL } });
  if (!parentUser) {
    parentUser = await prisma.users.create({
      data: {
        first_name: 'Neha',
        last_name: 'Sharma',
        email: DEMO_PARENT_EMAIL,
        user_type: 'parent',
        institution_id: campusA.id,
        email_verified: true,
        is_active: true,
      },
    });
    await prisma.user_passwords.create({
      data: {
        user_id: parentUser.id,
        password_hash: await bcrypt.hash(DEMO_PARENT_PASSWORD, 12),
        is_current: true,
      },
    });
    console.log(`Portal parent: ${DEMO_PARENT_EMAIL} / ${DEMO_PARENT_PASSWORD}`);
  }

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
  } else if (!parent.user_id) {
    await prisma.parents.update({
      where: { id: parent.id },
      data: { user_id: parentUser.id },
    });
  }

  const link = await prisma.student_parent_links.findFirst({
    where: { student_id: student.id, parent_id: parent.id },
  });
  if (!link) {
    await prisma.student_parent_links.create({
      data: { student_id: student.id, parent_id: parent.id, is_primary: true },
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
