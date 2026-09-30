const http = require('http');

const API_BASE = 'http://localhost:4000';

function makeRequest(path, method = 'GET', body = null, token = null) {
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

async function runTests() {
  console.log('--- STARTING PHASE 4 AI & SETTINGS VERIFICATION TESTS ---');

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
    // 1. Register & Approve Business A
    const regResA = await makeRequest('/api/auth/register', 'POST', {
      email: `owner_phase4_a_${ts}@test.com`,
      password: 'Password123!',
      fullName: 'Owner Phase4 A',
      businessName: `Phase4 Store A ${ts}`,
      phone: `0300${ts.toString().slice(-7)}`,
      city: 'Lahore',
    });
    assert(regResA.status === 201, 'Register Owner A returns 201');
    const tokenA = regResA.data.accessToken;
    const bizIdA = regResA.data.business?.id || regResA.data.memberships?.[0]?.businessId;

    // Login Super Admin & Approve Business A
    const adminLoginRes = await makeRequest('/api/auth/login', 'POST', {
      email: 'abdulnafay2005@gmail.com',
      password: 'password123',
    });
    assert(adminLoginRes.status === 200, 'Super Admin login returns 200');
    const adminToken = adminLoginRes.data.accessToken;

    const approveResA = await makeRequest(`/api/admin/businesses/${bizIdA}/approve`, 'PATCH', {}, adminToken);
    if (approveResA.status !== 200) {
      console.log('Approve Business A Response:', approveResA.status, JSON.stringify(approveResA.data || approveResA.raw));
    }
    assert(approveResA.status === 200, 'Super Admin approves Business A');

    // Re-login Owner A to get fresh JWT token
    const loginResA = await makeRequest('/api/auth/login', 'POST', {
      email: `owner_phase4_a_${ts}@test.com`,
      password: 'Password123!',
    });
    const cleanTokenA = loginResA.data.accessToken;

    // 2. Test AI Actions Empty State
    const aiActionsResA = await makeRequest('/api/ai/actions', 'GET', null, cleanTokenA);
    assert(aiActionsResA.status === 200, 'GET /api/ai/actions returns 200 for Business A');
    assert(Array.isArray(aiActionsResA.data), 'GET /api/ai/actions returns an array');
    assert(aiActionsResA.data.length === 0, 'GET /api/ai/actions returns empty array [] (no hardcoded mock actions)');

    // 3. Register & Approve Business B
    const regResB = await makeRequest('/api/auth/register', 'POST', {
      email: `owner_phase4_b_${ts}@test.com`,
      password: 'Password123!',
      fullName: 'Owner Phase4 B',
      businessName: `Phase4 Store B ${ts}`,
      phone: `0301${ts.toString().slice(-7)}`,
      city: 'Karachi',
    });
    const bizIdB = regResB.data.business?.id || regResB.data.memberships?.[0]?.businessId;
    await makeRequest(`/api/admin/businesses/${bizIdB}/approve`, 'PATCH', {}, adminToken);
    const loginResB = await makeRequest('/api/auth/login', 'POST', {
      email: `owner_phase4_b_${ts}@test.com`,
      password: 'Password123!',
    });
    const cleanTokenB = loginResB.data.accessToken;

    // 4. Register Pending Business C (Unapproved)
    const regResC = await makeRequest('/api/auth/register', 'POST', {
      email: `owner_phase4_c_${ts}@test.com`,
      password: 'Password123!',
      fullName: 'Owner Phase4 C',
      businessName: `Phase4 Store C ${ts}`,
      phone: `0302${ts.toString().slice(-7)}`,
      city: 'Islamabad',
    });
    const tokenC = regResC.data.accessToken;

    // Test Pending Business Approval Enforcement
    const pendingAiRes = await makeRequest('/api/ai/actions', 'GET', null, tokenC);
    assert(pendingAiRes.status === 403, 'Unapproved Business C blocked with 403 Forbidden on /api/ai/actions');

    const pendingSettingsRes = await makeRequest('/api/settings/billing', 'GET', null, tokenC);
    assert(pendingSettingsRes.status === 403, 'Unapproved Business C blocked with 403 Forbidden on /api/settings/billing');

    // 5. Test Settings Profile Fetch & Update
    const getProfileRes = await makeRequest('/api/settings/business', 'GET', null, cleanTokenA);
    assert(getProfileRes.status === 200, 'GET /api/settings/business returns 200');
    assert(getProfileRes.data.id === bizIdA, 'Business profile matches Business A ID');

    const updateProfileRes = await makeRequest('/api/settings/business', 'PUT', {
      name: `Updated Store A ${ts}`,
      city: 'Rawalpindi',
      address: 'Plot 100, Commercial Area',
      whatsappNumber: '03009998877',
      category: 'Footwear & Shoes'
    }, cleanTokenA);
    assert(updateProfileRes.status === 200, 'PUT /api/settings/business updates successfully');
    assert(updateProfileRes.data.name === `Updated Store A ${ts}`, 'Updated business name persisted');
    assert(updateProfileRes.data.city === 'Rawalpindi', 'Updated warehouse city persisted');

    // 6. Test Team Members API
    const teamResA = await makeRequest('/api/settings/team', 'GET', null, cleanTokenA);
    assert(teamResA.status === 200, 'GET /api/settings/team returns 200');
    assert(Array.isArray(teamResA.data), 'Team response is an array');
    assert(teamResA.data.length >= 1, 'Contains at least owner member');
    assert(teamResA.data[0].email === `owner_phase4_a_${ts}@test.com`, 'Owner member details matched');

    // Invite team member
    const inviteRes = await makeRequest('/api/settings/team/invite', 'POST', {
      name: 'Agent Hamza',
      email: `hamza_${ts}@test.com`,
      role: 'SALES_AGENT'
    }, cleanTokenA);
    assert(inviteRes.status === 201, 'POST /api/settings/team/invite creates member');

    const updatedTeamResA = await makeRequest('/api/settings/team', 'GET', null, cleanTokenA);
    assert(updatedTeamResA.data.length === teamResA.data.length + 1, 'Team count incremented after invite');

    // 7. Test Billing & Invoices API
    const billingResA = await makeRequest('/api/settings/billing', 'GET', null, cleanTokenA);
    assert(billingResA.status === 200, 'GET /api/settings/billing returns 200');
    assert(billingResA.data.currentPlan === 'GROWTH', 'Returns subscription tier');
    assert(billingResA.data.usageMeters.teamMembersCount === updatedTeamResA.data.length, 'Usage meters team count reflects dynamic DB total');
    assert(Array.isArray(billingResA.data.invoices), 'Invoices is an array');
    assert(billingResA.data.invoices.length === 0, 'New business has zero invoices (not mock invoices)');

    // 8. Tenant Isolation on Team & Billing
    const teamResB = await makeRequest('/api/settings/team', 'GET', null, cleanTokenB);
    assert(teamResB.status === 200, 'GET /api/settings/team for Business B returns 200');
    assert(teamResB.data.every(m => m.email !== `hamza_${ts}@test.com`), 'Business B does NOT see Business A invited team member');

    console.log(`\n========================================`);
    console.log(`PHASE 4 VERIFICATION RESULTS: ${passCount} / ${totalCount} PASSED`);
    console.log(`========================================\n`);

    if (passCount === totalCount) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error during Phase 4 tests:', err);
    process.exit(1);
  }
}

runTests();
