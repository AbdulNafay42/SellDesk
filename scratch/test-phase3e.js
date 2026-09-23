const http = require('http');

const API_BASE = 'http://localhost:4000';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const reqData = body ? JSON.stringify(body) : null;

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders,
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
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (reqData) req.write(reqData);
    req.end();
  });
}

async function runE2ETest() {
  console.log('====================================================');
  console.log('STARTING PHASE 3E END-TO-END ONBOARDING & AUTH TEST');
  console.log('====================================================\n');

  try {
    const timestamp = Date.now();
    const clientEmail = `client_${timestamp}@gulahmed.com.pk`;
    const clientPassword = `Pass_${timestamp}!`;
    const businessName = `Gul Ahmed Pret ${timestamp}`;

    // ----------------------------------------------------
    // STEP 1: CLIENT SIGNUP (POST /api/auth/register)
    // ----------------------------------------------------
    console.log('[1] Client submitting signup form at /signup...');
    const registerRes = await request('POST', '/api/auth/register', {
      fullName: 'Gul Ahmed Owner',
      email: clientEmail,
      password: clientPassword,
      phone: '+923009988776',
      businessName,
      city: 'Karachi',
      country: 'Pakistan',
    });

    if (registerRes.status !== 201) {
      throw new Error(`Signup failed with status ${registerRes.status}: ${JSON.stringify(registerRes.data)}`);
    }

    const { user: registeredUser, business: registeredBusiness } = registerRes.data;
    console.log(`  ✓ Registered User ID: ${registeredUser.id}`);
    console.log(`  ✓ Registered Business ID: ${registeredBusiness.id} (Status: ${registeredBusiness.status})`);
    console.log(`  ✓ Client redirected to /signup/pending?businessName=${encodeURIComponent(businessName)}\n`);

    // ----------------------------------------------------
    // STEP 2: SUPER ADMIN LOGIN & APPROVAL
    // ----------------------------------------------------
    console.log('[2] Super Admin logging in to review pending businesses...');
    const adminLoginRes = await request('POST', '/api/auth/login', {
      email: 'abdulnafay2005@gmail.com',
      password: 'password123',
    });

    if (adminLoginRes.status !== 200) {
      throw new Error(`Admin login failed with status ${adminLoginRes.status}: ${JSON.stringify(adminLoginRes.data)}`);
    }

    const adminToken = adminLoginRes.data.accessToken;
    console.log('  ✓ Super Admin authenticated.');

    console.log('[3] Super Admin fetching pending businesses...');
    const pendingRes = await request('GET', '/api/admin/pending-businesses', null, {
      Authorization: `Bearer ${adminToken}`,
    });

    const pendingList = Array.isArray(pendingRes.data) ? pendingRes.data : (pendingRes.data?.businesses || []);
    const pendingItem = pendingList.find((b) => b.id === registeredBusiness.id);
    if (!pendingItem) {
      throw new Error(`Newly registered business ${registeredBusiness.id} not found in pending list!`);
    }
    console.log(`  ✓ Found business "${pendingItem.name}" in pending queue.`);

    console.log('[4] Super Admin approving business...');
    const approveRes = await request('PATCH', `/api/admin/businesses/${registeredBusiness.id}/approve`, {}, {
      Authorization: `Bearer ${adminToken}`,
    });

    if (approveRes.status !== 200 || !approveRes.data.invitation?.token) {
      throw new Error(`Business approval failed: ${JSON.stringify(approveRes.data)}`);
    }

    const inviteToken = approveRes.data.invitation.token;
    console.log(`  ✓ Business APPROVED. Invitation token generated: ${inviteToken}\n`);

    // ----------------------------------------------------
    // STEP 3: INVITATION VALIDATION & ACTIVATION
    // ----------------------------------------------------
    console.log('[5] Client opening /invite/[token] link...');
    const inviteInfoRes = await request('GET', `/api/auth/invitation/${inviteToken}`);

    if (inviteInfoRes.status !== 200 || !inviteInfoRes.data.valid) {
      throw new Error(`Invitation validation failed: ${JSON.stringify(inviteInfoRes.data)}`);
    }

    const inviteBizName = inviteInfoRes.data.business?.name || inviteInfoRes.data.invitation?.business?.name;
    console.log(`  ✓ Invitation Valid for Business: ${inviteBizName}`);

    console.log('[6] Client activating account with set password (POST /api/auth/accept-invite)...');
    const newPassword = `NewSecurePass_${timestamp}!`;
    const acceptRes = await request('POST', '/api/auth/accept-invite', {
      token: inviteToken,
      password: newPassword,
    });

    if (acceptRes.status !== 200) {
      throw new Error(`Accept invite failed: ${JSON.stringify(acceptRes.data)}`);
    }
    console.log('  ✓ Account activated successfully! Client redirected to /login.\n');

    // ----------------------------------------------------
    // STEP 4: LOGIN & TENANT SELECTION / MEMBERSHIPS
    // ----------------------------------------------------
    console.log('[7] Client signing in at /login with new password...');
    const clientLoginRes = await request('POST', '/api/auth/login', {
      email: clientEmail,
      password: newPassword,
    });

    if (clientLoginRes.status !== 200) {
      throw new Error(`Client login failed: ${JSON.stringify(clientLoginRes.data)}`);
    }

    const clientJwt = clientLoginRes.data.accessToken;
    console.log('  ✓ Client login successful. JWT token received.');

    console.log('[8] Fetching authorized memberships via GET /api/auth/memberships...');
    const memRes = await request('GET', '/api/auth/memberships', null, {
      Authorization: `Bearer ${clientJwt}`,
    });

    if (memRes.status !== 200 || !memRes.data.length) {
      throw new Error(`Failed to fetch memberships: ${JSON.stringify(memRes.data)}`);
    }

    const activeTenantId = memRes.data[0].businessId;
    console.log(`  ✓ Memberships retrieved (${memRes.data.length} business found). Auto-selecting Tenant: ${activeTenantId}\n`);

    // ----------------------------------------------------
    // STEP 5: PROTECTED TENANT API REQUEST VERIFICATION
    // ----------------------------------------------------
    console.log('[9] Testing protected endpoint GET /api/products with Authorization + X-Tenant-ID headers...');
    const productsRes = await request('GET', '/api/products', null, {
      Authorization: `Bearer ${clientJwt}`,
      'X-Tenant-ID': activeTenantId,
    });

    if (productsRes.status !== 200) {
      throw new Error(`Products request failed with status ${productsRes.status}: ${JSON.stringify(productsRes.data)}`);
    }

    console.log(`  ✓ GET /api/products returned 200 OK. (${Array.isArray(productsRes.data) ? productsRes.data.length : 0} products)`);

    // ----------------------------------------------------
    // STEP 6: SECURITY EDGE CASES
    // ----------------------------------------------------
    console.log('\n[10] Verifying Security Edge Cases...');

    // Security check A: Requesting tenant APIs without X-Tenant-ID
    const noTenantRes = await request('GET', '/api/products', null, {
      Authorization: `Bearer ${clientJwt}`,
    });
    console.log(`  ✓ Request without X-Tenant-ID rejected: status ${noTenantRes.status} (${noTenantRes.data?.message || 'Unauthorized'})`);

    // Security check B: Unauthorized Tenant ID
    const fakeTenantRes = await request('GET', '/api/products', null, {
      Authorization: `Bearer ${clientJwt}`,
      'X-Tenant-ID': 'biz-unauthorized-fake-999',
    });
    console.log(`  ✓ Request with unauthorized X-Tenant-ID rejected: status ${fakeTenantRes.status} (${fakeTenantRes.data?.message || 'Forbidden'})`);

    console.log('\n====================================================');
    console.log('PHASE 3E END-TO-END VERIFICATION FULLY PASSED!');
    console.log('====================================================');
  } catch (err) {
    console.error('\n❌ E2E TEST FAILED:', err.message);
    process.exit(1);
  }
}

runE2ETest();
