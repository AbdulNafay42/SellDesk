const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing Prisma connection...');
    await prisma.$connect();
    console.log('Prisma connected successfully!');
    
    // Check existing counts
    const userCount = await prisma.user.count();
    const businessCount = await prisma.business.count();
    const memberCount = await prisma.businessMember.count();
    
    console.log(`User count: ${userCount}`);
    console.log(`Business count: ${businessCount}`);
    console.log(`BusinessMember count: ${memberCount}`);

    const businesses = await prisma.business.findMany();
    console.log('Businesses:', businesses);

    const users = await prisma.user.findMany({
      select: { id: true, email: true, fullName: true, platformRole: true }
    });
    console.log('Users:', users);

  } catch (error) {
    console.error('Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
