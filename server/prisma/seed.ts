import { PrismaClient, Role, PlanType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@securiscan.dev' },
    update: {},
    create: {
      email: 'admin@securiscan.dev',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'SecuriScan',
      role: Role.ADMIN,
      plan: PlanType.BUSINESS,
      emailVerified: true,
    },
  });
  console.log(`Admin user created: ${admin.email}`);

  // Create demo user (PRO plan)
  const proPassword = await bcrypt.hash('Demo123!', 12);
  const proUser = await prisma.user.upsert({
    where: { email: 'demo@securiscan.dev' },
    update: {},
    create: {
      email: 'demo@securiscan.dev',
      passwordHash: proPassword,
      firstName: 'Demo',
      lastName: 'User',
      role: Role.USER,
      plan: PlanType.PRO,
      emailVerified: true,
    },
  });
  console.log(`Demo user created: ${proUser.email}`);

  // Create free user
  const freePassword = await bcrypt.hash('Free123!', 12);
  const freeUser = await prisma.user.upsert({
    where: { email: 'free@securiscan.dev' },
    update: {},
    create: {
      email: 'free@securiscan.dev',
      passwordHash: freePassword,
      firstName: 'Free',
      lastName: 'User',
      role: Role.USER,
      plan: PlanType.FREE,
      emailVerified: true,
    },
  });
  console.log(`Free user created: ${freeUser.email}`);

  // Create demo sites for pro user
  const sites = await Promise.all([
    prisma.site.upsert({
      where: { url_userId: { url: 'https://example.com', userId: proUser.id } },
      update: {},
      create: {
        url: 'https://example.com',
        name: 'Example.com',
        userId: proUser.id,
      },
    }),
    prisma.site.upsert({
      where: { url_userId: { url: 'https://github.com', userId: proUser.id } },
      update: {},
      create: {
        url: 'https://github.com',
        name: 'GitHub',
        userId: proUser.id,
      },
    }),
  ]);
  console.log(`${sites.length} demo sites created`);

  console.log('\nSeed completed!');
  console.log('\nDemo accounts:');
  console.log('  Admin:  admin@securiscan.dev / Admin123!');
  console.log('  Pro:    demo@securiscan.dev  / Demo123!');
  console.log('  Free:   free@securiscan.dev  / Free123!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
