const http = require('http');

const API_BASE = 'http://localhost:4000';

function makeRequest(path, method = 'GET', body = null, token = null, tenantHeader = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    if (tenantHeader) {
      options.headers['X-Tenant-ID'] = tenantHeader;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runSecurityAuditTests() {
  console.log('====================================================');
  console.log('SELLDESK — PHASE 5 PRODUCTION SECURITY AUDIT SUITE');
  console.log('====================================================\n');

  const ts = Date.now();
  let passCount = 0;
  let totalCount = 0;

  function assert(condition, message) {
    totalCount++;
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passCount++;
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  try {
    // ----------------------------------------------------
    // SETUP: Create Super Admin & Business A, B, C, D
    // ----------------------------------------------------
    // Super Admin login
    const adminLogin = await makeRequest('/api/auth/login', 'POST', {
      email: 'abdulnafay2005@gmail.com',
      password: 'password123',
    });
    assert(adminLogin.status === 200, 'Super Admin authentication');
    const adminToken = adminLogin.data.accessToken;

    // 1. Unauthenticated Access Test
    const unauthOrders = await makeRequest('/api/orders');
    assert(unauthOrders.status === 401, '1. Unauthenticated request to /api/orders blocked with 401');

    const unauthAdmin = await makeRequest('/api/admin/pending-businesses');
    assert(unauthAdmin.status === 401, '1. Unauthenticated request to /api/admin/pending-businesses blocked with 401');

    // 2. Pending Business Access Test
    const regPending = await makeRequest('/api/auth/register', 'POST', {
      email: `owner_pending_${ts}@test.com`,
      password: 'Password123!',
      fullName: 'Pending Owner',
      businessName: `Pending Biz ${ts}`,
      phone: `0300${ts.toString().slice(-7)}`,
      city: 'Lahore',
    });
    assert(regPending.status === 201, 'Register pending owner');
    const pendingToken = regPending.data.accessToken;
    const pendingBizId = regPending.data.business.id;

    const pendingAccess = await makeRequest('/api/orders', 'GET', null, pendingToken, pendingBizId);
    assert(pendingAccess.status === 403, '2. Pending business owner access to tenant endpoints blocked with 403 Forbidden');

    // 3. Approved Business A Setup
    const regBizA = await makeRequest('/api/auth/register', 'POST', {
      email: `owner_a_${ts}@test.com`,
      password: 'Password123!',
      fullName: 'Owner A',
      businessName: `Store A ${ts}`,
      phone: `0301${ts.toString().slice(-7)}`,
      city: 'Karachi',
    });
    const bizIdA = regBizA.data.business.id;
    await makeRequest(`/api/admin/businesses/${bizIdA}/approve`, 'PATCH', {}, adminToken);
    
    const loginA = await makeRequest('/api/auth/login', 'POST', {
      email: `owner_a_${ts}@test.com`,
      password: 'Password123!',
    });
    const tokenA = loginA.data.accessToken;

    const approvedAccessA = await makeRequest('/api/products', 'GET', null, tokenA, bizIdA);
    assert(approvedAccessA.status === 200, '5. Approved Business A owner granted access (200 OK)');

    // 4. Approved Business B Setup
    const regBizB = await makeRequest('/api/auth/register', 'POST', {
      email: `owner_b_${ts}@test.com`,
      password: 'Password123!',
      fullName: 'Owner B',
      businessName: `Store B ${ts}`,
      phone: `0302${ts.toString().slice(-7)}`,
      city: 'Islamabad',
    });
    const bizIdB = regBizB.data.business.id;
    await makeRequest(`/api/admin/businesses/${bizIdB}/approve`, 'PATCH', {}, adminToken);

    const loginB = await makeRequest('/api/auth/login', 'POST', {
      email: `owner_b_${ts}@test.com`,
      password: 'Password123!',
    });
    const tokenB = loginB.data.accessToken;

    // Create record in Business B for IDOR testing
    const createProductB = await makeRequest('/api/products', 'POST', {
      name: 'Secret Product B',
      category: 'Apparel',
      basePrice: 5000,
      variants: [{ sku: 'PROD-B-1', price: 5000, stock: 10 }]
    }, tokenB, bizIdB);
    assert(createProductB.status === 201, 'Product B created in Business B');
    const productBId = createProductB.data.id;

    // 6. Cross-Tenant Header Attack (User A sending X-Tenant-ID: Business B)
    const headerAttack = await makeRequest('/api/products', 'GET', null, tokenA, bizIdB);
    assert(headerAttack.status === 403, '6. Cross-tenant header attack (User A -> Biz B header) blocked with 403 Forbidden');

    // 7. Cross-Tenant Object Access Attack (IDOR)
    const idorProductAccess = await makeRequest(`/api/products/${productBId}`, 'GET', null, tokenA, bizIdA);
    assert(idorProductAccess.status === 404 || idorProductAccess.status === 403, '7. IDOR attack (User A fetching Product B ID directly) blocked with 404/403');

    // 8, 9, 10. Admin Endpoint Role Security Tests
    const userToAdmin = await makeRequest('/api/admin/pending-businesses', 'GET', null, tokenA);
    assert(userToAdmin.status === 403, '8/9/10. Store Owner access to Super Admin endpoints blocked with 403 Forbidden');

    // 11. Super Admin Endpoint Test
    const superAdminAccess = await makeRequest('/api/admin/pending-businesses', 'GET', null, adminToken);
    assert(superAdminAccess.status === 200, '11. Super Admin access to Admin endpoints permitted (200 OK)');

    // 12. Unauthorized Business Selection
    const unauthBizSelect = await makeRequest('/api/settings/business', 'GET', null, tokenA, bizIdB);
    assert(unauthBizSelect.status === 403, '12. Selecting unassociated business ID in header blocked with 403');

    // 13. AI Action Cross-Tenant Access
    const aiActionsAccessB = await makeRequest('/api/ai/actions', 'GET', null, tokenA, bizIdB);
    assert(aiActionsAccessB.status === 403, '13. Cross-tenant AI action access blocked with 403 Forbidden');

    // 14. Billing / Invoice Cross-Tenant Access
    const billingAccessB = await makeRequest('/api/settings/billing', 'GET', null, tokenA, bizIdB);
    assert(billingAccessB.status === 403, '14. Cross-tenant billing/invoice access blocked with 403 Forbidden');

    // 15. Team Member Cross-Tenant Access
    const teamAccessB = await makeRequest('/api/settings/team', 'GET', null, tokenA, bizIdB);
    assert(teamAccessB.status === 403, '15. Cross-tenant team member access blocked with 403 Forbidden');

    // 16. Business Status Transition (Suspended Business Test)
    const provisionBiz = await makeRequest('/api/admin/tenants/provision', 'POST', {
      name: `Provisioned Suspended Store ${ts}`,
      ownerName: 'Suspended Owner',
      ownerEmail: `suspended_${ts}@test.com`,
      whatsappPhone: `0304${ts.toString().slice(-7)}`,
      city: 'Multan',
      plan: 'STARTER'
    }, adminToken);
    assert(provisionBiz.status === 201, 'Provisioned store created');
    const suspBizId = provisionBiz.data.id;

    // Toggle status to SUSPENDED
    const toggleSusp = await makeRequest(`/api/admin/tenants/${suspBizId}/status`, 'PATCH', {}, adminToken);
    assert(toggleSusp.status === 200 && toggleSusp.data.status === 'SUSPENDED', 'Super Admin suspended business');

    // Register user for suspended business or login
    const regSuspUser = await makeRequest('/api/auth/register', 'POST', {
      email: `user_susp_${ts}@test.com`,
      password: 'Password123!',
      fullName: 'Suspended User',
      businessName: `Existing Suspended Store ${ts}`,
      phone: `0305${ts.toString().slice(-7)}`,
      city: 'Multan',
    });
    const suspToken = regSuspUser.data.accessToken;

    const suspendedAccess = await makeRequest('/api/products', 'GET', null, suspToken, suspBizId);
    assert(suspendedAccess.status === 403, '4/16. Suspended business owner access to tenant endpoints blocked with 403 Forbidden');

    console.log('\n========================================');
    console.log(`PHASE 5 SECURITY SUITE RESULTS: ${passCount} / ${totalCount} PASSED`);
    console.log('========================================\n');

    if (passCount === totalCount) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error during Phase 5 security audit test:', err);
    process.exit(1);
  }
}

runSecurityAuditTests();
