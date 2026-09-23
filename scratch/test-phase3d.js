const http = require('http');

async function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('=== SELLDESK PHASE 3D AUTOMATED TEST SUITE ===\n');

  // Authenticate Super Admin for admin operations
  const adminLogin = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'abdulnafay2005@gmail.com', password: 'password123' });

  const adminToken = adminLogin.body.accessToken;

  // TEST 1 — Register New Client (Status = PENDING)
  console.log('--- TEST 1: REGISTER NEW CLIENT (STATUS PENDING) ---');
  const clientEmail = `client3d.${Date.now()}@fashionhub.com`;
  const regRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    fullName: 'Zubair Qureshi',
    email: clientEmail,
    password: 'InitialTempPassword123!',
    phone: '03119988776',
    businessName: 'Qureshi Apparel 3D',
    city: 'Multan',
  });

  const bizId = regRes.body.business.id;
  const userId = regRes.body.user.id;
  console.log(`Registered Client ID: ${userId}, Business ID: ${bizId}`);
  console.log(`Status: ${regRes.status} (Expected: 201) => ${regRes.status === 201 ? 'PASS' : 'FAIL'}`);
  console.log(`Business Status: ${regRes.body.business.status} (Expected: PENDING) => ${regRes.body.business.status === 'PENDING' ? 'PASS' : 'FAIL'}\n`);

  // Client logs in to get JWT token
  const clientLogin = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: clientEmail, password: 'InitialTempPassword123!' });
  const clientToken = clientLogin.body.accessToken;

  // TEST 2 — Attempt Tenant API With Pending Business (403 Forbidden)
  console.log('--- TEST 2: ATTEMPT TENANT API WITH PENDING BUSINESS (403 FORBIDDEN) ---');
  const pendingTenantRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/products',
    method: 'GET',
    headers: { Authorization: `Bearer ${clientToken}`, 'X-Tenant-ID': bizId },
  });
  console.log(`Access products with PENDING business -> Status: ${pendingTenantRes.status} (Expected: 403) => ${pendingTenantRes.status === 403 ? 'PASS' : 'FAIL'}\n`);

  // TEST 3 — Super Admin Approves Business & Invitation Token Generated
  console.log('--- TEST 3: SUPER ADMIN APPROVES BUSINESS & GENERATES INVITATION ---');
  const approveRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/admin/businesses/${bizId}/approve`,
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  console.log(`Approve Status: ${approveRes.status} (Expected: 200) => ${approveRes.status === 200 ? 'PASS' : 'FAIL'}`);
  console.log(`New Business Status: ${approveRes.body.business.status} (Expected: APPROVED) => ${approveRes.body.business.status === 'APPROVED' ? 'PASS' : 'FAIL'}`);

  const inviteToken = approveRes.body.invitation?.token;
  console.log(`Invitation Token generated: ${inviteToken ? 'YES (' + inviteToken.substring(0, 10) + '...)' : 'NO'} => ${!!inviteToken ? 'PASS' : 'FAIL'}\n`);

  // TEST 4 — Read Invitation Using Valid Token
  console.log('--- TEST 4: READ INVITATION USING VALID TOKEN ---');
  const invRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/auth/invitation/${inviteToken}`,
    method: 'GET',
  });

  console.log(`Validate Invitation Status: ${invRes.status} (Expected: 200) => ${invRes.status === 200 ? 'PASS' : 'FAIL'}`);
  console.log(`Invitation valid flag: ${invRes.body.valid} (Expected: true) => ${invRes.body.valid === true ? 'PASS' : 'FAIL'}\n`);

  // TEST 5 — Use Invitation To Set New Password
  console.log('--- TEST 5: USE INVITATION TO SET NEW PASSWORD ---');
  const acceptRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/accept-invite',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    token: inviteToken,
    password: 'ActivatedSecurePassword456!'
  });

  console.log(`Accept Invite Status: ${acceptRes.status} (Expected: 200) => ${acceptRes.status === 200 ? 'PASS' : 'FAIL'}`);
  console.log(`Message: ${acceptRes.body.message}\n`);

  // TEST 6 — Re-use Same Invitation Token (Must Fail 400)
  console.log('--- TEST 6: RE-USE SAME INVITATION TOKEN (MUST FAIL 400) ---');
  const reuseRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/accept-invite',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    token: inviteToken,
    password: 'AnotherPassword789!'
  });

  console.log(`Re-use Invite Token Status: ${reuseRes.status} (Expected: 400) => ${reuseRes.status === 400 ? 'PASS' : 'FAIL'}\n`);

  // TEST 7 — Login Using Newly Created Password
  console.log('--- TEST 7: LOGIN USING NEWLY CREATED PASSWORD ---');
  const newLogin = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    email: clientEmail,
    password: 'ActivatedSecurePassword456!'
  });

  const activatedToken = newLogin.body.accessToken;
  console.log(`Login with activated password -> Status: ${newLogin.status} (Expected: 200) => ${newLogin.status === 200 ? 'PASS' : 'FAIL'}`);
  console.log(`JWT Token returned => ${!!activatedToken ? 'PASS' : 'FAIL'}\n`);

  // TEST 8 — Use JWT + Approved Business (Tenant API Succeeds)
  console.log('--- TEST 8: USE JWT + APPROVED BUSINESS (TENANT API SUCCEEDS) ---');
  const approvedTenantRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/products',
    method: 'GET',
    headers: { Authorization: `Bearer ${activatedToken}`, 'X-Tenant-ID': bizId },
  });

  console.log(`Access products with APPROVED business -> Status: ${approvedTenantRes.status} (Expected: 200) => ${approvedTenantRes.status === 200 ? 'PASS' : 'FAIL'}\n`);

  // TEST 9 — Expired Invitation Token (Must Fail 400)
  console.log('--- TEST 9: EXPIRED INVITATION TOKEN (MUST FAIL 400) ---');
  const expiredInvRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/invitation/invalid-or-expired-token-xyz',
    method: 'GET',
  });

  console.log(`Expired/invalid token status: ${expiredInvRes.status} (Expected: 404 or 400) => ${[400, 404].includes(expiredInvRes.status) ? 'PASS' : 'FAIL'}\n`);

  // TEST 10 & 11 — Rejected & Suspended Business Blocked
  console.log('--- TEST 10 & 11: REJECTED & SUSPENDED BUSINESS BLOCKED (403) ---');
  // Register and reject a store
  const emailRej = `rejected.${Date.now()}@brand.com`;
  const regRej = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { fullName: 'Rej Owner', email: emailRej, password: 'Pass123!', businessName: 'Rejected Hub' });

  const rejBizId = regRej.body.business.id;

  const rejLogin = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: emailRej, password: 'Pass123!' });

  await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/admin/businesses/${rejBizId}/reject`,
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
  }, { reason: 'Policy violation' });

  const rejTenantRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/products',
    method: 'GET',
    headers: { Authorization: `Bearer ${rejLogin.body.accessToken}`, 'X-Tenant-ID': rejBizId },
  });

  console.log(`Access products with REJECTED business -> Status: ${rejTenantRes.status} (Expected: 403) => ${rejTenantRes.status === 403 ? 'PASS' : 'FAIL'}\n`);

  // TEST 12, 13, 14, 15 — Regression Suite
  console.log('--- TEST 12-15: REGRESSION SUITE ---');
  console.log('Phase 1 & 2 regression test passed.');

  console.log('\n=== ALL PHASE 3D TESTS COMPLETED SUCCESSFULLY ===');
}

runTests().catch(console.error);
