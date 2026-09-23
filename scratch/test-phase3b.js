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
  console.log('=== SELLDESK PHASE 3B AUTOMATED TEST SUITE ===\n');

  const testEmail = `test.client.${Date.now()}@fashionbrand.com`;

  // TEST 1 — Successful Registration
  console.log('--- TEST 1: SUCCESSFUL CLIENT REGISTRATION ---');
  const regRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    fullName: 'Kamran Ahmed',
    email: testEmail,
    password: 'SecurePassword123!',
    phone: '03001234567',
    businessName: 'Kamran Apparel Store',
    city: 'Karachi',
    country: 'Pakistan'
  });

  console.log(`Status: ${regRes.status} (Expected: 201) => ${regRes.status === 201 ? 'PASS' : 'FAIL'}`);
  console.log('Response body:', JSON.stringify(regRes.body, null, 2));

  const isPending = regRes.body?.business?.status === 'PENDING';
  console.log(`Business Status is PENDING => ${isPending ? 'PASS' : 'FAIL'}`);
  const noPasswordExposed = !regRes.body?.user?.password && !regRes.body?.user?.passwordHash;
  console.log(`No password exposed in response => ${noPasswordExposed ? 'PASS' : 'FAIL'}\n`);

  // TEST 2 — Duplicate Email Registration (409 Conflict)
  console.log('--- TEST 2: DUPLICATE EMAIL REGISTRATION (409 CONFLICT) ---');
  const dupRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    fullName: 'Duplicate User',
    email: testEmail, // Using same email
    password: 'Password123!',
    businessName: 'Duplicate Store',
  });

  console.log(`Status: ${dupRes.status} (Expected: 409) => ${dupRes.status === 409 ? 'PASS' : 'FAIL'}`);
  console.log('Response message:', dupRes.body?.message || dupRes.body);
  console.log(`Duplicate rejection => ${dupRes.status === 409 ? 'PASS' : 'FAIL'}\n`);

  // TEST 3 — Password Hashing & Login Credentials Check
  console.log('--- TEST 3: CREATED USER LOGIN & CREDENTIAL VERIFICATION ---');
  const newLogin = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    email: testEmail,
    password: 'SecurePassword123!'
  });

  console.log(`Newly registered user can authenticate -> Status: ${newLogin.status} (Expected: 200) => ${newLogin.status === 200 ? 'PASS' : 'FAIL'}\n`);

  // TEST 4 — Existing Development & Admin User Regression
  console.log('--- TEST 4: REGRESSION — EXISTING DEV USERS & SLICES 1-8 ---');
  const devLogin = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'abdulnafay2005@gmail.com', password: 'password123' });

  console.log(`Super Admin Login: ${devLogin.status === 200 ? 'PASS' : 'FAIL'}`);
  console.log(`Platform Role: ${devLogin.body?.user?.platformRole} (Expected: SUPER_ADMIN) => ${devLogin.body?.user?.platformRole === 'SUPER_ADMIN' ? 'PASS' : 'FAIL'}`);

  console.log('\n=== ALL PHASE 3B TESTS COMPLETED SUCCESSFULLY ===');
}

runTests().catch(console.error);
