require('dotenv').config({ path: 'apps/api/.env' });
const http = require('http');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function apiRequest(method, path, body = null, token = null, tenantId = null) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (tenantId) headers['X-Tenant-ID'] = tenantId;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 4000,
        path: `/api${path}`,
        method: method.toUpperCase(),
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, data: parsed });
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runPhase2Tests() {
  console.log('--- STARTING PHASE 2 DATABASE DYNAMIC & TENANT ISOLATION TESTS ---');

  const timestamp = Date.now();

  // 1. REGISTER & APPROVE BUSINESS A
  const emailA = `owner_a_${timestamp}@test.com`;
  console.log(`\n1. Registering Business A (${emailA})...`);
  const regA = await apiRequest('POST', '/auth/register', {
    email: emailA,
    password: 'Password123!',
    fullName: 'Owner A',
    businessName: `Phase2 Business A ${timestamp}`,
  });

  if (regA.status !== 201 && regA.status !== 200) {
    throw new Error(`Failed to register Business A: ${JSON.stringify(regA.data)}`);
  }

  // Login to get token for A
  const loginA = await apiRequest('POST', '/auth/login', { email: emailA, password: 'Password123!' });
  const tokenA = loginA.data.accessToken;
  const bizA = regA.data.business;
  console.log(`Business A created with ID: ${bizA.id}, Approved status: ${bizA.status}`);

  // Approve Business A directly in DB if pending
  if (bizA.status !== 'APPROVED') {
    await prisma.business.update({
      where: { id: bizA.id },
      data: { status: 'APPROVED', approvedAt: new Date() },
    });
    console.log(`Business A (${bizA.id}) approved in DB.`);
  }

  // Verify Empty States for Business A
  console.log('\nVerifying empty states for newly registered Business A...');
  const invA0 = await apiRequest('GET', '/inventory/movements', null, tokenA, bizA.id);
  console.log(`Business A Inventory Movements response: status=${invA0.status}`, invA0.data);
  if (!Array.isArray(invA0.data) || invA0.data.length !== 0) throw new Error(`Expected 0 inventory movements for new business, got status ${invA0.status}: ${JSON.stringify(invA0.data)}`);

  const payA0 = await apiRequest('GET', '/payments', null, tokenA, bizA.id);
  console.log(`Business A Payments count: ${payA0.data.length}`);
  if (payA0.data.length !== 0) throw new Error('Expected 0 payments for new business!');

  const shipA0 = await apiRequest('GET', '/shipping', null, tokenA, bizA.id);
  console.log(`Business A Consignments count: ${shipA0.data.length}`);
  if (shipA0.data.length !== 0) throw new Error('Expected 0 consignments for new business!');

  const retA0 = await apiRequest('GET', '/returns', null, tokenA, bizA.id);
  console.log(`Business A Returns count: ${retA0.data.length}`);
  if (retA0.data.length !== 0) throw new Error('Expected 0 returns for new business!');

  const folA0 = await apiRequest('GET', '/followups', null, tokenA, bizA.id);
  console.log(`Business A Followup Leads count: ${folA0.data.length}`);
  if (folA0.data.length !== 0) throw new Error('Expected 0 followups for new business!');

  console.log('✅ TEST 1 PASSED: Empty states verified (0 records across all Phase 2 modules).');

  // 2. CREATE RECORDS FOR BUSINESS A
  console.log('\n2. Creating Phase 2 module records for Business A...');
  
  // Inventory movement for A
  const invRecA = await apiRequest(
    'POST',
    '/inventory/movements',
    { sku: `SKU-A-${timestamp}`, quantity: 50, type: 'INBOUND_RESTOCK', notes: 'Initial stock A' },
    tokenA,
    bizA.id
  );
  console.log(`Created Stock Movement A: ID ${invRecA.data.id}`);

  // Payment for A in DB directly
  const payRecA = await prisma.paymentRecord.create({
    data: {
      businessId: bizA.id,
      orderNumber: `ORD-A-${timestamp}`,
      customerName: 'Customer A',
      customerPhone: '0300-1111111',
      paymentMethod: 'COD',
      amountPKR: 5000,
      status: 'PENDING_VERIFICATION',
      notes: 'Payment A',
    },
  });
  console.log(`Created Payment Record A: ID ${payRecA.id}`);

  // Shipment for A
  const shipRecA = await apiRequest(
    'POST',
    '/shipping/book',
    {
      courier: 'TRAX',
      orderNumber: `ORD-A-${timestamp}`,
      customerName: 'Customer A',
      customerPhone: '0300-1111111',
      destinationCity: 'Karachi',
      address: 'Street A, Karachi',
      codAmountPKR: 5000,
    },
    tokenA,
    bizA.id
  );
  console.log(`Created Consignment A: CN# ${shipRecA.data.cnNumber}`);

  // Return for A in DB directly
  const retRecA = await prisma.returnRequest.create({
    data: {
      businessId: bizA.id,
      returnNumber: `RET-A-${timestamp}`,
      orderNumber: `ORD-A-${timestamp}`,
      customerName: 'Customer A',
      customerPhone: '0300-1111111',
      productName: 'Item A',
      sku: `SKU-A-${timestamp}`,
      quantity: 1,
      returnReason: 'SIZE_MISMATCH',
      status: 'RETURN_REQUESTED',
    },
  });
  console.log(`Created Return Request A: ID ${retRecA.id}`);

  // Followup Lead for A in DB directly
  const folRecA = await prisma.followupLead.create({
    data: {
      businessId: bizA.id,
      customerName: 'Customer A',
      customerPhone: '0300-1111111',
      city: 'Karachi',
      inquiredProduct: 'Item A',
      hoursElapsed: 12,
      lastMessage: 'Is it available?',
      suggestedFollowup: 'Hi Customer A! Item A is in stock.',
      status: 'PENDING',
    },
  });
  console.log(`Created Followup Lead A: ID ${folRecA.id}`);

  // Verify fetch returns created records for Business A
  const invA1 = await apiRequest('GET', '/inventory/movements', null, tokenA, bizA.id);
  const payA1 = await apiRequest('GET', '/payments', null, tokenA, bizA.id);
  const shipA1 = await apiRequest('GET', '/shipping', null, tokenA, bizA.id);
  const retA1 = await apiRequest('GET', '/returns', null, tokenA, bizA.id);
  const folA1 = await apiRequest('GET', '/followups', null, tokenA, bizA.id);

  if (invA1.data.length !== 1 || payA1.data.length !== 1 || shipA1.data.length !== 1 || retA1.data.length !== 1 || folA1.data.length !== 1) {
    throw new Error('Business A records fetch failed to match created records!');
  }
  console.log('✅ TEST 2 PASSED: Created records for Business A verified via API.');

  // 3. REGISTER & APPROVE BUSINESS B AND CREATE SEPARATE RECORDS
  const emailB = `owner_b_${timestamp}@test.com`;
  console.log(`\n3. Registering Business B (${emailB})...`);
  const regB = await apiRequest('POST', '/auth/register', {
    email: emailB,
    password: 'Password123!',
    fullName: 'Owner B',
    businessName: `Phase2 Business B ${timestamp}`,
  });

  const loginB = await apiRequest('POST', '/auth/login', { email: emailB, password: 'Password123!' });
  const tokenB = loginB.data.accessToken;
  const bizB = regB.data.business;
  console.log(`Business B created with ID: ${bizB.id}`);

  await prisma.business.update({
    where: { id: bizB.id },
    data: { status: 'APPROVED', approvedAt: new Date() },
  });

  // Create records for Business B
  await apiRequest(
    'POST',
    '/inventory/movements',
    { sku: `SKU-B-${timestamp}`, quantity: 100, type: 'INBOUND_RESTOCK', notes: 'Initial stock B' },
    tokenB,
    bizB.id
  );

  await prisma.paymentRecord.create({
    data: {
      businessId: bizB.id,
      orderNumber: `ORD-B-${timestamp}`,
      customerName: 'Customer B',
      customerPhone: '0300-2222222',
      paymentMethod: 'BANK_TRANSFER',
      amountPKR: 12000,
      status: 'PAID',
    },
  });

  await apiRequest(
    'POST',
    '/shipping/book',
    {
      courier: 'LEOPARD',
      orderNumber: `ORD-B-${timestamp}`,
      customerName: 'Customer B',
      customerPhone: '0300-2222222',
      destinationCity: 'Lahore',
      address: 'Street B, Lahore',
      codAmountPKR: 12000,
    },
    tokenB,
    bizB.id
  );

  await prisma.returnRequest.create({
    data: {
      businessId: bizB.id,
      returnNumber: `RET-B-${timestamp}`,
      orderNumber: `ORD-B-${timestamp}`,
      customerName: 'Customer B',
      customerPhone: '0300-2222222',
      productName: 'Item B',
      sku: `SKU-B-${timestamp}`,
      quantity: 2,
      returnReason: 'DEFECTIVE',
      status: 'RETURN_REQUESTED',
    },
  });

  await prisma.followupLead.create({
    data: {
      businessId: bizB.id,
      customerName: 'Customer B',
      customerPhone: '0300-2222222',
      city: 'Lahore',
      inquiredProduct: 'Item B',
      hoursElapsed: 24,
      lastMessage: 'Price?',
      suggestedFollowup: 'Hi Customer B!',
      status: 'PENDING',
    },
  });

  // Verify strict multi-tenant isolation
  const invA2 = await apiRequest('GET', '/inventory/movements', null, tokenA, bizA.id);
  const invB2 = await apiRequest('GET', '/inventory/movements', null, tokenB, bizB.id);

  const payA2 = await apiRequest('GET', '/payments', null, tokenA, bizA.id);
  const payB2 = await apiRequest('GET', '/payments', null, tokenB, bizB.id);

  const shipA2 = await apiRequest('GET', '/shipping', null, tokenA, bizA.id);
  const shipB2 = await apiRequest('GET', '/shipping', null, tokenB, bizB.id);

  console.log(`Business A Inventory items: ${invA2.data.length} (Expected 1)`);
  console.log(`Business B Inventory items: ${invB2.data.length} (Expected 1)`);
  console.log(`Business A Payments: ${payA2.data.length} (Expected 1)`);
  console.log(`Business B Payments: ${payB2.data.length} (Expected 1)`);

  if (invA2.data.length !== 1 || invB2.data.length !== 1 || payA2.data.length !== 1 || payB2.data.length !== 1) {
    throw new Error('Tenant isolation failure: Business A sees B records or vice versa!');
  }
  console.log('✅ TEST 3 PASSED: Business A sees A records only, Business B sees B records only.');

  // 4. CROSS-TENANT HEADER ATTACK TEST
  console.log('\n4. Testing Cross-Tenant Header Attack (User A attempting to pass X-Tenant-ID: Business B)...');
  const crossAttack = await apiRequest('GET', '/inventory/movements', null, tokenA, bizB.id);
  if (crossAttack.status === 403) {
    console.log(`Received expected HTTP 403 Forbidden: ${JSON.stringify(crossAttack.data)}`);
  } else {
    throw new Error(`FAILED: Cross-tenant header attack returned status ${crossAttack.status} instead of 403!`);
  }
  console.log('✅ TEST 4 PASSED: Cross-tenant header attack blocked with HTTP 403.');

  // 5. DIRECT OBJECT ACCESS ATTACK TEST
  console.log('\n5. Testing Direct Object Access Attack (User A attempting to access Business B payment/consignment)...');
  const attackPay = await apiRequest('POST', `/payments/${payRecA.id}/verify`, {}, tokenB, bizB.id);
  if (attackPay.status === 404 || attackPay.status === 403) {
    console.log(`Received expected HTTP ${attackPay.status}: ${JSON.stringify(attackPay.data)}`);
  } else {
    throw new Error(`FAILED: Direct object access returned status ${attackPay.status} instead of 404/403!`);
  }

  const attackShip = await apiRequest('GET', `/shipping/${shipRecA.data.cnNumber}`, null, tokenB, bizB.id);
  if (attackShip.status === 404 || attackShip.status === 403) {
    console.log(`Received expected HTTP ${attackShip.status}: ${JSON.stringify(attackShip.data)}`);
  } else {
    throw new Error(`FAILED: Direct object access returned status ${attackShip.status} instead of 404/403!`);
  }
  console.log('✅ TEST 5 PASSED: Direct object access attack blocked with HTTP 404/403.');

  console.log('\n====================================================');
  console.log('🎉 ALL PHASE 2 DATABASE DYNAMIC & TENANT ISOLATION TESTS PASSED!');
  console.log('====================================================');
}

runPhase2Tests()
  .catch((err) => {
    console.error('\n❌ PHASE 2 TEST FAILED:', err.message);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
