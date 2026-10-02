const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- DATABASE CONSISTENCY REPORT ---');
  
  const userCount = await prisma.user.count();
  const businessCount = await prisma.business.count();
  const memberCount = await prisma.businessMember.count();

  console.log(`Total Users: ${userCount}`);
  console.log(`Total Businesses: ${businessCount}`);
  console.log(`Total BusinessMembers: ${memberCount}`);

  // Status breakdown
  const statusCounts = await prisma.business.groupBy({
    by: ['status'],
    _count: true,
  });
  console.log('\nBusiness Status Breakdown:');
  statusCounts.forEach((s) => console.log(`  ${s.status}: ${s._count}`));

  // Businesses per user
  const userMembers = await prisma.businessMember.groupBy({
    by: ['userId'],
    _count: true,
  });
  console.log(`\nUsers with memberships: ${userMembers.length}`);
  const multiBizUsers = userMembers.filter((m) => m._count > 1);
  console.log(`Users with multiple businesses: ${multiBizUsers.length}`);

  // Businesses with 0 members
  const businesses = await prisma.business.findMany({
    include: { _count: { select: { members: true } } },
  });
  const zeroMemberBiz = businesses.filter((b) => b._count.members === 0);
  console.log(`Businesses with 0 members: ${zeroMemberBiz.length}`);

  // Duplicate emails / slugs
  const emails = await prisma.user.groupBy({
    by: ['email'],
    _count: true,
    having: { email: { _count: { gt: 1 } } },
  });
  console.log(`Duplicate emails: ${emails.length}`);

  const slugs = await prisma.business.groupBy({
    by: ['slug'],
    _count: true,
    having: { slug: { _count: { gt: 1 } } },
  });
  console.log(`Duplicate slugs: ${slugs.length}`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
