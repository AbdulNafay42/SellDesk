process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/selldesk?schema=public";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== USERS IN DB ===');
  const users = await prisma.user.findMany();
  console.log(`Total users in DB: ${users.length}`);
  users.forEach((u) => {
    console.log(`User: ${u.email} | Role: ${u.platformRole}`);
  });

  console.log('\n=== BUSINESSES IN DB ===');
  const businesses = await prisma.business.findMany();
  console.log(`Total businesses in DB: ${businesses.length}`);
  businesses.forEach((b) => {
    console.log(`Biz: ${b.name} (${b.id}) | Status: ${b.status}`);
  });

  console.log('\n=== MEMBERSHIPS IN DB ===');
  const members = await prisma.businessMember.findMany({
    include: { user: true, business: true }
  });
  console.log(`Total memberships in DB: ${members.length}`);
  members.forEach((m) => {
    console.log(`Mem: User ${m.user.email} -> Biz ${m.business.name} (${m.role})`);
  });

  await prisma.$disconnect();
}

main().catch(console.error);
