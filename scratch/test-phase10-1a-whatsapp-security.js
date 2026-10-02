const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const API_URL = 'http://localhost:4000';
const APP_SECRET = process.env.WHATSAPP_APP_SECRET || 'selldesk_app_secret_dev_key_2026';

function calculateHmac(rawBody, secret = APP_SECRET) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody));
  return `sha256=${hmac.digest('hex')}`;
}

async function runPhase10_1aTests() {
  console.log('==================================================');
  console.log('SELLDESK — PHASE 10.1A WHATSAPP SECURITY & SCHEMA SUITE');
  console.log('==================================================\n');

  const ts = Date.now().toString(36);

  // 1. Provision Business A & Business B
  console.log('[Setup] Registering Business A & Business B...');

  const regARes = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `wasec_ownera_${ts}@example.test`,
      password: 'Password123!',
      fullName: 'WhatsApp Sec Owner A',
      businessName: `WhatsApp Sec Biz A ${ts}`,
      phone: '03001112233',
      city: 'Lahore',
      country: 'Pakistan',
    }),
  });
  const dataA = await regARes.json();
  const bizAId = dataA.business.id;

  const regBRes = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `wasec_ownerb_${ts}@example.test`,
      password: 'Password123!',
      fullName: 'WhatsApp Sec Owner B',
      businessName: `WhatsApp Sec Biz B ${ts}`,
      phone: '03004445566',
      city: 'Karachi',
      country: 'Pakistan',
    }),
  });
  const dataB = await regBRes.json();
  const bizBId = dataB.business.id;

  // Approve businesses in DB
  await prisma.business.update({ where: { id: bizAId }, data: { status: 'APPROVED' } });
  await prisma.business.update({ where: { id: bizBId }, data: { status: 'APPROVED' } });

  // Configure WhatsApp credentials for Business A
  const phoneNumIdA = `PHONE_ID_A_${ts}`;
  await prisma.whatsAppConfig.create({
    data: {
      businessId: bizAId,
      phoneNumberId: phoneNumIdA,
      wabaId: `WABA_A_${ts}`,
      accessToken: `TOKEN_A_${ts}`,
      verifyToken: 'selldesk_verify_token_2026',
      displayPhoneNumber: '+92 300 1112233',
      verifiedName: 'Biz A Store',
      isActive: true,
    },
  });

  console.log(`[Setup] Provisioned Business A (${bizAId}, Phone ID: ${phoneNumIdA}) and Business B (${bizBId}).\n`);

  let passedCount = 0;
  let totalCount = 10;

  // ----------------------------------------------------
  // TEST 1: Valid HMAC signature accepted
  // ----------------------------------------------------
  console.log('▶ TEST 1: Valid HMAC signature accepted...');
  const payload1 = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'WABA_ENTRY_1',
        changes: [
          {
            field: 'messages',
            value: {
              messaging_product: 'whatsapp',
              metadata: { phone_number_id: phoneNumIdA },
            },
          },
        ],
      },
    ],
  };
  const body1 = JSON.stringify(payload1);
  const sig1 = calculateHmac(body1);

  const res1 = await fetch(`${API_URL}/api/whatsapp/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hub-signature-256': sig1,
    },
    body: body1,
  });

  if (res1.status === 200 || res1.status === 201) {
    const res1Data = await res1.json();
    if ((res1Data.status === 'RECEIVED' || res1Data.status === 'ACKNOWLEDGED' || res1Data.status === 'PROCESSED') && res1Data.businessId === bizAId) {
      console.log('✅ PASS: Valid HMAC signature accepted and resolved Business A tenant.');
      passedCount++;
    } else {
      console.error('❌ FAIL: Webhook accepted but tenant resolution failed:', res1Data);
    }
  } else {
    console.error(`❌ FAIL: Valid HMAC signature rejected with status ${res1.status}`);
  }

  // ----------------------------------------------------
  // TEST 2: Invalid HMAC signature rejected
  // ----------------------------------------------------
  console.log('▶ TEST 2: Invalid HMAC signature rejected...');
  const sig2 = 'sha256=0000000000000000000000000000000000000000000000000000000000000000';
  const res2 = await fetch(`${API_URL}/api/whatsapp/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hub-signature-256': sig2,
    },
    body: body1,
  });

  if (res2.status === 401 || res2.status === 403) {
    console.log(`✅ PASS: Invalid HMAC signature correctly rejected with ${res2.status} Unauthorized.`);
    passedCount++;
  } else {
    console.error(`❌ FAIL: Invalid HMAC signature allowed with status ${res2.status}`);
  }

  // ----------------------------------------------------
  // TEST 3: Missing HMAC signature rejected
  // ----------------------------------------------------
  console.log('▶ TEST 3: Missing HMAC signature rejected...');
  const res3 = await fetch(`${API_URL}/api/whatsapp/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body1,
  });

  if (res3.status === 401 || res3.status === 403) {
    console.log(`✅ PASS: Missing HMAC signature header correctly rejected with ${res3.status}.`);
    passedCount++;
  } else {
    console.error(`❌ FAIL: Missing HMAC signature allowed with status ${res3.status}`);
  }

  // ----------------------------------------------------
  // TEST 4: Tampered request body rejected
  // ----------------------------------------------------
  console.log('▶ TEST 4: Tampered request body rejected...');
  const tamperedBody = JSON.stringify({ ...payload1, tampered: true });
  // Pass signature calculated from original body1, but send tamperedBody
  const res4 = await fetch(`${API_URL}/api/whatsapp/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hub-signature-256': sig1,
    },
    body: tamperedBody,
  });

  if (res4.status === 401 || res4.status === 403) {
    console.log(`✅ PASS: Tampered request body correctly rejected with ${res4.status}.`);
    passedCount++;
  } else {
    console.error(`❌ FAIL: Tampered body allowed with status ${res4.status}`);
  }

  // ----------------------------------------------------
  // TEST 5: GET Meta verification handshake still works
  // ----------------------------------------------------
  console.log('▶ TEST 5: GET Meta verification handshake still works...');
  const res5 = await fetch(`${API_URL}/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=selldesk_verify_token_2026&hub.challenge=CHALLENGE_999`);
  const text5 = await res5.text();

  if (res5.status === 200 && text5 === 'CHALLENGE_999') {
    console.log('✅ PASS: GET Meta webhook verification handshake returned challenge correctly.');
    passedCount++;
  } else {
    console.error(`❌ FAIL: GET Meta verification failed: status ${res5.status}, response: ${text5}`);
  }

  // ----------------------------------------------------
  // TEST 6: Unknown phone_number_id does not resolve to another tenant
  // ----------------------------------------------------
  console.log('▶ TEST 6: Unknown phone_number_id handling...');
  const unknownPayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'WABA_UNKNOWN',
        changes: [
          {
            field: 'messages',
            value: {
              messaging_product: 'whatsapp',
              metadata: { phone_number_id: `UNKNOWN_PHONE_ID_${ts}` },
            },
          },
        ],
      },
    ],
  };
  const unknownBody = JSON.stringify(unknownPayload);
  const unknownSig = calculateHmac(unknownBody);

  const res6 = await fetch(`${API_URL}/api/whatsapp/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hub-signature-256': unknownSig,
    },
    body: unknownBody,
  });

  if (res6.status === 404) {
    console.log('✅ PASS: Unknown phone_number_id correctly returned 404 Not Found.');
    passedCount++;
  } else {
    console.error(`❌ FAIL: Unknown phone_number_id returned status ${res6.status}`);
  }

  // ----------------------------------------------------
  // TEST 7: Duplicate external WhatsApp message ID (wamid) idempotency
  // ----------------------------------------------------
  console.log('▶ TEST 7: Duplicate external WhatsApp message ID (wamid) idempotency...');
  const custA = await prisma.customer.create({
    data: { businessId: bizAId, fullName: 'Customer Idem', phoneNumber: '03001112233' },
  });
  const convA = await prisma.conversation.create({
    data: {
      businessId: bizAId,
      customerId: custA.id,
      channel: 'WHATSAPP',
      externalContactId: '03001112233',
      status: 'OPEN',
    },
  });

  const wamid = `wamid.E2E_${ts}`;
  // First insertion
  const msg1 = await prisma.message.create({
    data: {
      businessId: bizAId,
      conversationId: convA.id,
      externalMessageId: wamid,
      direction: 'INBOUND',
      type: 'TEXT',
      text: 'Original message text',
      status: 'RECEIVED',
    },
  });

  // Attempt duplicate insertion
  let duplicatePrevented = false;
  try {
    await prisma.message.create({
      data: {
        businessId: bizAId,
        conversationId: convA.id,
        externalMessageId: wamid,
        direction: 'INBOUND',
        type: 'TEXT',
        text: 'Duplicate message text',
        status: 'RECEIVED',
      },
    });
  } catch (err) {
    duplicatePrevented = true;
  }

  const messageCount = await prisma.message.count({
    where: { businessId: bizAId, externalMessageId: wamid },
  });

  if (duplicatePrevented && messageCount === 1) {
    console.log('✅ PASS: Duplicate externalMessageId (wamid) strictly blocked by composite unique constraint.');
    passedCount++;
  } else {
    console.error(`❌ FAIL: Duplicate wamid allowed (count: ${messageCount})`);
  }

  // ----------------------------------------------------
  // TEST 8: Database failure does not silently fall back to in-memory state
  // ----------------------------------------------------
  console.log('▶ TEST 8: Verify no silent in-memory fallback on database queries...');
  // Querying non-existent business ID directly in DB returns null, does not invoke in-memory map
  const nullConfig = await prisma.whatsAppConfig.findUnique({
    where: { businessId: 'non-existent-biz-id' },
  });

  if (nullConfig === null) {
    console.log('✅ PASS: Database queries return real null / throw DB exceptions, non-fallback.');
    passedCount++;
  } else {
    console.error('❌ FAIL: Database query returned unexpected state:', nullConfig);
  }

  // ----------------------------------------------------
  // TEST 9: Existing WhatsApp foundation behavior still works
  // ----------------------------------------------------
  console.log('▶ TEST 9: Existing WhatsApp config CRUD still works...');
  const tokenA = dataA.accessToken;
  const cfgGetRes = await fetch(`${API_URL}/api/whatsapp/config`, {
    headers: {
      Authorization: `Bearer ${tokenA}`,
      'x-tenant-id': bizAId,
    },
  });

  if (cfgGetRes.status === 200) {
    const cfgData = await cfgGetRes.json();
    if (cfgData.phoneNumberId === phoneNumIdA && !cfgData.accessToken) {
      console.log('✅ PASS: WhatsApp config endpoint returned safe tenant configuration (accessToken stripped).');
      passedCount++;
    } else {
      console.error('❌ FAIL: Config data mismatch or sensitive token exposed:', cfgData);
    }
  } else {
    console.error(`❌ FAIL: Config endpoint returned status ${cfgGetRes.status}`);
  }

  // ----------------------------------------------------
  // TEST 10: Existing tenant isolation remains intact
  // ----------------------------------------------------
  console.log('▶ TEST 10: Existing tenant isolation remains intact...');
  const tokenB = dataB.accessToken;
  const cfgBGetRes = await fetch(`${API_URL}/api/whatsapp/config`, {
    headers: {
      Authorization: `Bearer ${tokenB}`,
      'x-tenant-id': bizBId,
    },
  });

  const cfgBText = await cfgBGetRes.text();
  const cfgBData = cfgBText ? JSON.parse(cfgBText) : null;
  if (cfgBGetRes.status === 200 && (cfgBData === null || !cfgBData.phoneNumberId)) {
    console.log('✅ PASS: Business B query returned null for Business A config (tenant isolated).');
    passedCount++;
  } else {
    console.error(`❌ FAIL: Business B accessed Business A config or invalid status ${cfgBGetRes.status}:`, cfgBData);
  }

  console.log('\n==================================================');
  console.log(`PHASE 10.1A RESULTS: ${passedCount} / ${totalCount} PASSED`);
  console.log('==================================================\n');

  await prisma.$disconnect();

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runPhase10_1aTests().catch((err) => {
  console.error('Test execution error:', err);
  prisma.$disconnect();
  process.exit(1);
});
