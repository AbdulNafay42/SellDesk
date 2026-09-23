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
  console.log('=== SELLDESK PHASE 3C AUTOMATED TEST SUITE ===\n');

  // TEST 1 — Super Admin Login
  console.log('--- TEST 1: SUPER ADMIN LOGIN ---');
  const adminLogin = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'abdulnafay2005@gmail.com', password: 'password123' });

  const adminToken = adminLogin.body.accessToken;
  const adminRole = adminLogin.body.user?.platformRole;
  console.log(`Super Admin Login -> status: ${adminLogin.status} (Expected: 200) => ${adminLogin.status === 200 ? 'PASS' : 'FAIL'}`);
  console.log(`Platform Role: ${adminRole} (Expected: SUPER_ADMIN) => ${adminRole === 'SUPER_ADMIN' ? 'PASS' : 'FAIL'}\n`);

  // TEST 2 — Non-Super-Admin Cannot Access Admin Endpoint (403 Forbidden)
  console.log('--- TEST 2: NON-SUPER-ADMIN ACCESS ATTEMPT (403 FORBIDDEN) ---');
  const userLogin = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'kamran@khaadi.com.pk', password: 'password123' });

  const userToken = userLogin.body.accessToken;

  const forbiddenRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/admin/pending-businesses',
    method: 'GET',
    headers: { Authorization: `Bearer ${userToken}` },
  });
  console.log(`Normal user accessing /api/admin/pending-businesses -> status: ${forbiddenRes.status} (Expected: 403) => ${forbiddenRes.status === 403 ? 'PASS' : 'FAIL'}\n`);

  // TEST 3 — Unauthenticated Request (401 Unauthorized)
  console.log('--- TEST 3: UNAUTHENTICATED REQUEST (401 UNAUTHORIZED) ---');
  const unauthRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/admin/pending-businesses',
    method: 'GET',
  });
  console.log(`No JWT token accessing admin -> status: ${unauthRes.status} (Expected: 401) => ${unauthRes.status === 401 ? 'PASS' : 'FAIL'}\n`);

  // TEST 4 — Register Test Business & List Pending Businesses
  console.log('--- TEST 4: REGISTER & LIST PENDING BUSINESSES ---');
  const emailA = `pending.test.${Date.now()}@brand.com`;
  const regA = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    fullName: 'Test Owner A',
    email: emailA,
    password: 'Password123!',
    phone: '03009988776',
    businessName: 'Pending Store Alpha',
    city: 'Lahore'
  });

  const bizIdA = regA.body.business.id;
  console.log(`Registered pending store ID: ${bizIdA}`);

  const pendingList = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/admin/pending-businesses',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  const foundA = pendingList.body.businesses?.find((b) => b.id === bizIdA);
  console.log(`GET /api/admin/pending-businesses status: ${pendingList.status} (Expected: 200) => ${pendingList.status === 200 ? 'PASS' : 'FAIL'}`);
  console.log(`Created store found in pending list => ${foundA ? 'PASS' : 'FAIL'}\n`);

  // TEST 5 — Approve Business
  console.log('--- TEST 5: APPROVE PENDING BUSINESS ---');
  const approveRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/admin/businesses/${bizIdA}/approve`,
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  console.log(`Approve status: ${approveRes.status} (Expected: 200) => ${approveRes.status === 200 ? 'PASS' : 'FAIL'}`);
  console.log(`New Business Status: ${approveRes.body?.business?.status} (Expected: APPROVED) => ${approveRes.body?.business?.status === 'APPROVED' ? 'PASS' : 'FAIL'}`);
  console.log(`approvedAt timestamp populated => ${!!approveRes.body?.business?.approvedAt ? 'PASS' : 'FAIL'}\n`);

  // TEST 6 — Cannot Approve Already Processed Business (409 Conflict)
  console.log('--- TEST 6: RE-APPROVE ALREADY APPROVED BUSINESS (409 CONFLICT) ---');
  const reApprove = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/admin/businesses/${bizIdA}/approve`,
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  console.log(`Re-approve status: ${reApprove.status} (Expected: 409) => ${reApprove.status === 409 ? 'PASS' : 'FAIL'}\n`);

  // TEST 7 — Reject Business
  console.log('--- TEST 7: REJECT PENDING BUSINESS ---');
  const emailB = `pending.reject.${Date.now()}@brand.com`;
  const regB = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    fullName: 'Test Owner B',
    email: emailB,
    password: 'Password123!',
    businessName: 'Pending Store Beta',
  });

  const bizIdB = regB.body.business.id;

  const rejectRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/admin/businesses/${bizIdB}/reject`,
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
  }, { reason: 'Business tax registration could not be verified' });

  console.log(`Reject status: ${rejectRes.status} (Expected: 200) => ${rejectRes.status === 200 ? 'PASS' : 'FAIL'}`);
  console.log(`New Business Status: ${rejectRes.body?.business?.status} (Expected: REJECTED) => ${rejectRes.body?.business?.status === 'REJECTED' ? 'PASS' : 'FAIL'}`);
  console.log(`rejectionReason stored => ${rejectRes.body?.business?.rejectionReason === 'Business tax registration could not be verified' ? 'PASS' : 'FAIL'}\n`);

  // TEST 8 — Cannot Reject Already Processed Business (409 Conflict)
  console.log('--- TEST 8: RE-REJECT ALREADY REJECTED BUSINESS (409 CONFLICT) ---');
  const reReject = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/admin/businesses/${bizIdB}/reject`,
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
  }, { reason: 'Duplicate rejection attempt' });

  console.log(`Re-reject status: ${reReject.status} (Expected: 409) => ${reReject.status === 409 ? 'PASS' : 'FAIL'}\n`);

  console.log('=== ALL PHASE 3C TESTS COMPLETED SUCCESSFULLY ===');
}

runTests().catch(console.error);
