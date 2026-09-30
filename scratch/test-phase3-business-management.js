process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/selldesk?schema=public";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const API_BASE = 'http://localhost:4000';

async function runTests() {
  console.log('====================================================');
  console.log('STARTING PHASE 3 — SUPER ADMIN & BUSINESS MANAGEMENT TESTS');
  console.log('====================================================\n');

  try {
    // 1. Super Admin authentication
    console.log('[1] Logging in as Super Admin (abdulnafay2005@gmail.com)...');
    const adminLoginRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'abdulnafay2005@gmail.com', password: 'password123' }),
    });
    const adminLoginData = await adminLoginRes.json();
    if (!adminLoginRes.ok) throw new Error(`Super Admin login failed: ${JSON.stringify(adminLoginData)}`);
    const adminToken = adminLoginData.accessToken;
    console.log('  ✓ Super Admin authenticated.');

    // 2. Register User A and Business A
    const userA_Email = `phase3_user_a_${Date.now()}@test.com`;
    const userA_Pass = 'Password123!';
    const bizA_Name = `Phase3 Brand A ${Date.now()}`;

    console.log('\n[2] Registering User A and Business A via POST /api/auth/register...');
    const regARes = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Phase3 User A',
        email: userA_Email,
        password: userA_Pass,
        phone: '+923001112233',
        businessName: bizA_Name,
        city: 'Lahore',
        country: 'Pakistan',
      }),
    });
    const regAData = await regARes.json();
    if (!regARes.ok) throw new Error(`Registration A failed: ${JSON.stringify(regAData)}`);
    const bizA_Id = regAData.business.id;
    const userA_Id = regAData.user.id;
    const userA_Token = regAData.accessToken;
    console.log(`  ✓ Registered User A ID: ${userA_Id}`);
    console.log(`  ✓ Registered Business A ID: ${bizA_Id} (Status: ${regAData.business.status})`);

    // 3. Direct PostgreSQL Verification for Business A & Member A
    console.log('\n[3] Querying PostgreSQL for Business A & BusinessMember A...');
    const dbBizA = await prisma.business.findUnique({ where: { id: bizA_Id } });
    if (!dbBizA) throw new Error('Business A not found in PostgreSQL DB!');
    if (dbBizA.status !== 'PENDING') throw new Error(`Expected Business A status PENDING in DB, got: ${dbBizA.status}`);

    const dbMemberA = await prisma.businessMember.findUnique({
      where: { userId_businessId: { userId: userA_Id, businessId: bizA_Id } },
    });
    if (!dbMemberA || dbMemberA.role !== 'OWNER') throw new Error('BusinessMember A record invalid in DB!');
    console.log('  ✓ Verified in PostgreSQL: Business A exists with status PENDING and OWNER membership.');

    // 4. Register User B and Business B
    const userB_Email = `phase3_user_b_${Date.now()}@test.com`;
    const userB_Pass = 'Password123!';
    const bizB_Name = `Phase3 Brand B ${Date.now()}`;

    console.log('\n[4] Registering User B and Business B via POST /api/auth/register...');
    const regBRes = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Phase3 User B',
        email: userB_Email,
        password: userB_Pass,
        phone: '+923004445566',
        businessName: bizB_Name,
        city: 'Karachi',
        country: 'Pakistan',
      }),
    });
    const regBData = await regBRes.json();
    if (!regBRes.ok) throw new Error(`Registration B failed: ${JSON.stringify(regBData)}`);
    const bizB_Id = regBData.business.id;
    const userB_Id = regBData.user.id;
    const userB_Token = regBData.accessToken;
    console.log(`  ✓ Registered Business B ID: ${bizB_Id}`);

    // 5. Check Super Admin can fetch Pending Businesses & Tenants
    console.log('\n[5] Super Admin fetching pending businesses via GET /api/admin/pending-businesses...');
    const pendingRes = await fetch(`${API_BASE}/api/admin/pending-businesses`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const pendingData = await pendingRes.json();
    if (!pendingRes.ok) throw new Error(`Fetch pending businesses failed: ${JSON.stringify(pendingData)}`);
    const foundPendingA = pendingData.businesses.find((b) => b.id === bizA_Id);
    if (!foundPendingA) throw new Error(`Business A (${bizA_Id}) not found in Super Admin pending list!`);
    console.log(`  ✓ Super Admin found Business A in pending list (Owner: ${foundPendingA.owner?.fullName}).`);

    // 6. Security Check: Normal user cannot access Super Admin endpoint
    console.log('\n[6] Testing security: Normal User A requesting GET /api/admin/tenants...');
    const normUserAdminRes = await fetch(`${API_BASE}/api/admin/tenants`, {
      headers: { Authorization: `Bearer ${userA_Token}` },
    });
    console.log(`  ✓ Security check status: ${normUserAdminRes.status} (Expected 403)`);
    if (normUserAdminRes.status !== 403) throw new Error(`Expected 403 Forbidden for normal user on admin endpoint, got ${normUserAdminRes.status}`);

    // 7. Super Admin approves Business A
    console.log(`\n[7] Super Admin approving Business A (${bizA_Id})...`);
    const approveRes = await fetch(`${API_BASE}/api/admin/businesses/${bizA_Id}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const approveData = await approveRes.json();
    if (!approveRes.ok) throw new Error(`Approve Business A failed: ${JSON.stringify(approveData)}`);
    console.log(`  ✓ Business A approved. Status: ${approveData.business.status}`);

    // 8. Verify status change in PostgreSQL (Same Business ID)
    console.log('\n[8] Verifying Business A in PostgreSQL after approval...');
    const dbBizA_PostApprove = await prisma.business.findUnique({ where: { id: bizA_Id } });
    if (!dbBizA_PostApprove || dbBizA_PostApprove.status !== 'APPROVED') {
      throw new Error(`Business A status in PostgreSQL is not APPROVED! Got: ${dbBizA_PostApprove?.status}`);
    }
    console.log(`  ✓ Verified in PostgreSQL: Business ID remained ${bizA_Id}, status updated to APPROVED.`);

    // 9. Super Admin approves Business B
    console.log(`\n[9] Super Admin approving Business B (${bizB_Id})...`);
    await fetch(`${API_BASE}/api/admin/businesses/${bizB_Id}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    // 10. Fetch User A memberships via GET /api/auth/memberships
    console.log('\n[10] Fetching User A memberships via GET /api/auth/memberships...');
    const memARes = await fetch(`${API_BASE}/api/auth/memberships`, {
      headers: { Authorization: `Bearer ${userA_Token}` },
    });
    const memAData = await memARes.json();
    if (!memARes.ok) throw new Error(`Fetch memberships A failed: ${JSON.stringify(memAData)}`);
    console.log(`  ✓ User A memberships count: ${memAData.length}`);
    if (memAData.length !== 1 || memAData[0].businessId !== bizA_Id) {
      throw new Error(`User A memberships unexpected: ${JSON.stringify(memAData)}`);
    }

    // 11. Cross-Tenant Security Check: User A requests Business B data with X-Tenant-ID
    console.log('\n[11] Cross-tenant security check: User A accessing Business B with X-Tenant-ID...');
    const crossResA = await fetch(`${API_BASE}/api/products`, {
      headers: {
        Authorization: `Bearer ${userA_Token}`,
        'X-Tenant-ID': bizB_Id,
      },
    });
    console.log(`  ✓ Cross-tenant request status: ${crossResA.status} (Expected 403)`);
    if (crossResA.status !== 403) throw new Error(`Expected 403 Forbidden for cross-tenant access, got ${crossResA.status}`);

    // 12. Cross-Tenant Security Check: User B requests Business A data with X-Tenant-ID
    console.log('\n[12] Cross-tenant security check: User B accessing Business A with X-Tenant-ID...');
    const crossResB = await fetch(`${API_BASE}/api/products`, {
      headers: {
        Authorization: `Bearer ${userB_Token}`,
        'X-Tenant-ID': bizA_Id,
      },
    });
    console.log(`  ✓ Cross-tenant request status: ${crossResB.status} (Expected 403)`);
    if (crossResB.status !== 403) throw new Error(`Expected 403 Forbidden for cross-tenant access, got ${crossResB.status}`);

    // 13. Provision New Tenant via Super Admin API
    console.log('\n[13] Super Admin provisioning new tenant via POST /api/admin/tenants/provision...');
    const provName = `Provisioned Brand ${Date.now()}`;
    const provRes = await fetch(`${API_BASE}/api/admin/tenants/provision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: provName,
        ownerName: 'Provisioned Owner',
        ownerEmail: `prov_owner_${Date.now()}@brand.com`,
        whatsappPhone: '+923009998877',
        city: 'Islamabad',
        plan: 'GROWTH',
      }),
    });
    const provData = await provRes.json();
    if (!provRes.ok) throw new Error(`Provision tenant failed: ${JSON.stringify(provData)}`);
    console.log(`  ✓ Provisioned Tenant ID: ${provData.id} | Name: ${provData.name} | Status: ${provData.status}`);

    // Verify provisioned tenant in PostgreSQL
    const dbProvBiz = await prisma.business.findUnique({ where: { id: provData.id } });
    if (!dbProvBiz || dbProvBiz.name !== provName) throw new Error('Provisioned Business not found in PostgreSQL!');
    console.log('  ✓ Verified in PostgreSQL: Provisioned tenant exists in DB.');

    // 14. Super Admin Toggle Tenant Status
    console.log(`\n[14] Super Admin toggling status for Tenant (${provData.id})...`);
    const toggleRes = await fetch(`${API_BASE}/api/admin/tenants/${provData.id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const toggleData = await toggleRes.json();
    if (!toggleRes.ok) throw new Error(`Toggle status failed: ${JSON.stringify(toggleData)}`);
    console.log(`  ✓ Toggled Status: ${toggleData.status}`);

    const dbProvToggle = await prisma.business.findUnique({ where: { id: provData.id } });
    if (dbProvToggle.status !== toggleData.status) throw new Error('Toggle status mismatch in PostgreSQL!');
    console.log(`  ✓ Verified in PostgreSQL: Business status updated to ${dbProvToggle.status}.`);

    console.log('\n====================================================');
    console.log('PHASE 3 SUPER ADMIN & BUSINESS MANAGEMENT TESTS PASSED 100%!');
    console.log('====================================================\n');

  } catch (err) {
    console.error('\n PHASE 3 TEST FAILED:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
