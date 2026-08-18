/**
 * GradGrid — Database Seed
 *
 * Creates a platform super-admin and optional multi-campus demo data.
 * Run: npm run prisma:seed
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PLATFORM_ADMIN_EMAIL = process.env.SEED_PLATFORM_ADMIN_EMAIL || 'admin@gradgrid.app';
const PLATFORM_ADMIN_PASSWORD = process.env.SEED_PLATFORM_ADMIN_PASSWORD || 'Admin@12345';
const DEMO_ACCOUNTANT_EMAIL = process.env.SEED_DEMO_ACCOUNTANT_EMAIL || 'accountant@demo.edu';
const DEMO_ACCOUNTANT_PASSWORD = process.env.SEED_DEMO_ACCOUNTANT_PASSWORD || 'Accountant@12345';

async function seedPlatformAdmin() {
  const existing = await prisma.users.findUnique({
    where: { email: PLATFORM_ADMIN_EMAIL },
  });

  if (existing) {
    console.log(`Platform admin already exists: ${PLATFORM_ADMIN_EMAIL}`);
    return;
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

  console.log('Platform admin created:');
  console.log(`  Email:    ${PLATFORM_ADMIN_EMAIL}`);
  console.log(`  Password: ${PLATFORM_ADMIN_PASSWORD}`);
}

async function seedMultiCampusDemo() {
  const existing = await prisma.users.findUnique({
    where: { email: DEMO_ACCOUNTANT_EMAIL },
  });

  if (existing) {
    console.log(`Demo accountant already exists: ${DEMO_ACCOUNTANT_EMAIL}`);
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_ACCOUNTANT_PASSWORD, 12);

  const organization = await prisma.organizations.create({
    data: {
      name: 'EduTrust Foundation',
      slug: 'edutrust-foundation',
      email: 'contact@edutrust.edu',
    },
  });

  const campusA = await prisma.institutions.create({
    data: {
      organization_id: organization.id,
      name: 'Greenwood High School',
      code: 'GHS-001',
      city: 'Mumbai',
      state: 'Maharashtra',
    },
  });

  const campusB = await prisma.institutions.create({
    data: {
      organization_id: organization.id,
      name: 'Riverside Academy',
      code: 'RA-002',
      city: 'Pune',
      state: 'Maharashtra',
    },
  });

  const user = await prisma.users.create({
    data: {
      first_name: 'Priya',
      last_name: 'Iyer',
      email: DEMO_ACCOUNTANT_EMAIL,
      user_type: 'institution',
      institution_id: campusA.id,
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

  for (const campus of [campusA, campusB]) {
    const role = await prisma.roles.create({
      data: {
        institution_id: campus.id,
        name: campus.id === campusA.id ? 'institution_owner' : 'accountant',
        description:
          campus.id === campusA.id
            ? 'Institution Owner — full institution control'
            : 'Accountant — finance module access',
        is_system_role: true,
      },
    });

    await prisma.role_assignments.create({
      data: {
        user_id: user.id,
        role_id: role.id,
        institution_id: campus.id,
        assigned_by: user.id,
      },
    });
  }

  console.log('Multi-campus demo created:');
  console.log(`  Organization: ${organization.name}`);
  console.log(`  Campuses:     ${campusA.name}, ${campusB.name}`);
  console.log(`  Email:        ${DEMO_ACCOUNTANT_EMAIL}`);
  console.log(`  Password:     ${DEMO_ACCOUNTANT_PASSWORD}`);
}

async function main() {
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
