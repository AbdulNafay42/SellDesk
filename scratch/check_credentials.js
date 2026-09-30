require('dotenv').config({ path: 'apps/api/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCredentials() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      platformRole: true,
      memberships: {
        select: {
          role: true,
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
            },
          },
        },
      },
    },
  });

  const businesses = await prisma.business.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log('=== REGISTERED USERS & BRAND MEMBERSHIPS ===');
  console.log(JSON.stringify(users, null, 2));

  console.log('\n=== REGISTERED BRANDS / BUSINESSES ===');
  console.log(JSON.stringify(businesses, null, 2));
}

checkCredentials()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
