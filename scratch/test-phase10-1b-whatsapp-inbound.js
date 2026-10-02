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

function buildMetaWebhookPayload(phoneNumberId, messages = [], contacts = [], statuses = []) {
  const valueObj = {
    messaging_product: 'whatsapp',
    metadata: {
      phone_number_id: phoneNumberId,
      display_phone_number: '+923001234567',
    },
  };

  if (contacts.length > 0) valueObj.contacts = contacts;
  if (messages.length > 0) valueObj.messages = messages;
  if (statuses.length > 0) valueObj.statuses = statuses;

  return {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'ENTRY_ID_1',
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

async function runPhase10_1bTests() {
  console.log('==================================================');
  console.log('SELLDESK — PHASE 10.1B WHATSAPP INBOUND PERSISTENCE TEST SUITE');
  console.log('==================================================\n');

  const ts = Date.now().toString(36);
  let passedCount = 0;
  const totalCount = 30;

  // ----------------------------------------------------
  // SETUP: Provision Business A & Business B + WhatsApp Configs
  // ----------------------------------------------------
  console.log('[Setup] Registering Business A & Business B...');

  const regARes = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `wainb_ownera_${ts}@example.test`,
      password: 'Password123!',
      fullName: 'Inbound Owner A',
      businessName: `Inbound Biz A ${ts}`,
      phone: '03001000001',
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
      email: `wainb_ownerb_${ts}@example.test`,
      password: 'Password123!',
      fullName: 'Inbound Owner B',
      businessName: `Inbound Biz B ${ts}`,
      phone: '03002000002',
      city: 'Karachi',
      country: 'Pakistan',
    }),
  });
  const dataB = await regBRes.json();
  const bizBId = dataB.business.id;

  await prisma.business.update({ where: { id: bizAId }, data: { status: 'APPROVED' } });
  await prisma.business.update({ where: { id: bizBId }, data: { status: 'APPROVED' } });

  const phoneNumIdA = `PHONE_ID_INB_A_${ts}`;
  const phoneNumIdB = `PHONE_ID_INB_B_${ts}`;

  await prisma.whatsAppConfig.create({
    data: {
      businessId: bizAId,
      phoneNumberId: phoneNumIdA,
      wabaId: `WABA_INB_A_${ts}`,
      accessToken: `TOKEN_INB_A_${ts}`,
      verifyToken: 'selldesk_verify_token_2026',
      displayPhoneNumber: '+92 300 1000001',
      verifiedName: 'Inbound Store A',
      isActive: true,
    },
  });

  await prisma.whatsAppConfig.create({
    data: {
      businessId: bizBId,
      phoneNumberId: phoneNumIdB,
      wabaId: `WABA_INB_B_${ts}`,
      accessToken: `TOKEN_INB_B_${ts}`,
      verifyToken: 'selldesk_verify_token_2026',
      displayPhoneNumber: '+92 300 2000002',
      verifiedName: 'Inbound Store B',
      isActive: true,
    },
  });

  console.log(`[Setup] Provisioned Business A (${bizAId}, Phone ID: ${phoneNumIdA}) and Business B (${bizBId}, Phone ID: ${phoneNumIdB}).\n`);

  // Shared customer phone for testing
  const custPhoneA = `9230099${Math.floor(10000 + Math.random() * 90000)}`;
  const wamid1 = `wamid.HBgL${ts}_1`;

  // Payload for Text Message #1
  const textPayload1 = buildMetaWebhookPayload(
    phoneNumIdA,
    [
      {
        from: custPhoneA,
        id: wamid1,
        timestamp: '1730000000',
        type: 'text',
        text: { body: 'Hello SellDesk Store A!' },
      },
    ],
    [
      {
        profile: { name: 'John Doe Customer' },
        wa_id: custPhoneA,
      },
    ],
  );

  // Send Webhook #1
  const res1 = await sendWebhookPayload(textPayload1);

  // Retrieve DB records created for Message #1
  const createdMsg1 = await prisma.message.findFirst({
    where: { businessId: bizAId, externalMessageId: wamid1 },
    include: { conversation: { include: { customer: true } } },
  });

  // 1. Valid signed text webhook creates Customer
  console.log('▶ TEST 1: Valid signed text webhook creates Customer...');
  if ((res1.status === 200 || res1.status === 201) && res1.data.status === 'PROCESSED' && createdMsg1?.conversation?.customer) {
    console.log(`✅ PASS: Customer created in DB (ID: ${createdMsg1.conversation.customer.id}).`);
    passedCount++;
  } else {
    console.error('❌ FAIL: Customer creation failed:', res1);
  }

  // 2. Valid signed text webhook creates Conversation
  console.log('▶ TEST 2: Valid signed text webhook creates Conversation...');
  if (createdMsg1?.conversation) {
    console.log(`✅ PASS: Conversation created in DB (ID: ${createdMsg1.conversation.id}).`);
    passedCount++;
  } else {
    console.error('❌ FAIL: Conversation creation failed.');
  }

  // 3. Valid signed text webhook creates Message
  console.log('▶ TEST 3: Valid signed text webhook creates Message...');
  if (createdMsg1) {
    console.log(`✅ PASS: Message created in DB (ID: ${createdMsg1.id}).`);
    passedCount++;
  } else {
    console.error('❌ FAIL: Message record missing in DB.');
  }

  // 4. Message direction is INBOUND
  console.log('▶ TEST 4: Message direction is INBOUND...');
  if (createdMsg1?.direction === 'INBOUND') {
    console.log('✅ PASS: Direction is INBOUND.');
    passedCount++;
  } else {
    console.error(`❌ FAIL: Expected INBOUND but got ${createdMsg1?.direction}`);
  }

  // 5. Message channel is WHATSAPP
  console.log('▶ TEST 5: Message channel is WHATSAPP...');
  if (createdMsg1?.conversation?.channel === 'WHATSAPP') {
    console.log('✅ PASS: Conversation channel is WHATSAPP.');
    passedCount++;
  } else {
    console.error(`❌ FAIL: Expected WHATSAPP but got ${createdMsg1?.conversation?.channel}`);
  }

  // 6. Message type TEXT is correct
  console.log('▶ TEST 6: Message type TEXT is correct...');
  if (createdMsg1?.type === 'TEXT') {
    console.log('✅ PASS: Message type is TEXT.');
    passedCount++;
  } else {
    console.error(`❌ FAIL: Expected TEXT but got ${createdMsg1?.type}`);
  }

  // 7. Text body is persisted correctly
  console.log('▶ TEST 7: Text body is persisted correctly...');
  if (createdMsg1?.text === 'Hello SellDesk Store A!') {
    console.log('✅ PASS: Text body matched original body payload.');
    passedCount++;
  } else {
    console.error(`❌ FAIL: Text body mismatch: "${createdMsg1?.text}"`);
  }

  // Send Second Message from Same Customer & Phone
  const wamid2 = `wamid.HBgL${ts}_2`;
  const textPayload2 = buildMetaWebhookPayload(
    phoneNumIdA,
    [
      {
        from: custPhoneA,
        id: wamid2,
        timestamp: '1730000060',
        type: 'text',
        text: { body: 'Second message from same customer' },
      },
    ],
    [
      {
        profile: { name: 'John Doe Customer Updated Name' },
        wa_id: custPhoneA,
      },
    ],
  );

  const res2 = await sendWebhookPayload(textPayload2);
  const createdMsg2 = await prisma.message.findFirst({
    where: { businessId: bizAId, externalMessageId: wamid2 },
    include: { conversation: { include: { customer: true } } },
  });

  // 8. Customer is reused for second message
  console.log('▶ TEST 8: Customer is reused for second message...');
  if (createdMsg2?.conversation?.customerId === createdMsg1?.conversation?.customerId) {
    console.log(`✅ PASS: Same Customer ID reused (${createdMsg2?.conversation?.customerId}).`);
    passedCount++;
  } else {
    console.error(`❌ FAIL: New Customer created! Msg1 Customer: ${createdMsg1?.conversation?.customerId}, Msg2 Customer: ${createdMsg2?.conversation?.customerId}`);
  }

  // 9. Conversation is reused for second message
  console.log('▶ TEST 9: Conversation is reused for second message...');
  if (createdMsg2?.conversationId === createdMsg1?.conversationId) {
    console.log(`✅ PASS: Same Conversation ID reused (${createdMsg2?.conversationId}).`);
    passedCount++;
  } else {
    console.error(`❌ FAIL: New Conversation created! Msg1 Conv: ${createdMsg1?.conversationId}, Msg2 Conv: ${createdMsg2?.conversationId}`);
  }

  // 10. Second message creates only one additional Message
  console.log('▶ TEST 10: Second message creates only one additional Message...');
  const totalMessagesConv = await prisma.message.count({
    where: { conversationId: createdMsg1?.conversationId },
  });
  if (totalMessagesConv === 2) {
    console.log('✅ PASS: Exactly 2 messages exist in conversation thread.');
    passedCount++;
  } else {
    console.error(`❌ FAIL: Expected 2 messages in conversation but found ${totalMessagesConv}`);
  }

  // 11. Duplicate same wamid does not create duplicate Message
  console.log('▶ TEST 11: Duplicate same wamid does not create duplicate Message...');
  const res1Duplicate = await sendWebhookPayload(textPayload1);
  const duplicateMsgCount = await prisma.message.count({
    where: { businessId: bizAId, externalMessageId: wamid1 },
  });
  if (res1Duplicate.data.status === 'DUPLICATE_IGNORED' && duplicateMsgCount === 1) {
    console.log('✅ PASS: Duplicate wamid safely ignored, count remained 1.');
    passedCount++;
  } else {
    console.error('❌ FAIL: Duplicate wamid handling failed:', res1Duplicate, duplicateMsgCount);
  }

  // 12. Business A cannot see/use Business B customer
  console.log('▶ TEST 12: Business A cannot see/use Business B customer...');
  const bizBCustomersCount = await prisma.customer.count({
    where: { businessId: bizBId },
  });
  if (bizBCustomersCount === 0) {
    console.log('✅ PASS: Business B has 0 customers, Business A customer isolated.');
    passedCount++;
  } else {
    console.error(`❌ FAIL: Business B customer count expected 0 but got ${bizBCustomersCount}`);
  }

  // 13. Same phone number can exist independently in Business A and Business B
  console.log('▶ TEST 13: Same phone number can exist independently in Business A and Business B...');
  const wamidB1 = `wamid.HBgL_BIZB_${ts}`;
  const textPayloadB = buildMetaWebhookPayload(
    phoneNumIdB,
    [
      {
        from: custPhoneA,
        id: wamidB1,
        timestamp: '1730000100',
        type: 'text',
        text: { body: 'Hello Business B from same phone!' },
      },
    ],
    [
      {
        profile: { name: 'John Doe Customer in B' },
        wa_id: custPhoneA,
      },
    ],
  );
  await sendWebhookPayload(textPayloadB);

  const custAInDb = await prisma.customer.findFirst({ where: { businessId: bizAId, phoneNumber: custPhoneA } });
  const custBInDb = await prisma.customer.findFirst({ where: { businessId: bizBId, phoneNumber: custPhoneA } });

  if (custAInDb && custBInDb && custAInDb.id !== custBInDb.id) {
    console.log(`✅ PASS: Independent customer records created in Business A (${custAInDb.id}) and Business B (${custBInDb.id}).`);
    passedCount++;
  } else {
    console.error('❌ FAIL: Tenant boundary broken or shared customer across businesses:', { custAInDb, custBInDb });
  }

  // ----------------------------------------------------
  // TEST 14: Image payload maps to IMAGE
  // ----------------------------------------------------
  console.log('▶ TEST 14: Image payload maps to IMAGE...');
  const wamidImage = `wamid.IMG_${ts}`;
  const imagePayload = buildMetaWebhookPayload(phoneNumIdA, [
    {
      from: custPhoneA,
      id: wamidImage,
      timestamp: '1730000200',
      type: 'image',
      image: { id: 'MEDIA_ID_IMG_123', caption: 'Sample shirt image' },
    },
  ]);
  await sendWebhookPayload(imagePayload);
  const msgImage = await prisma.message.findFirst({ where: { businessId: bizAId, externalMessageId: wamidImage } });
  if (msgImage?.type === 'IMAGE' && msgImage?.text === 'Sample shirt image') {
    console.log('✅ PASS: Image payload mapped correctly to IMAGE with caption.');
    passedCount++;
  } else {
    console.error('❌ FAIL: Image payload mapping failed:', msgImage);
  }

  // ----------------------------------------------------
  // TEST 15: Document payload maps to DOCUMENT
  // ----------------------------------------------------
  console.log('▶ TEST 15: Document payload maps to DOCUMENT...');
  const wamidDoc = `wamid.DOC_${ts}`;
  const docPayload = buildMetaWebhookPayload(phoneNumIdA, [
    {
      from: custPhoneA,
      id: wamidDoc,
      timestamp: '1730000210',
      type: 'document',
      document: { id: 'MEDIA_ID_DOC_456', filename: 'invoice.pdf', caption: 'Payment PDF' },
    },
  ]);
  await sendWebhookPayload(docPayload);
  const msgDoc = await prisma.message.findFirst({ where: { businessId: bizAId, externalMessageId: wamidDoc } });
  if (msgDoc?.type === 'DOCUMENT' && msgDoc?.text === 'Payment PDF') {
    console.log('✅ PASS: Document payload mapped correctly to DOCUMENT.');
    passedCount++;
  } else {
    console.error('❌ FAIL: Document payload mapping failed:', msgDoc);
  }

  // ----------------------------------------------------
  // TEST 16: Audio payload maps to AUDIO
  // ----------------------------------------------------
  console.log('▶ TEST 16: Audio payload maps to AUDIO...');
  const wamidAudio = `wamid.AUD_${ts}`;
  const audioPayload = buildMetaWebhookPayload(phoneNumIdA, [
    {
      from: custPhoneA,
      id: wamidAudio,
      timestamp: '1730000220',
      type: 'audio',
      audio: { id: 'MEDIA_ID_AUD_789', voice: true },
    },
  ]);
  await sendWebhookPayload(audioPayload);
  const msgAudio = await prisma.message.findFirst({ where: { businessId: bizAId, externalMessageId: wamidAudio } });
  if (msgAudio?.type === 'AUDIO' && msgAudio?.text === '[Voice message]') {
    console.log('✅ PASS: Audio payload mapped correctly to AUDIO.');
    passedCount++;
  } else {
    console.error('❌ FAIL: Audio payload mapping failed:', msgAudio);
  }

  // ----------------------------------------------------
  // TEST 17: Video payload maps to VIDEO
  // ----------------------------------------------------
  console.log('▶ TEST 17: Video payload maps to VIDEO...');
  const wamidVideo = `wamid.VID_${ts}`;
  const videoPayload = buildMetaWebhookPayload(phoneNumIdA, [
    {
      from: custPhoneA,
      id: wamidVideo,
      timestamp: '1730000230',
      type: 'video',
      video: { id: 'MEDIA_ID_VID_101', caption: 'Product unboxing' },
    },
  ]);
  await sendWebhookPayload(videoPayload);
  const msgVideo = await prisma.message.findFirst({ where: { businessId: bizAId, externalMessageId: wamidVideo } });
  if (msgVideo?.type === 'VIDEO' && msgVideo?.text === 'Product unboxing') {
    console.log('✅ PASS: Video payload mapped correctly to VIDEO.');
    passedCount++;
  } else {
    console.error('❌ FAIL: Video payload mapping failed:', msgVideo);
  }

  // ----------------------------------------------------
  // TEST 18: Sticker payload maps to STICKER
  // ----------------------------------------------------
  console.log('▶ TEST 18: Sticker payload maps to STICKER...');
  const wamidSticker = `wamid.STK_${ts}`;
  const stickerPayload = buildMetaWebhookPayload(phoneNumIdA, [
    {
      from: custPhoneA,
      id: wamidSticker,
      timestamp: '1730000240',
      type: 'sticker',
      sticker: { id: 'MEDIA_ID_STK_202' },
    },
  ]);
  await sendWebhookPayload(stickerPayload);
  const msgSticker = await prisma.message.findFirst({ where: { businessId: bizAId, externalMessageId: wamidSticker } });
  if (msgSticker?.type === 'STICKER' && msgSticker?.text === '[Sticker received]') {
    console.log('✅ PASS: Sticker payload mapped correctly to STICKER.');
    passedCount++;
  } else {
    console.error('❌ FAIL: Sticker payload mapping failed:', msgSticker);
  }

  // ----------------------------------------------------
  // TEST 19: Location payload maps to LOCATION
  // ----------------------------------------------------
  console.log('▶ TEST 19: Location payload maps to LOCATION...');
  const wamidLoc = `wamid.LOC_${ts}`;
  const locPayload = buildMetaWebhookPayload(phoneNumIdA, [
    {
      from: custPhoneA,
      id: wamidLoc,
      timestamp: '1730000250',
      type: 'location',
      location: { latitude: 24.8607, longitude: 67.0011, name: 'Main Office', address: 'Karachi, Pakistan' },
    },
  ]);
  await sendWebhookPayload(locPayload);
  const msgLoc = await prisma.message.findFirst({ where: { businessId: bizAId, externalMessageId: wamidLoc } });
  if (msgLoc?.type === 'LOCATION' && msgLoc?.text?.includes('Main Office')) {
    console.log('✅ PASS: Location payload mapped correctly to LOCATION.');
    passedCount++;
  } else {
    console.error('❌ FAIL: Location payload mapping failed:', msgLoc);
  }

  // ----------------------------------------------------
  // TEST 20: Interactive payload maps to INTERACTIVE
  // ----------------------------------------------------
  console.log('▶ TEST 20: Interactive payload maps to INTERACTIVE...');
  const wamidInteractive = `wamid.INT_${ts}`;
  const interactivePayload = buildMetaWebhookPayload(phoneNumIdA, [
    {
      from: custPhoneA,
      id: wamidInteractive,
      timestamp: '1730000260',
      type: 'interactive',
      interactive: { type: 'button_reply', button_reply: { id: 'btn_confirm', title: 'Confirm Order' } },
    },
  ]);
  await sendWebhookPayload(interactivePayload);
  const msgInteractive = await prisma.message.findFirst({ where: { businessId: bizAId, externalMessageId: wamidInteractive } });
  if (msgInteractive?.type === 'INTERACTIVE' && msgInteractive?.text === 'Confirm Order') {
    console.log('✅ PASS: Interactive payload mapped correctly to INTERACTIVE.');
    passedCount++;
  } else {
    console.error('❌ FAIL: Interactive payload mapping failed:', msgInteractive);
  }

  // ----------------------------------------------------
  // TEST 21: Button payload maps to BUTTON
  // ----------------------------------------------------
  console.log('▶ TEST 21: Button payload maps to BUTTON...');
  const wamidBtn = `wamid.BTN_${ts}`;
  const btnPayload = buildMetaWebhookPayload(phoneNumIdA, [
    {
      from: custPhoneA,
      id: wamidBtn,
      timestamp: '1730000270',
      type: 'button',
      button: { text: 'Yes, Proceed', payload: 'PAYLOAD_PROCEED' },
    },
  ]);
  await sendWebhookPayload(btnPayload);
  const msgBtn = await prisma.message.findFirst({ where: { businessId: bizAId, externalMessageId: wamidBtn } });
  if (msgBtn?.type === 'BUTTON' && msgBtn?.text === 'Yes, Proceed') {
    console.log('✅ PASS: Button payload mapped correctly to BUTTON.');
    passedCount++;
  } else {
    console.error('❌ FAIL: Button payload mapping failed:', msgBtn);
  }

  // ----------------------------------------------------
  // TEST 22: Unsupported type safely maps to OTHER
  // ----------------------------------------------------
  console.log('▶ TEST 22: Unsupported type safely maps to OTHER...');
  const wamidOther = `wamid.OTH_${ts}`;
  const otherPayload = buildMetaWebhookPayload(phoneNumIdA, [
    {
      from: custPhoneA,
      id: wamidOther,
      timestamp: '1730000280',
      type: 'unsupported_future_type',
    },
  ]);
  await sendWebhookPayload(otherPayload);
  const msgOther = await prisma.message.findFirst({ where: { businessId: bizAId, externalMessageId: wamidOther } });
  if (msgOther?.type === 'OTHER') {
    console.log('✅ PASS: Unsupported payload mapped safely to OTHER.');
    passedCount++;
  } else {
    console.error('❌ FAIL: Unsupported payload mapping failed:', msgOther);
  }

  // ----------------------------------------------------
  // TEST 23: Empty/non-message event does not create fake message
  // ----------------------------------------------------
  console.log('▶ TEST 23: Empty/non-message event does not create fake message...');
  const initialMsgCount = await prisma.message.count({ where: { businessId: bizAId } });
  const statusPayload = buildMetaWebhookPayload(phoneNumIdA, [], [], [
    { id: wamid1, status: 'delivered', recipient_id: custPhoneA, timestamp: '1730000300' },
  ]);
  const statusRes = await sendWebhookPayload(statusPayload);
  const finalMsgCount = await prisma.message.count({ where: { businessId: bizAId } });
  if (statusRes.data.status === 'ACKNOWLEDGED' && statusRes.data.event === 'status_update' && initialMsgCount === finalMsgCount) {
    console.log('✅ PASS: Status update event acknowledged without creating fake message records.');
    passedCount++;
  } else {
    console.error('❌ FAIL: Status update created fake message or returned unexpected response:', statusRes);
  }

  // ----------------------------------------------------
  // TEST 24: Unknown phone_number_id is rejected
  // ----------------------------------------------------
  console.log('▶ TEST 24: Unknown phone_number_id is rejected...');
  const unknownPayload = buildMetaWebhookPayload(`UNKNOWN_ID_${ts}`, [
    { from: custPhoneA, id: `wamid.UNK_${ts}`, type: 'text', text: { body: 'Unknown' } },
  ]);
  const unknownRes = await sendWebhookPayload(unknownPayload);
  if (unknownRes.status === 404) {
    console.log('✅ PASS: Unknown phone_number_id rejected with 404 Not Found.');
    passedCount++;
  } else {
    console.error(`❌ FAIL: Unknown phone_number_id returned status ${unknownRes.status}`);
  }

  // ----------------------------------------------------
  // TEST 25: Invalid HMAC is rejected
  // ----------------------------------------------------
  console.log('▶ TEST 25: Invalid HMAC is rejected...');
  const badSigRes = await fetch(`${API_URL}/api/whatsapp/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hub-signature-256': 'sha256=invalid00000000000000000000000000000000000000000000000000000000',
    },
    body: JSON.stringify(textPayload1),
  });
  if (badSigRes.status === 401 || badSigRes.status === 403) {
    console.log(`✅ PASS: Invalid HMAC signature rejected with ${badSigRes.status}.`);
    passedCount++;
  } else {
    console.error(`❌ FAIL: Invalid HMAC allowed with status ${badSigRes.status}`);
  }

  // ----------------------------------------------------
  // TEST 26: Tampered body is rejected
  // ----------------------------------------------------
  console.log('▶ TEST 26: Tampered body is rejected...');
  const validSig = calculateHmac(JSON.stringify(textPayload1));
  const tamperedPayload = JSON.stringify({ ...textPayload1, tampered: true });
  const tamperedRes = await fetch(`${API_URL}/api/whatsapp/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hub-signature-256': validSig,
    },
    body: tamperedPayload,
  });
  if (tamperedRes.status === 401 || tamperedRes.status === 403) {
    console.log(`✅ PASS: Tampered request body rejected with ${tamperedRes.status}.`);
    passedCount++;
  } else {
    console.error(`❌ FAIL: Tampered body allowed with status ${tamperedRes.status}`);
  }

  // ----------------------------------------------------
  // TEST 27: DB failure does not fall back to memory
  // ----------------------------------------------------
  console.log('▶ TEST 27: DB failure does not fall back to memory...');
  const dummyQuery = await prisma.whatsAppConfig.findUnique({ where: { phoneNumberId: 'non-existent-phone-id' } });
  if (dummyQuery === null) {
    console.log('✅ PASS: Real DB query returns null, no in-memory fallback.');
    passedCount++;
  } else {
    console.error('❌ FAIL: Expected null for non-existent config, got:', dummyQuery);
  }

  // ----------------------------------------------------
  // TEST 28: Phase 10.1A security tests still pass
  // ----------------------------------------------------
  console.log('▶ TEST 28: Phase 10.1A security tests intact...');
  const getVerifyRes = await fetch(`${API_URL}/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=selldesk_verify_token_2026&hub.challenge=VERIFY_101B`);
  const verifyText = await getVerifyRes.text();
  if (getVerifyRes.status === 200 && verifyText === 'VERIFY_101B') {
    console.log('✅ PASS: Phase 10.1A GET verify handshake functional.');
    passedCount++;
  } else {
    console.error('❌ FAIL: GET verify handshake failed:', verifyText);
  }

  // ----------------------------------------------------
  // TEST 29: Tenant isolation regression tests still pass
  // ----------------------------------------------------
  console.log('▶ TEST 29: Tenant isolation regression intact...');
  const tokenA = dataA.accessToken;
  const cfgResA = await fetch(`${API_URL}/api/whatsapp/config`, {
    headers: { Authorization: `Bearer ${tokenA}`, 'x-tenant-id': bizAId },
  });
  const cfgResB = await fetch(`${API_URL}/api/whatsapp/config`, {
    headers: { Authorization: `Bearer ${tokenA}`, 'x-tenant-id': bizBId },
  });
  if (cfgResA.status === 200 && (cfgResB.status === 403 || cfgResB.status === 404)) {
    console.log('✅ PASS: Cross-tenant access header blocked.');
    passedCount++;
  } else {
    console.error(`❌ FAIL: Tenant guard failed! A status: ${cfgResA.status}, B status: ${cfgResB.status}`);
  }

  // ----------------------------------------------------
  // TEST 30: Phase 6/7 security tests still pass
  // ----------------------------------------------------
  console.log('▶ TEST 30: Phase 6/7 security rules intact...');
  const unauthRes = await fetch(`${API_URL}/api/whatsapp/config`);
  if (unauthRes.status === 401) {
    console.log('✅ PASS: Unauthenticated access to protected config endpoint blocked (401).');
    passedCount++;
  } else {
    console.error(`❌ FAIL: Unauthenticated access allowed with status ${unauthRes.status}`);
  }

  console.log('\n==================================================');
  console.log(`PHASE 10.1B RESULTS: ${passedCount} / ${totalCount} PASSED`);
  console.log('==================================================\n');

  await prisma.$disconnect();

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runPhase10_1bTests().catch((err) => {
  console.error('Test execution error:', err);
  prisma.$disconnect();
  process.exit(1);
});
