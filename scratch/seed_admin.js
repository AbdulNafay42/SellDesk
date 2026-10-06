const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seedAdmin() {
  const email = 'abdulnafay2005@gmail.com';
  const passwordHash = bcrypt.hashSync('password123', 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, platformRole: 'SUPER_ADMIN' },
    create: {
      email,
      passwordHash,
      fullName: 'Abdul Nafay (Super Admin)',
      platformRole: 'SUPER_ADMIN',
    },
  });

  let biz = await prisma.business.findFirst({ where: { slug: 'selldesk-apparels-pk' } });
  if (!biz) {
    biz = await prisma.business.create({
      data: {
        name: 'SellDesk Apparels PK',
        slug: 'selldesk-apparels-pk',
        status: 'APPROVED',
        city: 'Lahore',
        country: 'Pakistan',
      },
    });
  }

  console.log('Super Admin User upserted cleanly in PostgreSQL:', user.email);
  await prisma.$disconnect();
}

seedAdmin().catch(console.error);
