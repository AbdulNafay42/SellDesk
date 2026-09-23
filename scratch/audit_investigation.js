const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== SELLDESK DATABASE AUDIT ===\n');

  try {
    const users = await prisma.user.findMany({
      include: {
        memberships: {
          include: { business: true }
        }
      }
    });

    console.log(`[USER COUNT IN POSTGRESQL]: ${users.length}`);
    users.forEach(u => {
      console.log(`\nUser: ${u.email} (ID: ${u.id}, Name: ${u.fullName}, Role: ${u.platformRole})`);
      console.log(`  Memberships count: ${u.memberships.length}`);
      u.memberships.forEach((m, idx) => {
        console.log(`    ${idx+1}. BizID: ${m.businessId} | BizName: ${m.business.name} | Role: ${m.role} | Status: ${m.business.status}`);
      });
    });

    const businesses = await prisma.business.findMany({
      include: {
        members: {
          include: { user: true }
        }
      }
    });

    console.log(`\n\n[BUSINESS COUNT IN POSTGRESQL]: ${businesses.length}`);
    businesses.forEach(b => {
      console.log(`\nBusiness: ${b.name} (ID: ${b.id}, Status: ${b.status}, Slug: ${b.slug}, CreatedAt: ${b.createdAt})`);
      console.log(`  Members count: ${b.members.length}`);
      b.members.forEach((m, idx) => {
        console.log(`    ${idx+1}. UserID: ${m.userId} | UserEmail: ${m.user.email} | Role: ${m.role}`);
      });
    });

  } catch (err) {
    console.error('Error querying Prisma DB:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
