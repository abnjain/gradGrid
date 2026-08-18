/**
 * GradGrid — Database Seed
 *
 * Creates a platform super-admin for approving signup requests in development.
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

async function main() {
  const passwordHash = await bcrypt.hash(PLATFORM_ADMIN_PASSWORD, 12);

  const existing = await prisma.users.findUnique({
    where: { email: PLATFORM_ADMIN_EMAIL },
  });

  if (existing) {
    console.log(`Platform admin already exists: ${PLATFORM_ADMIN_EMAIL}`);
    return;
  }

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

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
