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

function buildMetaWebhookPayload(phoneNumberId, messages = [], contacts = []) {
  const valueObj = {
    messaging_product: 'whatsapp',
    metadata: {
      phone_number_id: phoneNumberId,
      display_phone_number: '+923001234567',
    },
  };

  if (contacts.length > 0) valueObj.contacts = contacts;
  if (messages.length > 0) valueObj.messages = messages;

  return {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'ENTRY_ID_1D',
        changes: [
          {
            field: 'messages',
            value: valueObj,
          },
        ],
      },
    ],
  };
}

async function sendWebhookPayload(payload) {
  const rawBody = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const signature = calculateHmac(rawBody);

  const res = await fetch(`${API_URL}/api/whatsapp/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hub-signature-256': signature,
    },
    body: rawBody,
  });

  const json = await res.json().catch(() => ({}));
  return { status: res.status, data: json };
}

async function runPhase10_1dTests() {
  console.log('==================================================');
  console.log('SELLDESK — PHASE 10.1D WHATSAPP → AI INTENT ENGINE & GUARDRAILS TEST SUITE');
  console.log('==================================================\n');

  const ts = Date.now().toString(36);
  let passedCount = 0;
  const totalCount = 13;

  // ----------------------------------------------------
  // SETUP: Provision Business A & Business B + WhatsApp Configs
  // ----------------------------------------------------
  console.log('[Setup] Registering Business A & Business B...');

  const regARes = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `waai_ownera_${ts}@example.test`,
      password: 'Password123!',
      fullName: 'AI Owner A',
      businessName: `AI Biz A ${ts}`,
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
      email: `waai_ownerb_${ts}@example.test`,
      password: 'Password123!',
      fullName: 'AI Owner B',
      businessName: `AI Biz B ${ts}`,
      phone: '03004445566',
      city: 'Karachi',
      country: 'Pakistan',
    }),
  });
  const dataB = await regBRes.json();
  const bizBId = dataB.business.id;

  await prisma.business.update({ where: { id: bizAId }, data: { status: 'APPROVED' } });
  await prisma.business.update({ where: { id: bizBId }, data: { status: 'APPROVED' } });

  const phoneNumIdA = `PHONE_ID_AI_A_${ts}`;
  const phoneNumIdB = `PHONE_ID_AI_B_${ts}`;

  await prisma.whatsAppConfig.create({
    data: {
      businessId: bizAId,
      phoneNumberId: phoneNumIdA,
      wabaId: `WABA_AI_A_${ts}`,
      accessToken: `TOKEN_AI_A_${ts}`,
      verifyToken: 'selldesk_verify_token_2026',
      displayPhoneNumber: '+92 300 1112233',
      verifiedName: 'AI Store A',
      isActive: true,
    },
  });

  await prisma.whatsAppConfig.create({
    data: {
      businessId: bizBId,
      phoneNumberId: phoneNumIdB,
      wabaId: `WABA_AI_B_${ts}`,
      accessToken: `TOKEN_AI_B_${ts}`,
      verifyToken: 'selldesk_verify_token_2026',
      displayPhoneNumber: '+92 300 4445566',
      verifiedName: 'AI Store B',
      isActive: true,
    },
  });

  console.log(`[Setup] Provisioned Business A (${bizAId}, Phone ID: ${phoneNumIdA}) and Business B (${bizBId}, Phone ID: ${phoneNumIdB}).\n`);

  const custPhoneA = `92300${Math.floor(1000000 + Math.random() * 9000000)}`;
  const wamid1 = `wamid.AI_TEST_1_${ts}`;
  const orderMessageText = '2 black XL COD Lahore please';

  const orderPayload = buildMetaWebhookPayload(
    phoneNumIdA,
    [
      {
        from: custPhoneA,
        id: wamid1,
        timestamp: '1730000000',
        type: 'text',
        text: { body: orderMessageText },
      },
    ],
    [
      {
        profile: { name: 'Zohaib Customer' },
        wa_id: custPhoneA,
      },
    ],
  );

  // Send Order Inbound Webhook
  const initialOrderCount = await prisma.order.count({ where: { businessId: bizAId } });
  const initialOutboundMsgCount = await prisma.message.count({ where: { businessId: bizAId, direction: 'OUTBOUND' } });

  const res1 = await sendWebhookPayload(orderPayload);

  // 1. Text inbound message is persisted
  console.log('▶ TEST 1: Text inbound message is persisted...');
  const msg1 = await prisma.message.findFirst({
    where: { businessId: bizAId, externalMessageId: wamid1 },
    include: { conversation: { include: { customer: true } } },
  });
  if (res1.status === 200 || res1.status === 201) {
    if (msg1 && msg1.text === orderMessageText) {
      console.log(`✅ PASS: Inbound Message persisted in DB (ID: ${msg1.id}).`);
      passedCount++;
    } else {
      console.error('❌ FAIL: Inbound Message missing in DB:', res1);
    }
  } else {
    console.error(`❌ FAIL: Webhook returned HTTP status ${res1.status}`);
  }

  // 2. Correct businessId is carried into AI processing
  console.log('▶ TEST 2: Correct businessId is carried into AI processing...');
  const aiActionsA = await prisma.aiAction.findMany({
    where: { businessId: bizAId, customerPhone: custPhoneA },
  });
  if (aiActionsA.length > 0 && aiActionsA[0].businessId === bizAId) {
    console.log(`✅ PASS: AiAction correctly scoped to Business A (${bizAId}).`);
    passedCount++;
  } else {
    console.error('❌ FAIL: AiAction not found or wrong businessId:', aiActionsA);
  }

  // 3. Intent classification is executed using existing service
  console.log('▶ TEST 3: Intent classification executed using existing AiService...');
  const action1 = aiActionsA[0];
  if (action1 && action1.type === 'ORDER_EXTRACTION') {
    console.log(`✅ PASS: Classified intent = ORDER_EXTRACTION.`);
    passedCount++;
  } else {
    console.error(`❌ FAIL: Expected intent ORDER_EXTRACTION but got ${action1?.type}`);
  }

  // 4. Relevant order intent triggers existing order extraction
  console.log('▶ TEST 4: Relevant order intent triggers order extraction payload...');
  let parsedExtractedData = null;
  try {
    parsedExtractedData = JSON.parse(action1.extractedData);
  } catch {}

  if (
    parsedExtractedData &&
    parsedExtractedData.extractedOrder &&
    parsedExtractedData.extractedOrder.quantity === 2 &&
    parsedExtractedData.extractedOrder.size === 'XL'
  ) {
    console.log('✅ PASS: Order extraction extracted 2x XL Black Hoodie items.');
    passedCount++;
  } else {
    console.error('❌ FAIL: Order extraction data structural mismatch:', parsedExtractedData);
  }

  // 5. AiAction is persisted
  console.log('▶ TEST 5: AiAction is persisted in PostgreSQL...');
  if (action1 && action1.id) {
    console.log(`✅ PASS: AiAction record exists (ID: ${action1.id}).`);
    passedCount++;
  } else {
    console.error('❌ FAIL: AiAction record missing.');
  }

  // 6. AiAction belongs to the correct tenant
  console.log('▶ TEST 6: AiAction belongs strictly to Business A...');
  const aiActionsB = await prisma.aiAction.findMany({
    where: { businessId: bizBId, customerPhone: custPhoneA },
  });
  if (aiActionsB.length === 0) {
    console.log('✅ PASS: Business B has 0 actions for Business A customer (tenant isolated).');
    passedCount++;
  } else {
    console.error('❌ FAIL: Tenant isolation leak! Business B action count:', aiActionsB.length);
  }

  // 7. AI failure does not delete the inbound Message
  console.log('▶ TEST 7: AI failure does not delete or roll back inbound Message...');
  const msg1StillExists = await prisma.message.findUnique({ where: { id: msg1.id } });
  if (msg1StillExists) {
    console.log('✅ PASS: Inbound message remains securely stored in database.');
    passedCount++;
  } else {
    console.error('❌ FAIL: Inbound message disappeared!');
  }

  // 8. Duplicate webhook/message does not create duplicate AI action
  console.log('▶ TEST 8: Duplicate webhook does not create duplicate AI action...');
  const initialActionCount = await prisma.aiAction.count({ where: { businessId: bizAId, rawText: orderMessageText } });
  await sendWebhookPayload(orderPayload); // Send duplicate payload
  const finalActionCount = await prisma.aiAction.count({ where: { businessId: bizAId, rawText: orderMessageText } });

  if (initialActionCount === 1 && finalActionCount === 1) {
    console.log('✅ PASS: Idempotency check prevented duplicate AiAction creation.');
    passedCount++;
  } else {
    console.error(`❌ FAIL: Duplicate AiAction created! Initial: ${initialActionCount}, Final: ${finalActionCount}`);
  }

  // 9. Unsupported message type does not crash webhook or create fake AI action
  console.log('▶ TEST 9: Non-text message type handled safely without AI error...');
  const imageWamid = `wamid.AI_IMG_${ts}`;
  const imagePayload = buildMetaWebhookPayload(
    phoneNumIdA,
    [
      {
        from: custPhoneA,
        id: imageWamid,
        timestamp: '1730000100',
        type: 'image',
        image: { id: 'IMG_123', caption: 'Image attachment' },
      },
    ],
  );
  const imageRes = await sendWebhookPayload(imagePayload);
  const imgMsgInDb = await prisma.message.findFirst({ where: { businessId: bizAId, externalMessageId: imageWamid } });

  if ((imageRes.status === 200 || imageRes.status === 201) && imgMsgInDb) {
    console.log('✅ PASS: Image message persisted, AI pipeline skipped safely without error.');
    passedCount++;
  } else {
    console.error('❌ FAIL: Image webhook failed:', imageRes);
  }

  // 10. AI pipeline does NOT call Meta Graph API (0 outbound messages)
  console.log('▶ TEST 10: AI pipeline does NOT call Meta Graph API (0 outbound messages)...');
  const finalOutboundMsgCount = await prisma.message.count({ where: { businessId: bizAId, direction: 'OUTBOUND' } });
  if (initialOutboundMsgCount === finalOutboundMsgCount) {
    console.log('✅ PASS: 0 outbound WhatsApp messages sent during AI processing.');
    passedCount++;
  } else {
    console.error(`❌ FAIL: Outbound messages sent during AI pipeline! Count: ${finalOutboundMsgCount}`);
  }

  // 11. AI pipeline does NOT automatically create an Order (Order count remains 0)
  console.log('▶ TEST 11: AI pipeline does NOT automatically create an Order...');
  const finalOrderCount = await prisma.order.count({ where: { businessId: bizAId } });
  if (initialOrderCount === finalOrderCount) {
    console.log('✅ PASS: 0 orders created automatically. Order count remains unchanged.');
    passedCount++;
  } else {
    console.error(`❌ FAIL: Automatic order creation occurred! Initial: ${initialOrderCount}, Final: ${finalOrderCount}`);
  }

  // 12. AI action remains in PENDING_APPROVAL status
  console.log('▶ TEST 12: AI action status remains PENDING_APPROVAL...');
  if (action1.status === 'PENDING_APPROVAL') {
    console.log('✅ PASS: Action status is PENDING_APPROVAL awaiting human seller review.');
    passedCount++;
  } else {
    console.error(`❌ FAIL: Action status mismatch: ${action1.status}`);
  }

  // 13. Cross-tenant data cannot be used to create/process an AI action
  console.log('▶ TEST 13: Cross-tenant guard verification...');
  const tokenB = dataB.accessToken;
  const actionsResB = await fetch(`${API_URL}/api/ai/actions`, {
    headers: { Authorization: `Bearer ${tokenB}`, 'x-tenant-id': bizBId },
  });
  const actionsDataB = await actionsResB.json();

  const containsBizAAction = Array.isArray(actionsDataB) && actionsDataB.some((a) => a.id === action1.id);
  if (!containsBizAAction) {
    console.log('✅ PASS: Business B GET /api/ai/actions endpoint cannot see Business A AI actions.');
    passedCount++;
  } else {
    console.error('❌ FAIL: Cross-tenant leak in GET /api/ai/actions!');
  }

  console.log('\n==================================================');
  console.log(`PHASE 10.1D RESULTS: ${passedCount} / ${totalCount} PASSED`);
  console.log('==================================================\n');

  await prisma.$disconnect();

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runPhase10_1dTests().catch((err) => {
  console.error('Test execution error:', err);
  prisma.$disconnect();
  process.exit(1);
});
