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
  console.log('SELLDESK — PHASE 8 FRONTEND ACTIONS & API SUITE');
  console.log('==================================================\n');

  const ts = Date.now().toString(36);

  // 1. Setup User A & Business A
  console.log('[Setup] Registering User A & Business A...');
  const userAEmail = `usera_p8_${ts}@test.pk`;
  const regARes = await apiCall(`${API_URL}/api/auth/register`, {
    method: 'POST',
    body: {
      email: userAEmail,
      password: 'Password123!',
      fullName: 'User A',
      businessName: `Brand A P8 ${ts}`,
      phone: '03001111111',
      city: 'Lahore',
      country: 'Pakistan',
    },
  });
  const tokenA = regARes.accessToken;
  const bizAId = regARes.business.id;

  await prisma.business.update({
    where: { id: bizAId },
    data: { status: 'APPROVED' },
  });

  // 2. Setup User B & Business B
  console.log('[Setup] Registering User B & Business B...');
  const userBEmail = `userb_p8_${ts}@test.pk`;
  const regBRes = await apiCall(`${API_URL}/api/auth/register`, {
    method: 'POST',
    body: {
      email: userBEmail,
      password: 'Password123!',
      fullName: 'User B',
      businessName: `Brand B P8 ${ts}`,
      phone: '03002222222',
      city: 'Karachi',
      country: 'Pakistan',
    },
  });
  const tokenB = regBRes.accessToken;
  const bizBId = regBRes.business.id;

  await prisma.business.update({
    where: { id: bizBId },
    data: { status: 'APPROVED' },
  });

  // 3. Create target records in PostgreSQL for Business A
  const custA = await prisma.customer.create({
    data: { businessId: bizAId, fullName: 'Customer A', phoneNumber: '03001111111' },
  });

  const convA = await prisma.conversation.create({
    data: {
      businessId: bizAId,
      customerId: custA.id,
      channel: 'WHATSAPP',
      externalContactId: '03001111111',
      status: 'OPEN',
    },
  });

  const paymentA = await prisma.paymentRecord.create({
    data: {
      businessId: bizAId,
      orderNumber: `ORD-A-${ts}`,
      customerName: 'Customer A',
      customerPhone: '03001111111',
      paymentMethod: 'COD',
      amountPKR: 5000,
      status: 'PENDING_VERIFICATION',
    },
  });

  const returnA = await prisma.returnRequest.create({
    data: {
      businessId: bizAId,
      returnNumber: `RET-A-${ts}`,
      orderNumber: `ORD-A-${ts}`,
      customerName: 'Customer A',
      customerPhone: '03001111111',
      productName: 'Jacket A',
      sku: `SKU-A-${ts}`,
      quantity: 1,
      returnReason: 'SIZE_MISMATCH',
      status: 'RETURN_REQUESTED',
      restocked: false,
    },
  });

  const followupA = await prisma.followupLead.create({
    data: {
      businessId: bizAId,
      customerName: 'Customer A',
      customerPhone: '03001111111',
      city: 'Lahore',
      inquiredProduct: 'Jacket A',
      status: 'PENDING',
    },
  });

  console.log(`Setup complete. Created Conv A (${convA.id}), Payment A (${paymentA.id}), Return A (${returnA.id}), Followup A (${followupA.id}).\n`);

  // ==================================================
  // TEST 1 — Conversation message creation
  // ==================================================
  console.log('▶ TEST 1: Conversation message creation (User A -> Conv A)...');
  const msgRes = await apiCall(`${API_URL}/api/conversations/${convA.id}/reply`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}`, 'X-Tenant-ID': bizAId },
    body: { messageText: 'Walaikum Assalam, order process ho chuka hai!' },
  });
  if (msgRes && msgRes.text === 'Walaikum Assalam, order process ho chuka hai!') {
    console.log('✅ PASS: Conversation message created and persisted in PostgreSQL.');
  } else {
    console.error('❌ FAIL: Conversation message creation failed');
    process.exit(1);
  }

  // ==================================================
  // TEST 2 — Cross-tenant conversation mutation blocked
  // ==================================================
  console.log('▶ TEST 2: Cross-tenant conversation reply blocked (User B -> Conv A)...');
  try {
    await apiCall(`${API_URL}/api/conversations/${convA.id}/reply`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}`, 'X-Tenant-ID': bizBId },
      body: { messageText: 'Hacked reply' },
    });
    console.error('❌ FAIL: User B successfully replied to Business A conversation!');
    process.exit(1);
  } catch (err) {
    if (err.status === 404) {
      console.log('✅ PASS: Cross-tenant conversation reply correctly blocked (404 Not Found).');
    } else {
      console.error(`❌ FAIL: Unexpected error status ${err.status}`);
      process.exit(1);
    }
  }

  // ==================================================
  // TEST 3 — Shipping consignment creation
  // ==================================================
  console.log('▶ TEST 3: Shipping consignment creation (User A)...');
  const shipRes = await apiCall(`${API_URL}/api/shipping/book`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}`, 'X-Tenant-ID': bizAId },
    body: {
      courier: 'TRAX',
      orderNumber: `ORD-SHIP-${ts}`,
      customerName: 'Customer A',
      customerPhone: '03001111111',
      destinationCity: 'Karachi',
      address: 'Shahrah-e-Faisal',
      codAmountPKR: 3500,
    },
  });
  if (shipRes && shipRes.cnNumber && shipRes.businessId === bizAId) {
    console.log(`✅ PASS: Consignment ${shipRes.cnNumber} created and assigned to Business A in DB.`);
  } else {
    console.error('❌ FAIL: Consignment creation failed');
    process.exit(1);
  }

  // ==================================================
  // TEST 4 — Cross-tenant shipping query blocked
  // ==================================================
  console.log('▶ TEST 4: Cross-tenant shipping query blocked (User B -> Ship A)...');
  try {
    await apiCall(`${API_URL}/api/shipping/${shipRes.cnNumber}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenB}`, 'X-Tenant-ID': bizBId },
    });
    console.error('❌ FAIL: User B accessed Business A consignment!');
    process.exit(1);
  } catch (err) {
    if (err.status === 404) {
      console.log('✅ PASS: Cross-tenant consignment query correctly blocked (404 Not Found).');
    } else {
      console.error(`❌ FAIL: Unexpected error status ${err.status}`);
      process.exit(1);
    }
  }

  // ==================================================
  // TEST 5 — Payment verification
  // ==================================================
  console.log('▶ TEST 5: Payment verification (User A -> Payment A)...');
  const payRes = await apiCall(`${API_URL}/api/payments/${paymentA.id}/verify`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}`, 'X-Tenant-ID': bizAId },
    body: { trxId: 'TRX-REAL-999' },
  });
  if (payRes && payRes.status === 'PAID' && payRes.trxId === 'TRX-REAL-999') {
    console.log('✅ PASS: Payment A verified and persisted status PAID in PostgreSQL.');
  } else {
    console.error('❌ FAIL: Payment verification failed');
    process.exit(1);
  }

  // ==================================================
  // TEST 6 — Cross-tenant payment verification blocked
  // ==================================================
  console.log('▶ TEST 6: Cross-tenant payment verification blocked (User B -> Payment A)...');
  try {
    await apiCall(`${API_URL}/api/payments/${paymentA.id}/verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}`, 'X-Tenant-ID': bizBId },
      body: { trxId: 'HACK-TRX' },
    });
    console.error('❌ FAIL: User B verified Business A payment!');
    process.exit(1);
  } catch (err) {
    if (err.status === 404) {
      console.log('✅ PASS: Cross-tenant payment verification correctly blocked (404 Not Found).');
    } else {
      console.error(`❌ FAIL: Unexpected error status ${err.status}`);
      process.exit(1);
    }
  }

  // ==================================================
  // TEST 7 — Return restock
  // ==================================================
  console.log('▶ TEST 7: Return restock (User A -> Return A)...');
  const retRes = await apiCall(`${API_URL}/api/returns/${returnA.id}/restock`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}`, 'X-Tenant-ID': bizAId },
  });
  if (retRes && retRes.status === 'RESTOCKED' && retRes.restocked === true) {
    console.log('✅ PASS: Return A restocked and persisted status RESTOCKED in PostgreSQL.');
  } else {
    console.error('❌ FAIL: Return restock failed');
    process.exit(1);
  }

  // ==================================================
  // TEST 8 — Cross-tenant return restock blocked
  // ==================================================
  console.log('▶ TEST 8: Cross-tenant return restock blocked (User B -> Return A)...');
  try {
    await apiCall(`${API_URL}/api/returns/${returnA.id}/restock`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}`, 'X-Tenant-ID': bizBId },
    });
    console.error('❌ FAIL: User B restocked Business A return!');
    process.exit(1);
  } catch (err) {
    if (err.status === 404) {
      console.log('✅ PASS: Cross-tenant return restock correctly blocked (404 Not Found).');
    } else {
      console.error(`❌ FAIL: Unexpected error status ${err.status}`);
      process.exit(1);
    }
  }

  // ==================================================
  // TEST 9 — Follow-up trigger
  // ==================================================
  console.log('▶ TEST 9: Follow-up trigger (User A -> Followup A)...');
  const folRes = await apiCall(`${API_URL}/api/followups/${followupA.id}/trigger`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}`, 'X-Tenant-ID': bizAId },
  });
  if (folRes && folRes.success === true && folRes.lead?.status === 'SENT') {
    console.log('✅ PASS: Followup A triggered and persisted status SENT in PostgreSQL.');
  } else {
    console.error('❌ FAIL: Follow-up trigger failed');
    process.exit(1);
  }

  // ==================================================
  // TEST 10 — Cross-tenant follow-up trigger blocked
  // ==================================================
  console.log('▶ TEST 10: Cross-tenant follow-up trigger blocked (User B -> Followup A)...');
  try {
    await apiCall(`${API_URL}/api/followups/${followupA.id}/trigger`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}`, 'X-Tenant-ID': bizBId },
    });
    console.error('❌ FAIL: User B triggered Business A follow-up!');
    process.exit(1);
  } catch (err) {
    if (err.status === 404) {
      console.log('✅ PASS: Cross-tenant follow-up trigger correctly blocked (404 Not Found).');
    } else {
      console.error(`❌ FAIL: Unexpected error status ${err.status}`);
      process.exit(1);
    }
  }

  // ==================================================
  // TEST 11 — AI endpoints functional
  // ==================================================
  console.log('▶ TEST 11: AI endpoints functional (GET /api/ai/actions, extract-order, generate-reply)...');
  const aiActions = await apiCall(`${API_URL}/api/ai/actions`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenA}`, 'X-Tenant-ID': bizAId },
  });

  const extractRes = await apiCall(`${API_URL}/api/ai/extract-order`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}`, 'X-Tenant-ID': bizAId },
    body: { text: '2 black XL COD Lahore' },
  });

  const replyRes = await apiCall(`${API_URL}/api/ai/generate-reply`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}`, 'X-Tenant-ID': bizAId },
    body: { text: 'Price kitni hai?' },
  });

  if (Array.isArray(aiActions) && extractRes.confidenceScore && replyRes.reply) {
    console.log('✅ PASS: All AI endpoints responded successfully.');
  } else {
    console.error('❌ FAIL: AI endpoints verification failed');
    process.exit(1);
  }

  // ==================================================
  // TEST 12 — Unauthorized access remains blocked
  // ==================================================
  console.log('▶ TEST 12: Unauthorized access remains blocked (no JWT token)...');
  try {
    await apiCall(`${API_URL}/api/conversations/${convA.id}/reply`, {
      method: 'POST',
      body: { messageText: 'Unauthenticated message' },
    });
    console.error('❌ FAIL: Unauthenticated user was allowed to post message!');
    process.exit(1);
  } catch (err) {
    if (err.status === 401) {
      console.log('✅ PASS: Unauthenticated request correctly blocked (401 Unauthorized).');
    } else {
      console.error(`❌ FAIL: Unexpected error status ${err.status}`);
      process.exit(1);
    }
  }

  console.log('\n==================================================');
  console.log('🎉 ALL 12 PHASE 8 FRONTEND ACTION & API TESTS PASSED!');
  console.log('==================================================');
}

main()
  .catch((err) => {
    console.error('Test execution error:', err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
