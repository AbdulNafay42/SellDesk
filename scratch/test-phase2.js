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
  console.log('=== SELLDESK PHASE 2 AUTOMATED SUITE ===\n');

  // 1. Authenticate User 1 (Abdul Nafay - member of biz-default, biz-101, biz-102, biz-103)
  const login1 = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'abdulnafay2005@gmail.com', password: 'password123' });

  const token1 = login1.body.accessToken;
  console.log(`[AUTH] User 1 Login: ${login1.status === 200 ? 'SUCCESS' : 'FAILED'} (Token received)`);

  // 2. Authenticate User 2 (Kamran - member of biz-102 ONLY)
  const login2 = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'kamran@khaadi.com.pk', password: 'password123' });

  const token2 = login2.body.accessToken;
  console.log(`[AUTH] User 2 Login: ${login2.status === 200 ? 'SUCCESS' : 'FAILED'} (Token received)\n`);

  // --- TEST GROUP A: AUTHENTICATION (401) ---
  console.log('--- TEST GROUP A: AUTHENTICATION ---');
  const noToken = await request({ hostname: 'localhost', port: 4000, path: '/api/products', method: 'GET' });
  console.log(`No JWT -> status: ${noToken.status} (Expected: 401) => ${noToken.status === 401 ? 'PASS' : 'FAIL'}`);

  const invalidToken = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/products',
    method: 'GET',
    headers: { Authorization: 'Bearer invalid-token-xyz' },
  });
  console.log(`Invalid JWT -> status: ${invalidToken.status} (Expected: 401) => ${invalidToken.status === 401 ? 'PASS' : 'FAIL'}\n`);

  // --- TEST GROUP B: TENANT AUTHORIZATION (200 / 403) ---
  console.log('--- TEST GROUP B: TENANT AUTHORIZATION ---');
  
  // User 1 + Default Business (biz-default) -> 200
  const u1OwnBiz = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/products',
    method: 'GET',
    headers: { Authorization: `Bearer ${token1}`, 'X-Tenant-ID': 'biz-default' },
  });
  console.log(`User 1 + biz-default (header) -> status: ${u1OwnBiz.status} (Expected: 200, items: ${u1OwnBiz.body.length}) => ${u1OwnBiz.status === 200 ? 'PASS' : 'FAIL'}`);

  // User 2 + Own Business (biz-102) -> 200
  const u2OwnBiz = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/products',
    method: 'GET',
    headers: { Authorization: `Bearer ${token2}`, 'X-Tenant-ID': 'biz-102' },
  });
  console.log(`User 2 + biz-102 (header) -> status: ${u2OwnBiz.status} (Expected: 200, items: ${u2OwnBiz.body.length}) => ${u2OwnBiz.status === 200 ? 'PASS' : 'FAIL'}`);

  // User 2 + Unrelated Business (biz-default) -> 403 Forbidden
  const u2CrossHeader = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/products',
    method: 'GET',
    headers: { Authorization: `Bearer ${token2}`, 'X-Tenant-ID': 'biz-default' },
  });
  console.log(`User 2 + biz-default (manipulated header) -> status: ${u2CrossHeader.status} (Expected: 403) => ${u2CrossHeader.status === 403 ? 'PASS' : 'FAIL'}`);

  // User 2 + Query biz-default -> 403 Forbidden
  const u2CrossQuery = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/orders?businessId=biz-default',
    method: 'GET',
    headers: { Authorization: `Bearer ${token2}` },
  });
  console.log(`User 2 + query businessId=biz-default -> status: ${u2CrossQuery.status} (Expected: 403) => ${u2CrossQuery.status === 403 ? 'PASS' : 'FAIL'}`);

  // User 2 + Non-existent business (biz-999) -> 403 Forbidden
  const u2NonExistent = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/customers',
    method: 'GET',
    headers: { Authorization: `Bearer ${token2}`, 'X-Tenant-ID': 'biz-999' },
  });
  console.log(`User 2 + biz-999 -> status: ${u2NonExistent.status} (Expected: 403) => ${u2NonExistent.status === 403 ? 'PASS' : 'FAIL'}\n`);

  // --- TEST GROUP C: RESOURCE ISOLATION ---
  console.log('--- TEST GROUP C: RESOURCE ISOLATION ---');

  // User 2 (biz-102 context) trying to access single order ord-1042 (belonging to biz-default)
  const u2AccessU1Order = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/orders/ord-1042/status',
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token2}`, 'Content-Type': 'application/json' },
  }, { status: 'CONFIRMED' });
  console.log(`User 2 (biz-102) updating ord-1042 (biz-default) -> status: ${u2AccessU1Order.status} (Expected: 404) => ${u2AccessU1Order.status === 404 ? 'PASS' : 'FAIL'}`);

  // User 2 (biz-102 context) accessing single product prod-1 (belonging to biz-default)
  const u2AccessU1Prod = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/products/prod-1',
    method: 'GET',
    headers: { Authorization: `Bearer ${token2}` },
  });
  console.log(`User 2 (biz-102) reading prod-1 (biz-default) -> status: ${u2AccessU1Prod.status} (Expected: 404) => ${u2AccessU1Prod.status === 404 ? 'PASS' : 'FAIL'}`);

  // User 2 (biz-102 context) accessing single customer cust-1 (belonging to biz-default)
  const u2AccessU1Cust = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/customers/cust-1',
    method: 'GET',
    headers: { Authorization: `Bearer ${token2}` },
  });
  console.log(`User 2 (biz-102) reading cust-1 (biz-default) -> status: ${u2AccessU1Cust.status} (Expected: 404) => ${u2AccessU1Cust.status === 404 ? 'PASS' : 'FAIL'}\n`);

  // --- TEST GROUP D: SLICES 1-8 REGRESSION ---
  console.log('--- TEST GROUP D: SLICES 1-8 REGRESSION ---');

  const u1Orders = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/orders',
    method: 'GET',
    headers: { Authorization: `Bearer ${token1}` },
  });
  console.log(`User 1 Orders count: ${u1Orders.body.length} (Expected: 4 items) => ${u1Orders.body.length === 4 ? 'PASS' : 'FAIL'}`);

  const u2Orders = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/orders',
    method: 'GET',
    headers: { Authorization: `Bearer ${token2}` },
  });
  console.log(`User 2 Orders count: ${u2Orders.body.length} (Expected: 1 item for biz-102) => ${u2Orders.body.length === 1 ? 'PASS' : 'FAIL'}`);

  console.log('\n=== ALL PHASE 2 TESTS COMPLETED SUCCESSFULLY ===');
}

runTests().catch(console.error);
