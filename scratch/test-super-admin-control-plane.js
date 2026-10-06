const API_URL = 'http://localhost:4000';

async function runSuperAdminControlPlaneTests() {
  console.log('==================================================');
  console.log('SELLDESK — SUPER ADMIN CONTROL PLANE SECURITY & AUDIT SUITE');
  console.log('==================================================\n');

  const ts = Date.now().toString(36);
  const adminEmail = `superadmin_${ts}@selldesk.test`;
  const ownerEmail = `merchant_${ts}@store.test`;
  const password = 'Password123!';

  // 1. Direct Prisma setup: Create Super Admin & Normal Merchant User
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const bcrypt = require('bcryptjs');
  const passwordHash = bcrypt.hashSync(password, 10);

  const superAdminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      fullName: 'Super Admin Test',
      platformRole: 'SUPER_ADMIN',
    },
  });

  const merchantUser = await prisma.user.create({
    data: {
      email: ownerEmail,
      passwordHash,
      fullName: 'Merchant Owner Test',
      platformRole: 'USER',
    },
  });

  const merchantBiz = await prisma.business.create({
    data: {
      name: `Merchant Brand ${ts}`,
      slug: `merchant-brand-${ts}`,
      status: 'APPROVED',
    },
  });

  await prisma.businessMember.create({
    data: {
      userId: merchantUser.id,
      businessId: merchantBiz.id,
      role: 'OWNER',
    },
  });

  await prisma.$disconnect();

  // 2. Login as Super Admin
  const adminLoginRes = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password }),
  });
  const adminAuth = await adminLoginRes.json();
  const adminToken = adminAuth.accessToken;

  // 3. Login as Merchant Owner
  const merchantLoginRes = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ownerEmail, password }),
  });
  const merchantAuth = await merchantLoginRes.json();
  const merchantToken = merchantAuth.accessToken;

  console.log('[Setup] Super Admin token & Merchant token acquired successfully.\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      process.exitCode = 1;
    }
  }

  // [Test 1] Super Admin access to /api/admin/users
  const usersRes = await fetch(`${API_URL}/api/admin/users`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(usersRes.status === 200, 'Super Admin can access GET /api/admin/users (HTTP 200)');
  const usersData = await usersRes.json();
  assert(Array.isArray(usersData) && usersData.length >= 2, 'Users listing returns array of platform users');

  // [Test 2] Merchant user access to /api/admin/users is BLOCKED (403)
  const forbiddenUsersRes = await fetch(`${API_URL}/api/admin/users`, {
    headers: { Authorization: `Bearer ${merchantToken}` },
  });
  assert(forbiddenUsersRes.status === 403, 'Merchant user blocked from /api/admin/users with HTTP 403 Forbidden');

  // [Test 3] Super Admin access to /api/admin/integrations
  const integrationsRes = await fetch(`${API_URL}/api/admin/integrations`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(integrationsRes.status === 200, 'Super Admin can access GET /api/admin/integrations (HTTP 200)');

  // [Test 4] Super Admin access to /api/admin/billing/summary
  const billingRes = await fetch(`${API_URL}/api/admin/billing/summary`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(billingRes.status === 200, 'Super Admin can access GET /api/admin/billing/summary (HTTP 200)');

  // [Test 5] Super Admin access to /api/admin/system-health
  const healthRes = await fetch(`${API_URL}/api/admin/system-health`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(healthRes.status === 200, 'Super Admin can access GET /api/admin/system-health (HTTP 200)');
  const healthData = await healthRes.json();
  assert(healthData.services.some(s => s.name === 'PostgreSQL Database' && s.status === 'HEALTHY'), 'Live PostgreSQL DB status query returns HEALTHY');

  // [Test 6] Super Admin access to /api/admin/security/audit-logs
  const auditRes = await fetch(`${API_URL}/api/admin/security/audit-logs`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(auditRes.status === 200, 'Super Admin can access GET /api/admin/security/audit-logs (HTTP 200)');

  // [Test 7] Super Admin access to /api/admin/settings
  const settingsRes = await fetch(`${API_URL}/api/admin/settings`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(settingsRes.status === 200, 'Super Admin can access GET /api/admin/settings (HTTP 200)');

  // [Test 8] Support inspector read-only verification
  const supportRes = await fetch(`${API_URL}/api/admin/support/conversations`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(supportRes.status === 200, 'Super Admin can inspect support conversations read-only');

  // [Test 9] Operational mutation on Support route is rejected (404/405/403)
  const supportMutationRes = await fetch(`${API_URL}/api/admin/support/conversations/reply`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Fake support reply' }),
  });
  assert(supportMutationRes.status >= 400, 'Support endpoint blocks operational mutations (no POST reply endpoint)');

  // [Test 10] Verification that passwords & secret tokens are never exposed in user listings
  const sampleUser = usersData[0];
  assert(!sampleUser.passwordHash && !sampleUser.accessToken, 'Admin user endpoints never expose password hashes or access tokens');

  console.log('\n==================================================');
  console.log(`RESULTS: ${passed} / ${total} ASSERTIONS PASSED`);
  console.log('==================================================');
  if (passed === total) {
    console.log('Status: PASS');
  } else {
    console.log('Status: FAIL');
    process.exit(1);
  }
}

runSuperAdminControlPlaneTests().catch((err) => {
  console.error('Super Admin test suite exception:', err);
  process.exit(1);
});
