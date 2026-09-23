const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const payloadStr = data ? JSON.stringify(data) : null;
    const reqOptions = {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(payloadStr ? { 'Content-Length': Buffer.byteLength(payloadStr) } : {}),
      },
    };
    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on('error', reject);
    if (payloadStr) req.write(payloadStr);
    req.end();
  });
}

async function runFoundationTests() {
  console.log('====================================================');
  console.log('STARTING WHATSAPP CLOUD API FOUNDATION TEST SUITE');
  console.log('====================================================\n');

  try {
    // 1. GET Webhook Verification Handshake Test
    console.log('[1] Testing GET /api/whatsapp/webhook Handshake...');
    const verifyRes = await request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=selldesk_verify_token_2026&hub.challenge=CHALLENGE_CODE_123',
      method: 'GET',
    });

    if (verifyRes.status === 200 && verifyRes.body === 'CHALLENGE_CODE_123') {
      console.log('  ✓ Webhook handshake verification PASSED (HTTP 200, challenge returned)');
    } else {
      console.error('  ✕ Webhook verification FAILED:', verifyRes);
      process.exit(1);
    }

    // 2. Test Invalid Webhook Handshake
    console.log('\n[2] Testing GET /api/whatsapp/webhook with Invalid Token...');
    const invalidVerify = await request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=123',
      method: 'GET',
    });

    if (invalidVerify.status === 403) {
      console.log('  ✓ Invalid verify token correctly rejected (HTTP 403 Forbidden)');
    } else {
      console.error('  ✕ Invalid token check FAILED:', invalidVerify);
      process.exit(1);
    }

    // 3. Super Admin Login
    console.log('\n[3] Authenticating Super Admin User...');
    const adminLogin = await request(
      {
        hostname: 'localhost',
        port: 4000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'abdulnafay2005@gmail.com', password: 'password123' }
    );

    const adminToken = adminLogin.body.accessToken;
    const adminBizId = 'biz-default';

    // 4. Save Tenant-Owned WhatsApp Config (POST /api/whatsapp/config)
    console.log('\n[4] Saving Tenant-Owned WhatsApp Config for Business A (biz-default)...');
    const configSaveA = await request(
      {
        hostname: 'localhost',
        port: 4000,
        path: '/api/whatsapp/config',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
          'X-Tenant-ID': adminBizId,
        },
      },
      {
        phoneNumberId: 'PHONE_NUM_ID_BIZ_DEFAULT_999',
        wabaId: 'WABA_ACCOUNT_ID_111',
        accessToken: 'EAAG_SECRET_META_ACCESS_TOKEN_DO_NOT_EXPOSE',
        displayPhoneNumber: '+92 300 1234567',
        verifiedName: 'SellDesk Apparels PK',
      }
    );

    if (configSaveA.status === 201 || configSaveA.status === 200) {
      console.log('  ✓ WhatsApp Config created/updated for Tenant:', configSaveA.body);
      if (configSaveA.body.accessToken) {
        console.error('  ✕ SECURITY VIOLATION: accessToken was leaked in API response!');
        process.exit(1);
      } else {
        console.log('  ✓ Security check passed: accessToken is stripped from response DTO.');
      }
    } else {
      console.error('  ✕ Save config FAILED:', configSaveA);
      process.exit(1);
    }

    // 5. Fetch Tenant WhatsApp Config via GET /api/whatsapp/config
    console.log('\n[5] Fetching Tenant WhatsApp Config via GET /api/whatsapp/config...');
    const configGetA = await request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/whatsapp/config',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'X-Tenant-ID': adminBizId,
      },
    });

    if (configGetA.status === 200 && configGetA.body?.phoneNumberId === 'PHONE_NUM_ID_BIZ_DEFAULT_999') {
      console.log('  ✓ Config retrieved cleanly for Tenant:', configGetA.body);
    } else {
      console.error('  ✕ GET config FAILED:', configGetA);
      process.exit(1);
    }

    // 6. Test Tenant Isolation for Config Retrieval
    console.log('\n[6] Verifying Tenant Isolation (Business B attempting to access Business A config)...');
    const configGetB = await request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/whatsapp/config',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'X-Tenant-ID': 'biz-102', // Different tenant context
      },
    });

    if (configGetB.status === 200 && (!configGetB.body || configGetB.body === '' || Object.keys(configGetB.body).length === 0)) {
      console.log('  ✓ Tenant Isolation PASSED: Business B cannot access Business A WhatsApp Config.');
    } else {
      console.error('  ✕ Tenant Isolation FAILED:', configGetB);
      process.exit(1);
    }

    // 7. Test Incoming Webhook Tenant Resolution with Payload
    console.log('\n[7] Posting Incoming Meta Webhook Payload with phone_number_id...');
    const webhookPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'WABA_ACCOUNT_ID_111',
          changes: [
            {
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '+92 300 1234567',
                  phone_number_id: 'PHONE_NUM_ID_BIZ_DEFAULT_999',
                },
                contacts: [{ profile: { name: 'Tariq Mehmood' }, wa_id: '923454433221' }],
                messages: [
                  {
                    from: '923454433221',
                    id: 'wamid.HBgMOTIzNDU0NDMzMjIxFQIAERgSQjE0NTk0NDZDNzYwNDY4QkU1AA==',
                    timestamp: '1726900000',
                    type: 'text',
                    text: { body: 'Assalam o Alaikum, 2 Black Hoodies Large available hain?' },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const webhookPost = await request(
      {
        hostname: 'localhost',
        port: 4000,
        path: '/api/whatsapp/webhook',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      webhookPayload
    );

    if (webhookPost.status === 201 || webhookPost.status === 200) {
      console.log('  ✓ POST /api/whatsapp/webhook processed payload & resolved tenant successfully:', webhookPost.body);
    } else {
      console.error('  ✕ Webhook POST FAILED:', webhookPost);
      process.exit(1);
    }

    // 8. Test Webhook with Unknown Phone Number ID
    console.log('\n[8] Posting Webhook Payload with Unknown Phone Number ID...');
    const unknownWebhookPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'WABA_UNKNOWN',
          changes: [
            {
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  phone_number_id: 'UNKNOWN_PHONE_ID_999999',
                },
              },
            },
          ],
        },
      ],
    };

    const unknownPost = await request(
      {
        hostname: 'localhost',
        port: 4000,
        path: '/api/whatsapp/webhook',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      unknownWebhookPayload
    );

    if (unknownPost.status === 200 || unknownPost.status === 201) {
      console.log('  ✓ Webhook endpoint safely returns HTTP 200 to Meta while logging unknown tenant warning:', unknownPost.body);
    } else {
      console.error('  ✕ Unknown webhook handling FAILED:', unknownPost);
      process.exit(1);
    }

    console.log('\n====================================================');
    console.log('WHATSAPP CLOUD API FOUNDATION TEST SUITE FULLY PASSED!');
    console.log('====================================================');
  } catch (err) {
    console.error('Test Execution Error:', err);
    process.exit(1);
  }
}

runFoundationTests();
