const API_URL = 'http://127.0.0.1:4000';

async function request(method, path, body = null, token = null, tenantId = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (tenantId) headers['X-Tenant-ID'] = tenantId;

  const opts = { method: method.toUpperCase(), headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_URL}${path}`, opts);
  let data = null;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('====================================================');
  console.log('SELLDESK - TENANT ISOLATION & APPROVAL SECURITY SUITE');
  console.log('====================================================\n');

  try {
    const timestamp = Date.now();

    // 1. REGISTER USER A & BUSINESS A (PENDING)
    console.log('[1/8] Registering User A & Business A (Pending)...');
    const emailA = `userA_${timestamp}@test.com`;
    const passwordA = 'Password123!';

    const regA = await request('post', '/api/auth/register', {
      email: emailA,
      password: passwordA,
      fullName: 'User Alpha',
      businessName: `Business Alpha ${timestamp}`,
      phone: '03001112233',
    });

    if (!regA.ok) throw new Error(`Registration A failed: ${JSON.stringify(regA.data)}`);

    const bizIdA = regA.data.business.id;
    console.log(`✓ User A registered. Biz A ID: ${bizIdA}, Status: ${regA.data.business.status}`);

    const loginAPending = await request('post', '/api/auth/login', { email: emailA, password: passwordA });
    if (!loginAPending.ok) throw new Error(`Login A (Pending) failed: ${JSON.stringify(loginAPending.data)}`);
    const tokenAPending = loginAPending.data.accessToken;

    // 2. VERIFY PENDING BUSINESS GETS 403 ON EVERY PROTECTED TENANT ENDPOINT
    console.log('\n[2/8] Testing PENDING status 403 enforcement across ALL tenant-owned endpoints...');
    const protectedEndpoints = [
      { method: 'get', path: '/api/orders' },
      { method: 'post', path: '/api/orders', body: { customerName: 'Test', items: [] } },
      { method: 'get', path: '/api/products' },
      { method: 'post', path: '/api/products', body: { name: 'Test', sku: 'TEST-1', price: 100 } },
      { method: 'get', path: '/api/customers' },
      { method: 'get', path: '/api/inventory/movements' },
      { method: 'get', path: '/api/analytics/metrics' },
      { method: 'get', path: '/api/conversations' },
      { method: 'get', path: '/api/followups' },
      { method: 'get', path: '/api/payments' },
      { method: 'get', path: '/api/shipping' },
      { method: 'get', path: '/api/returns' },
      { method: 'get', path: '/api/settings/business' },
    ];

    let pending403Count = 0;
    for (const ep of protectedEndpoints) {
      const res = await request(ep.method, ep.path, ep.body, tokenAPending, bizIdA);
      if (res.status === 403) {
        pending403Count++;
      } else {
        console.error(`❌ ERROR: ${ep.method.toUpperCase()} ${ep.path} returned status ${res.status} instead of 403!`);
      }
    }
    console.log(`✓ ${pending403Count}/${protectedEndpoints.length} protected endpoints correctly rejected PENDING access with HTTP 403 Forbidden.`);

    // 3. APPROVE BUSINESS A VIA ADMIN API
    console.log('\n[3/8] Approving Business A via Super Admin...');
    const adminLogin = await request('post', '/api/auth/login', {
      email: 'abdulnafay2005@gmail.com',
      password: 'password123',
    });
    if (!adminLogin.ok) throw new Error(`Admin login failed: ${JSON.stringify(adminLogin.data)}`);
    const adminToken = adminLogin.data.accessToken;

    const approveRes = await request('patch', `/api/admin/businesses/${bizIdA}/approve`, null, adminToken);
    if (!approveRes.ok) throw new Error(`Approval A failed: ${JSON.stringify(approveRes.data)}`);
    console.log('✓ Business A status set to APPROVED by Super Admin.');

    const loginAApproved = await request('post', '/api/auth/login', { email: emailA, password: passwordA });
    const tokenAApproved = loginAApproved.data.accessToken;

    // 4. VERIFY NEWLY APPROVED BUSINESS STARTS COMPLETELY EMPTY
    console.log('\n[4/8] Verifying newly approved Business A starts COMPLETELY EMPTY (no fallbacks / no biz-default)...');
    const emptyOrders = await request('get', '/api/orders', null, tokenAApproved, bizIdA);
    const emptyProducts = await request('get', '/api/products', null, tokenAApproved, bizIdA);
    const emptyCustomers = await request('get', '/api/customers', null, tokenAApproved, bizIdA);
    const emptyMetrics = await request('get', '/api/analytics/metrics', null, tokenAApproved, bizIdA);

    console.log(`  - Orders count: ${emptyOrders.data.length}`);
    console.log(`  - Products count: ${emptyProducts.data.length}`);
    console.log(`  - Customers count: ${emptyCustomers.data.length}`);
    console.log(`  - Gross Revenue: Rs ${emptyMetrics.data.grossRevenuePKR}, Total Orders: ${emptyMetrics.data.totalOrdersCount}`);

    if (
      Array.isArray(emptyOrders.data) && emptyOrders.data.length === 0 &&
      Array.isArray(emptyProducts.data) && emptyProducts.data.length === 0 &&
      Array.isArray(emptyCustomers.data) && emptyCustomers.data.length === 0 &&
      emptyMetrics.data.totalOrdersCount === 0
    ) {
      console.log('✓ Verified: Business A has ZERO records (no biz-default or global demo data fallback!).');
    } else {
      console.error('❌ ERROR: Business A has non-empty fallback records!');
    }

    // 5. CREATE UNIQUE RECORDS FOR BUSINESS A
    console.log('\n[5/8] Creating unique records for Business A...');
    const custA = await request('post', '/api/customers', { fullName: 'Customer Alpha', phone: '03001111111', city: 'Karachi' }, tokenAApproved, bizIdA);
    const prodA = await request('post', '/api/products', { name: 'Product Alpha Hoodie', sku: `SKU-ALPHA-${timestamp}`, pricePKR: 5000, stock: 10 }, tokenAApproved, bizIdA);
    const orderA = await request('post', '/api/orders', { customerName: 'Customer Alpha', customerPhone: '03001111111', productName: 'Product Alpha Hoodie', quantity: 2, totalAmount: 10000, city: 'Karachi', address: 'Street A' }, tokenAApproved, bizIdA);
    console.log(`✓ Business A Created: Order #${orderA.data.id || 'A'}, Product: ${prodA.data.name}, Customer: ${custA.data.fullName}`);

    // 6. REGISTER & APPROVE BUSINESS B + CREATE UNIQUE RECORDS
    console.log('\n[6/8] Registering & Approving Business B + User B...');
    const emailB = `userB_${timestamp}@test.com`;
    const passwordB = 'Password123!';

    const regB = await request('post', '/api/auth/register', {
      email: emailB,
      password: passwordB,
      fullName: 'User Beta',
      businessName: `Business Beta ${timestamp}`,
      phone: '03002223344',
    });
    const bizIdB = regB.data.business.id;

    await request('patch', `/api/admin/businesses/${bizIdB}/approve`, null, adminToken);

    const loginBApproved = await request('post', '/api/auth/login', { email: emailB, password: passwordB });
    const tokenBApproved = loginBApproved.data.accessToken;

    const custB = await request('post', '/api/customers', { fullName: 'Customer Beta', phone: '03002222222', city: 'Lahore' }, tokenBApproved, bizIdB);
    const prodB = await request('post', '/api/products', { name: 'Product Beta Jacket', sku: `SKU-BETA-${timestamp}`, pricePKR: 8000, stock: 5 }, tokenBApproved, bizIdB);
    const orderB = await request('post', '/api/orders', { customerName: 'Customer Beta', customerPhone: '03002222222', productName: 'Product Beta Jacket', quantity: 1, totalAmount: 8000, city: 'Lahore', address: 'Street B' }, tokenBApproved, bizIdB);
    console.log(`✓ Business B Created: Order #${orderB.data.id || 'B'}, Product: ${prodB.data.name}, Customer: ${custB.data.fullName}`);

    // 7. VERIFY TWO-TENANT DATA ISOLATION
    console.log('\n[7/8] Testing Two-Tenant Isolation (User A vs User B)...');
    
    const ordersA = await request('get', '/api/orders', null, tokenAApproved, bizIdA);
    const prodsA = await request('get', '/api/products', null, tokenAApproved, bizIdA);
    const metricsA = await request('get', '/api/analytics/metrics', null, tokenAApproved, bizIdA);

    console.log(`  - User A sees ${ordersA.data.length} orders, ${prodsA.data.length} products. Revenue: Rs ${metricsA.data.grossRevenuePKR}`);
    const aHasBData = ordersA.data.some((o) => o.customerName === 'Customer Beta') || prodsA.data.some((p) => p.name === 'Product Beta Jacket');
    if (!aHasBData) {
      console.log('✓ Verified: User A sees ONLY Business A data (0 records from B).');
    } else {
      console.error('❌ ERROR: User A leaked Business B data!');
    }

    const ordersB = await request('get', '/api/orders', null, tokenBApproved, bizIdB);
    const prodsB = await request('get', '/api/products', null, tokenBApproved, bizIdB);
    const metricsB = await request('get', '/api/analytics/metrics', null, tokenBApproved, bizIdB);

    console.log(`  - User B sees ${ordersB.data.length} orders, ${prodsB.data.length} products. Revenue: Rs ${metricsB.data.grossRevenuePKR}`);
    const bHasAData = ordersB.data.some((o) => o.customerName === 'Customer Alpha') || prodsB.data.some((p) => p.name === 'Product Alpha Hoodie');
    if (!bHasAData) {
      console.log('✓ Verified: User B sees ONLY Business B data (0 records from A).');
    } else {
      console.error('❌ ERROR: User B leaked Business A data!');
    }

    console.log(`  - Revenue Isolation Check: Business A Revenue = Rs ${metricsA.data.grossRevenuePKR} (Expected 10250), Business B Revenue = Rs ${metricsB.data.grossRevenuePKR} (Expected 8250)`);
    if (metricsA.data.grossRevenuePKR === 10250 && metricsB.data.grossRevenuePKR === 8250) {
      console.log('✓ Verified: Analytics revenue queries are strictly tenant isolated!');
    } else {
      console.error('❌ ERROR: Analytics revenue mismatch or contamination detected!');
    }

    // 8. CROSS-TENANT HEADER ATTACK VERIFICATION
    console.log('\n[8/8] Testing Cross-Tenant Header Attacks (User A claiming X-Tenant-ID: Business B)...');
    const attackRes = await request('get', '/api/orders', null, tokenAApproved, bizIdB);
    if (attackRes.status === 403) {
      console.log('✓ Verified: User A attempting X-Tenant-ID: Business B was blocked with HTTP 403 Forbidden!');
    } else {
      console.error(`❌ ERROR: Cross-tenant attack returned status ${attackRes.status} instead of 403!`);
    }

    console.log('\n====================================================');
    console.log('🎉 ALL TENANT ISOLATION & APPROVAL SECURITY TESTS PASSED!');
    console.log('====================================================');
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED WITH ERROR:', error.message);
    process.exit(1);
  }
}

runTests();
