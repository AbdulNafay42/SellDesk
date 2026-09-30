require('dotenv').config({ path: 'apps/api/.env' });
const http = require('http');

function request(method, path, body = null, token = null, tenantId = null) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (tenantId) headers['X-Tenant-ID'] = tenantId;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 4000,
        path,
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
          resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, data: parsed });
        });
      }
    );

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runPhase1Tests() {
  console.log('====================================================');
  console.log('SELLDESK - PHASE 1 DATABASE-DRIVEN TENANT SUITE');
  console.log('====================================================\n');

  try {
    const timestamp = Date.now();

    // 1. REGISTER BUSINESS A & USER A
    console.log('[1/8] Registering User A & Business A (Pending)...');
    const emailA = `userA_phase1_${timestamp}@test.com`;
    const passwordA = 'Password123!';
    const regA = await request('post', '/api/auth/register', {
      email: emailA,
      password: passwordA,
      fullName: 'User Alpha',
      businessName: `Business Alpha ${timestamp}`,
      phone: '03001112233',
      city: 'Lahore',
      country: 'Pakistan',
    });

    if (!regA.ok) throw new Error(`Registration A failed: ${JSON.stringify(regA.data)}`);
    const bizIdA = regA.data.business.id;
    console.log(`✓ User A registered. Biz A ID: ${bizIdA}, Status: ${regA.data.business.status}`);

    // 2. SUPER ADMIN APPROVAL
    console.log('\n[2/8] Super Admin approving Business A...');
    const adminLogin = await request('post', '/api/auth/login', {
      email: 'abdulnafay2005@gmail.com',
      password: 'password123',
    });
    if (!adminLogin.ok) throw new Error(`Admin login failed: ${JSON.stringify(adminLogin.data)}`);
    const adminToken = adminLogin.data.accessToken;

    const approveA = await request('patch', `/api/admin/businesses/${bizIdA}/approve`, null, adminToken);
    if (!approveA.ok) throw new Error(`Approval A failed: ${JSON.stringify(approveA.data)}`);
    console.log('✓ Business A approved successfully in PostgreSQL.');

    // 3. LOGIN USER A & VERIFY EMPTY START
    console.log('\n[3/8] Logging in User A & checking empty business state...');
    const loginA = await request('post', '/api/auth/login', { email: emailA, password: passwordA });
    if (!loginA.ok) throw new Error(`Login A failed: ${JSON.stringify(loginA.data)}`);
    const tokenA = loginA.data.accessToken;

    const prodsAEmpty = await request('get', '/api/products', null, tokenA, bizIdA);
    const custsAEmpty = await request('get', '/api/customers', null, tokenA, bizIdA);
    const ordersAEmpty = await request('get', '/api/orders', null, tokenA, bizIdA);
    const metricsAEmpty = await request('get', '/api/analytics/metrics', null, tokenA, bizIdA);

    console.log(`  - Products count: ${prodsAEmpty.data.length}`);
    console.log(`  - Customers count: ${custsAEmpty.data.length}`);
    console.log(`  - Orders count: ${ordersAEmpty.data.length}`);
    console.log(`  - Revenue: Rs ${metricsAEmpty.data.grossRevenuePKR}, Orders: ${metricsAEmpty.data.totalOrdersCount}`);

    if (
      prodsAEmpty.data.length === 0 &&
      custsAEmpty.data.length === 0 &&
      ordersAEmpty.data.length === 0 &&
      metricsAEmpty.data.totalOrdersCount === 0
    ) {
      console.log('✓ Verified: Business A starts 100% EMPTY (no mock/demo data fallback!).');
    } else {
      throw new Error('Business A contains mock/demo fallback data!');
    }

    // 4. CREATE RECORDS FOR BUSINESS A
    console.log('\n[4/8] Creating Product A, Customer A, Order A in PostgreSQL...');
    const prodA = await request('post', '/api/products', { name: 'Alpha Denim Shirt', sku: `SKU-A-${timestamp}`, basePrice: 4500 }, tokenA, bizIdA);
    const custA = await request('post', '/api/customers', { fullName: 'Alpha Customer', phoneNumber: '03001111111', city: 'Lahore' }, tokenA, bizIdA);
    const orderA = await request('post', '/api/orders', { customerName: 'Alpha Customer', customerPhone: '03001111111', productName: 'Alpha Denim Shirt', totalAmount: 4500, paymentMethod: 'COD' }, tokenA, bizIdA);

    console.log(`✓ Product A created ID: ${prodA.data.id}`);
    console.log(`✓ Customer A created ID: ${custA.data.id}`);
    console.log(`✓ Order A created ID: ${orderA.data.id}`);

    // 5. REGISTER & APPROVE BUSINESS B + CREATE RECORDS FOR B
    console.log('\n[5/8] Registering & Approving Business B...');
    const emailB = `userB_phase1_${timestamp}@test.com`;
    const passwordB = 'Password123!';
    const regB = await request('post', '/api/auth/register', {
      email: emailB,
      password: passwordB,
      fullName: 'User Beta',
      businessName: `Business Beta ${timestamp}`,
      phone: '03002223344',
      city: 'Karachi',
      country: 'Pakistan',
    });
    const bizIdB = regB.data.business.id;

    await request('patch', `/api/admin/businesses/${bizIdB}/approve`, null, adminToken);
    const loginB = await request('post', '/api/auth/login', { email: emailB, password: passwordB });
    const tokenB = loginB.data.accessToken;

    const prodB = await request('post', '/api/products', { name: 'Beta Silk Scarf', sku: `SKU-B-${timestamp}`, basePrice: 2800 }, tokenB, bizIdB);
    const custB = await request('post', '/api/customers', { fullName: 'Beta Customer', phoneNumber: '03002222222', city: 'Karachi' }, tokenB, bizIdB);
    const orderB = await request('post', '/api/orders', { customerName: 'Beta Customer', customerPhone: '03002222222', productName: 'Beta Silk Scarf', totalAmount: 2800, paymentMethod: 'COD' }, tokenB, bizIdB);

    console.log(`✓ Business B ready. Order B ID: ${orderB.data.id}`);

    // 6. VERIFY TWO-TENANT ISOLATION (USER A VS USER B)
    console.log('\n[6/8] Testing Two-Tenant Isolation (User A vs User B)...');
    const prodsA = await request('get', '/api/products', null, tokenA, bizIdA);
    const custsA = await request('get', '/api/customers', null, tokenA, bizIdA);
    const ordersA = await request('get', '/api/orders', null, tokenA, bizIdA);
    const metricsA = await request('get', '/api/analytics/metrics', null, tokenA, bizIdA);

    const prodsB = await request('get', '/api/products', null, tokenB, bizIdB);
    const custsB = await request('get', '/api/customers', null, tokenB, bizIdB);
    const ordersB = await request('get', '/api/orders', null, tokenB, bizIdB);
    const metricsB = await request('get', '/api/analytics/metrics', null, tokenB, bizIdB);

    console.log(`  - User A: ${prodsA.data.length} products, ${custsA.data.length} customers, ${ordersA.data.length} orders. Revenue: Rs ${metricsA.data.grossRevenuePKR}`);
    console.log(`  - User B: ${prodsB.data.length} products, ${custsB.data.length} customers, ${ordersB.data.length} orders. Revenue: Rs ${metricsB.data.grossRevenuePKR}`);

    const leakAHasB = prodsA.data.some((p) => p.id === prodB.data.id) || ordersA.data.some((o) => o.id === orderB.data.id);
    const leakBHasA = prodsB.data.some((p) => p.id === prodA.data.id) || ordersB.data.some((o) => o.id === orderA.data.id);

    if (!leakAHasB && !leakBHasA) {
      console.log('✓ Verified: Complete database data isolation between Business A and Business B!');
    } else {
      throw new Error('Data leak detected between tenants!');
    }

    // 7. CROSS-TENANT ATTACK (USER A ATTEMPTING X-Tenant-ID: BUSINESS B)
    console.log('\n[7/8] Testing Cross-Tenant Header Attack (User A attempting X-Tenant-ID: Business B)...');
    const attackRes = await request('get', '/api/products', null, tokenA, bizIdB);
    if (attackRes.status === 403) {
      console.log('✓ Verified: User A attempting X-Tenant-ID: Business B blocked with HTTP 403 Forbidden!');
    } else {
      throw new Error(`Cross-tenant header attack returned status ${attackRes.status} instead of 403!`);
    }

    // 8. DIRECT OBJECT ACCESS ATTACK (USER A ATTEMPTING UPDATE ORDER B)
    console.log('\n[8/8] Testing Direct Object Access (User A updating Order B status)...');
    const patchOrderB = await request('patch', `/api/orders/${orderB.data.id}/status`, { status: 'DELIVERED' }, tokenA, bizIdA);
    if (patchOrderB.status === 404) {
      console.log('✓ Verified: User A modifying Order B blocked with HTTP 404 Not Found!');
    } else {
      throw new Error(`Direct object access attack returned status ${patchOrderB.status} instead of 404!`);
    }

    console.log('\n====================================================');
    console.log('🎉 ALL PHASE 1 DATABASE-DRIVEN TENANT TESTS PASSED!');
    console.log('====================================================');
  } catch (err) {
    console.error('\n❌ PHASE 1 TEST SUITE FAILED:', err.message);
    process.exit(1);
  }
}

runPhase1Tests();
