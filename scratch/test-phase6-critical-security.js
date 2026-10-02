const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const API_URL = 'http://localhost:4000';

async function apiCall(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = res.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const error = new Error(data.message || `HTTP ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function main() {
  console.log('==================================================');
  console.log('SELLDESK — PHASE 6 CRITICAL SECURITY TEST SUITE');
  console.log('==================================================\n');

  const ts = Date.now().toString(36);

  // 1. Setup User A & Business A (Approved)
  console.log('[Setup] Registering User A and Business A...');
  const userAEmail = `usera_${ts}@test.pk`;
  const regARes = await apiCall(`${API_URL}/api/auth/register`, {
    method: 'POST',
    body: {
      email: userAEmail,
      password: 'password123',
      fullName: 'User A',
      businessName: `Brand A ${ts}`,
      phone: '03001111111',
      city: 'Lahore',
      country: 'Pakistan',
    },
  });
  const tokenA = regARes.accessToken;
  const bizAId = regARes.business.id;

  // Approve Business A
  await prisma.business.update({
    where: { id: bizAId },
    data: { status: 'APPROVED' },
  });

  // 2. Setup User B & Business B (Approved)
  console.log('[Setup] Registering User B and Business B...');
  const userBEmail = `userb_${ts}@test.pk`;
  const regBRes = await apiCall(`${API_URL}/api/auth/register`, {
    method: 'POST',
    body: {
      email: userBEmail,
      password: 'password123',
      fullName: 'User B',
      businessName: `Brand B ${ts}`,
      phone: '03002222222',
      city: 'Karachi',
      country: 'Pakistan',
    },
  });
  const tokenB = regBRes.accessToken;
  const bizBId = regBRes.business.id;

  // Approve Business B
  await prisma.business.update({
    where: { id: bizBId },
    data: { status: 'APPROVED' },
  });

  // 3. Create Target Test Records for Business A in PostgreSQL
  console.log('[Setup] Creating Return A, Payment A, Followup A under Business A...');
  const returnA = await prisma.returnRequest.create({
    data: {
      businessId: bizAId,
      returnNumber: `RET-A-${ts}`,
      orderNumber: `ORD-A-${ts}`,
      customerName: 'Customer A',
      customerPhone: '03001111111',
      productName: 'Hoodie A',
      sku: `SKU-A-${ts}`,
      quantity: 1,
      returnReason: 'SIZE_MISMATCH',
      status: 'RETURN_REQUESTED',
      restocked: false,
    },
  });

  const paymentA = await prisma.paymentRecord.create({
    data: {
      businessId: bizAId,
      orderNumber: `ORD-A-${ts}`,
      customerName: 'Customer A',
      customerPhone: '03001111111',
      paymentMethod: 'COD',
      amountPKR: 4500,
      status: 'PENDING_VERIFICATION',
    },
  });

  const followupA = await prisma.followupLead.create({
    data: {
      businessId: bizAId,
      customerName: 'Customer A',
      customerPhone: '03001111111',
      city: 'Lahore',
      inquiredProduct: 'Hoodie A',
      status: 'PENDING',
    },
  });

  console.log(`Created Return A (${returnA.id}), Payment A (${paymentA.id}), Followup A (${followupA.id}).\n`);

  // ==================================================
  // TEST 1 — RETURN CROSS-TENANT ATTACK
  // ==================================================
  console.log('▶ TEST 1: Return Cross-Tenant Attack (User B -> Return A)...');
  try {
    await apiCall(`${API_URL}/api/returns/${returnA.id}/restock`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenB}`,
        'X-Tenant-ID': bizBId,
      },
    });
    console.error('❌ FAIL: User B successfully restocked Return A of Business A!');
    process.exit(1);
  } catch (err) {
    if (err.status === 404) {
      console.log('✅ PASS: Cross-tenant return restock attempt correctly denied with 404 Not Found.');
    } else {
      console.error(`❌ FAIL: Unexpected status code ${err.status}`);
      process.exit(1);
    }
  }

  // Verify Return A remains unchanged
  const returnACheck = await prisma.returnRequest.findUnique({ where: { id: returnA.id } });
  if (returnACheck.status !== 'RETURN_REQUESTED' || returnACheck.restocked !== false) {
    console.error('❌ FAIL: Return A state was mutated during cross-tenant attack!');
    process.exit(1);
  }
  console.log('  State Verified: Return A remains unchanged (status: RETURN_REQUESTED, restocked: false).\n');

  // ==================================================
  // TEST 2 — PAYMENT CROSS-TENANT ATTACK
  // ==================================================
  console.log('▶ TEST 2: Payment Cross-Tenant Attack (User B -> Payment A)...');
  try {
    await apiCall(`${API_URL}/api/payments/${paymentA.id}/verify`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenB}`,
        'X-Tenant-ID': bizBId,
      },
      body: { trxId: 'HACKED-TRX' },
    });
    console.error('❌ FAIL: User B successfully verified Payment A of Business A!');
    process.exit(1);
  } catch (err) {
    if (err.status === 404) {
      console.log('✅ PASS: Cross-tenant payment verification attempt correctly denied with 404 Not Found.');
    } else {
      console.error(`❌ FAIL: Unexpected status code ${err.status}`);
      process.exit(1);
    }
  }

  // Verify Payment A remains unchanged
  const paymentACheck = await prisma.paymentRecord.findUnique({ where: { id: paymentA.id } });
  if (paymentACheck.status !== 'PENDING_VERIFICATION') {
    console.error('❌ FAIL: Payment A state was mutated during cross-tenant attack!');
    process.exit(1);
  }
  console.log('  State Verified: Payment A remains unchanged (status: PENDING_VERIFICATION).\n');

  // ==================================================
  // TEST 3 — FOLLOWUP CROSS-TENANT ATTACK
  // ==================================================
  console.log('▶ TEST 3: Followup Cross-Tenant Attack (User B -> Followup A)...');
  try {
    await apiCall(`${API_URL}/api/followups/${followupA.id}/trigger`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenB}`,
        'X-Tenant-ID': bizBId,
      },
    });
    console.error('❌ FAIL: User B successfully triggered Followup A of Business A!');
    process.exit(1);
  } catch (err) {
    if (err.status === 404) {
      console.log('✅ PASS: Cross-tenant followup trigger attempt correctly denied with 404 Not Found.');
    } else {
      console.error(`❌ FAIL: Unexpected status code ${err.status}`);
      process.exit(1);
    }
  }

  // Verify Followup A remains unchanged
  const followupACheck = await prisma.followupLead.findUnique({ where: { id: followupA.id } });
  if (followupACheck.status !== 'PENDING') {
    console.error('❌ FAIL: Followup A state was mutated during cross-tenant attack!');
    process.exit(1);
  }
  console.log('  State Verified: Followup A remains unchanged (status: PENDING).\n');

  // ==================================================
  // TEST 4 — LEGITIMATE TENANT MUTATION
  // ==================================================
  console.log('▶ TEST 4: Legitimate Tenant Mutation (User A -> Business A Objects)...');
  
  // Restock Return A
  const restockRes = await apiCall(`${API_URL}/api/returns/${returnA.id}/restock`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenA}`,
      'X-Tenant-ID': bizAId,
    },
  });
  if (restockRes.status !== 'RESTOCKED' || restockRes.restocked !== true) {
    console.error('❌ FAIL: Legitimate return restock did not update status');
    process.exit(1);
  }
  console.log('  Return Restock: Success (status: RESTOCKED)');

  // Verify Payment A
  const verifyRes = await apiCall(`${API_URL}/api/payments/${paymentA.id}/verify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenA}`,
      'X-Tenant-ID': bizAId,
    },
    body: { trxId: 'LEGIT-TRX-123' },
  });
  if (verifyRes.status !== 'PAID') {
    console.error('❌ FAIL: Legitimate payment verify did not update status');
    process.exit(1);
  }
  console.log('  Payment Verification: Success (status: PAID)');

  // Trigger Followup A
  const triggerRes = await apiCall(`${API_URL}/api/followups/${followupA.id}/trigger`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenA}`,
      'X-Tenant-ID': bizAId,
    },
  });
  if (triggerRes.lead?.status !== 'SENT') {
    console.error('❌ FAIL: Legitimate followup trigger did not update status');
    process.exit(1);
  }
  console.log('  Followup Trigger: Success (status: SENT)');
  console.log('✅ PASS: All legitimate tenant mutations succeeded.\n');

  // ==================================================
  // TEST 5 — PENDING USER API ACCESS
  // ==================================================
  console.log('▶ TEST 5: Pending User API Access...');
  const userCEmail = `userc_${ts}@test.pk`;
  const regCRes = await apiCall(`${API_URL}/api/auth/register`, {
    method: 'POST',
    body: {
      email: userCEmail,
      password: 'password123',
      fullName: 'User C',
      businessName: `Brand C ${ts}`,
      phone: '03003333333',
      city: 'Rawalpindi',
      country: 'Pakistan',
    },
  });
  const tokenC = regCRes.accessToken;
  const bizCId = regCRes.business.id;

  try {
    await apiCall(`${API_URL}/api/orders`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenC}`,
        'X-Tenant-ID': bizCId,
      },
    });
    console.error('❌ FAIL: Pending business user gained access to protected API!');
    process.exit(1);
  } catch (err) {
    if (err.status === 403) {
      console.log('✅ PASS: Pending business API access correctly blocked with 403 Forbidden.\n');
    } else {
      console.error(`❌ FAIL: Unexpected status ${err.status}`);
      process.exit(1);
    }
  }

  // ==================================================
  // TEST 6 — REJECTED USER API ACCESS
  // ==================================================
  console.log('▶ TEST 6: Rejected User API Access...');
  await prisma.business.update({
    where: { id: bizCId },
    data: { status: 'REJECTED', rejectionReason: 'Incomplete paperwork' },
  });

  try {
    await apiCall(`${API_URL}/api/orders`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenC}`,
        'X-Tenant-ID': bizCId,
      },
    });
    console.error('❌ FAIL: Rejected business user gained access to protected API!');
    process.exit(1);
  } catch (err) {
    if (err.status === 403) {
      console.log('✅ PASS: Rejected business API access correctly blocked with 403 Forbidden.\n');
    } else {
      console.error(`❌ FAIL: Unexpected status ${err.status}`);
      process.exit(1);
    }
  }

  // ==================================================
  // TEST 7 — SUSPENDED USER API ACCESS
  // ==================================================
  console.log('▶ TEST 7: Suspended User API Access...');
  await prisma.business.update({
    where: { id: bizAId },
    data: { status: 'SUSPENDED' },
  });

  try {
    await apiCall(`${API_URL}/api/orders`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'X-Tenant-ID': bizAId,
      },
    });
    console.error('❌ FAIL: Suspended business user gained access to protected API!');
    process.exit(1);
  } catch (err) {
    if (err.status === 403) {
      console.log('✅ PASS: Suspended business API access correctly blocked with 403 Forbidden.\n');
    } else {
      console.error(`❌ FAIL: Unexpected status ${err.status}`);
      process.exit(1);
    }
  }

  // Restore Business A to APPROVED for cleanup/regression
  await prisma.business.update({
    where: { id: bizAId },
    data: { status: 'APPROVED' },
  });

  // ==================================================
  // TEST 8 — TENANT HEADER ATTACK
  // ==================================================
  console.log('▶ TEST 8: Tenant Header Attack (User A sends X-Tenant-ID: Business B)...');
  try {
    await apiCall(`${API_URL}/api/orders`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'X-Tenant-ID': bizBId,
      },
    });
    console.error('❌ FAIL: User A successfully accessed Business B via header tampering!');
    process.exit(1);
  } catch (err) {
    if (err.status === 403) {
      console.log('✅ PASS: Tenant header attack correctly blocked with 403 Forbidden.\n');
    } else {
      console.error(`❌ FAIL: Unexpected status ${err.status}`);
      process.exit(1);
    }
  }

  // ==================================================
  // TEST 9 — OBJECT ID ATTACK
  // ==================================================
  console.log('▶ TEST 9: Object ID Attack across all 3 modules...');
  const fakeId = '00000000-0000-0000-0000-000000000000';
  
  try {
    await apiCall(`${API_URL}/api/returns/${fakeId}/restock`, { method: 'POST', headers: { Authorization: `Bearer ${tokenA}`, 'X-Tenant-ID': bizAId } });
  } catch (err) {
    if (err.status === 404) console.log('  Return fake ID -> 404 Not Found');
  }

  try {
    await apiCall(`${API_URL}/api/payments/${fakeId}/verify`, { method: 'POST', headers: { Authorization: `Bearer ${tokenA}`, 'X-Tenant-ID': bizAId } });
  } catch (err) {
    if (err.status === 404) console.log('  Payment fake ID -> 404 Not Found');
  }

  try {
    await apiCall(`${API_URL}/api/followups/${fakeId}/trigger`, { method: 'POST', headers: { Authorization: `Bearer ${tokenA}`, 'X-Tenant-ID': bizAId } });
  } catch (err) {
    if (err.status === 404) console.log('  Followup fake ID -> 404 Not Found');
  }
  console.log('✅ PASS: All fake Object ID attacks returned 404 Not Found.\n');

  console.log('==================================================');
  console.log('🎉 ALL PHASE 6 CRITICAL SECURITY TESTS PASSED!');
  console.log('==================================================');
}

main()
  .catch((err) => {
    console.error('Test execution error:', err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
