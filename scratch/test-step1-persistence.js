const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runStep1Verification() {
  console.log('==================================================');
  console.log('SELLDESK STEP 1 — POSTGRESQL PERSISTENCE VERIFICATION');
  console.log('==================================================\n');

  try {
    // 1. Verify Prisma Connection
    console.log('[1/6] Connecting to PostgreSQL database (selldesk)...');
    await prisma.$connect();
    console.log('✔ Connected successfully!\n');

    // 2. Perform Registration
    const timestamp = Date.now();
    const testEmail = `step1_owner_${timestamp}@selldesk-test.com`;
    const testPassword = `SecurePassword123!`;
    const testFullName = `Step 1 Test Owner`;
    const testBizName = `Step 1 Store ${timestamp}`;
    const testSlug = `step-1-store-${timestamp}`;

    console.log(`[2/6] Registering new test account: ${testEmail}...`);
    const bcrypt = require('bcryptjs');
    const passwordHash = bcrypt.hashSync(testPassword, 10);

    const regResult = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: testEmail.toLowerCase(),
          passwordHash,
          fullName: testFullName,
          phoneNumber: '03001234567',
          platformRole: 'USER',
        },
      });

      const business = await tx.business.create({
        data: {
          name: testBizName,
          slug: testSlug,
          status: 'PENDING',
          phone: '03001234567',
          city: 'Lahore',
          country: 'Pakistan',
        },
      });

      const member = await tx.businessMember.create({
        data: {
          userId: user.id,
          businessId: business.id,
          role: 'OWNER',
        },
      });

      return { user, business, member };
    });

    console.log(`✔ Registered User ID: ${regResult.user.id}`);
    console.log(`✔ Registered Business ID: ${regResult.business.id} (Status: ${regResult.business.status})\n`);

    // 3. Verify PostgreSQL Persistence of PENDING State
    console.log('[3/6] Verifying DB persistence of PENDING state...');
    const dbUser = await prisma.user.findUnique({ where: { id: regResult.user.id } });
    const dbBiz = await prisma.business.findUnique({ where: { id: regResult.business.id } });
    const dbMember = await prisma.businessMember.findUnique({
      where: { userId_businessId: { userId: regResult.user.id, businessId: regResult.business.id } },
    });

    if (!dbUser || !dbBiz || !dbMember) {
      throw new Error('Database persistence failed! User, Business, or BusinessMember missing in PostgreSQL.');
    }
    console.log(`✔ PostgreSQL User verified: ${dbUser.email}`);
    console.log(`✔ PostgreSQL Business verified: ${dbBiz.name} [Status: ${dbBiz.status}]`);
    console.log(`✔ PostgreSQL BusinessMember verified: Role ${dbMember.role}\n`);

    // 4. Verify Approval Persistence
    console.log('[4/6] Executing Super Admin approval for Business...');
    const crypto = require('crypto');
    const inviteToken = crypto.randomBytes(32).toString('hex');

    const updatedBiz = await prisma.business.update({
      where: { id: regResult.business.id },
      data: { status: 'APPROVED', approvedAt: new Date() },
    });

    await prisma.invitationToken.create({
      data: {
        token: inviteToken,
        email: dbUser.email,
        userId: dbUser.id,
        businessId: dbBiz.id,
        role: 'OWNER',
        expiresAt: new Date(Date.now() + 48 * 3600 * 1000),
      },
    });

    console.log(`✔ Business status updated to: ${updatedBiz.status}`);
    console.log(`✔ Invitation token generated and stored in PostgreSQL.\n`);

    // 5. Simulate API Restart & Re-Verification
    console.log('[5/6] Simulating API Restart & re-querying fresh Prisma instance...');
    await prisma.$disconnect();

    const freshPrisma = new PrismaClient();
    await freshPrisma.$connect();

    const postRestartUser = await freshPrisma.user.findUnique({ where: { id: regResult.user.id } });
    const postRestartBiz = await freshPrisma.business.findUnique({ where: { id: regResult.business.id } });
    const postRestartToken = await freshPrisma.invitationToken.findUnique({ where: { token: inviteToken } });

    if (postRestartBiz.status !== 'APPROVED') {
      throw new Error('Persistence failure after API restart! Status is not APPROVED.');
    }
    if (!postRestartToken) {
      throw new Error('Persistence failure after API restart! Invitation token lost.');
    }

    console.log('✔ Re-verification post-restart SUCCESSFUL!');
    console.log(`✔ User: ${postRestartUser.email}`);
    console.log(`✔ Business: ${postRestartBiz.name} [Status: ${postRestartBiz.status}]`);
    console.log(`✔ Token: ${postRestartToken.token.substring(0, 10)}...\n`);

    // 6. Verify New Business Starts Empty
    console.log('[6/6] Verifying newly approved business starts empty...');
    const ordersCount = await freshPrisma.order.count({ where: { businessId: regResult.business.id } });
    const customersCount = await freshPrisma.customer.count({ where: { businessId: regResult.business.id } });
    const productsCount = await freshPrisma.product.count({ where: { businessId: regResult.business.id } });

    console.log(`✔ Orders count: ${ordersCount}`);
    console.log(`✔ Customers count: ${customersCount}`);
    console.log(`✔ Products count: ${productsCount}`);

    if (ordersCount !== 0 || customersCount !== 0 || productsCount !== 0) {
      throw new Error('Newly approved business did not start empty!');
    }

    await freshPrisma.$disconnect();
    console.log('\n==================================================');
    console.log('ALL STEP 1 POSTGRESQL PERSISTENCE CHECKS PASSED 🚀');
    console.log('==================================================');
  } catch (err) {
    console.error('\n❌ VERIFICATION FAILED:', err.message);
    process.exit(1);
  }
}

runStep1Verification();
