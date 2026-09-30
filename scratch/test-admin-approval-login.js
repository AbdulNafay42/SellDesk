const API_BASE = 'http://localhost:4000';

async function runTest() {
  console.log('=== BRAND APPROVAL & LOGIN TEST ===\n');

  try {
    // Step 1: Register brand
    const testEmail = `brand_test_${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    const brandName = `Test Brand ${Date.now()}`;

    console.log(`1. Registering new brand...`);
    console.log(`   Email: ${testEmail}, Brand: ${brandName}`);

    const regRes = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Owner',
        email: testEmail,
        password: testPassword,
        phone: '+923001234567',
        businessName: brandName,
        city: 'Lahore',
        country: 'Pakistan',
      }),
    });

    const regData = await regRes.json();
    console.log('   Registration Status:', regRes.status);
    console.log('   Registration Response:', regData);

    if (!regRes.ok) throw new Error(`Registration failed: ${JSON.stringify(regData)}`);

    const businessId = regData.business.id;
    const userId = regData.user.id;

    // Step 2: Login as Super Admin
    console.log('\n2. Logging in as Super Admin (abdulnafay2005@gmail.com)...');
    const adminLoginRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abdulnafay2005@gmail.com',
        password: 'password123',
      }),
    });

    const adminLoginData = await adminLoginRes.json();
    console.log('   Admin Login Status:', adminLoginRes.status);

    if (!adminLoginRes.ok) throw new Error(`Admin login failed: ${JSON.stringify(adminLoginData)}`);

    const adminToken = adminLoginData.accessToken;
    console.log('   Super Admin logged in. Token length:', adminToken.length);

    // Step 3: Admin approves the business
    console.log(`\n3. Approving business ID: ${businessId}...`);
    const approveRes = await fetch(`${API_BASE}/api/admin/businesses/${businessId}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const approveData = await approveRes.json();
    console.log('   Approval Status:', approveRes.status);
    console.log('   Approval Response:', approveData);

    if (!approveRes.ok) throw new Error(`Approval failed: ${JSON.stringify(approveData)}`);

    const inviteToken = approveData.invitation.token;
    console.log('   Generated Invitation Token:', inviteToken);

    // Step 3b: Test Brand login WITHOUT accepting invite (with initial registration password)
    console.log('\n3b. Attempting brand login BEFORE accepting invite...');
    const preInviteLoginRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    const preInviteLoginData = await preInviteLoginRes.json();
    console.log('   Pre-invite Login Status:', preInviteLoginRes.status);
    console.log('   Pre-invite Business Status in response:', preInviteLoginData.memberships?.[0]?.business?.status);

    // Step 4: Accept invitation with new password
    console.log('\n4. Accepting invitation via /api/auth/accept-invite...');
    const acceptPassword = 'NewPassword123!';
    const acceptRes = await fetch(`${API_BASE}/api/auth/accept-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: inviteToken,
        password: acceptPassword,
      }),
    });

    const acceptData = await acceptRes.json();
    console.log('   Accept Invite Status:', acceptRes.status);
    console.log('   Accept Invite Response:', acceptData);

    if (!acceptRes.ok) throw new Error(`Accept invite failed: ${JSON.stringify(acceptData)}`);

    // Step 5: Try logging in with the OLD password
    console.log('\n5a. Attempting brand login with OLD password...');
    const oldPassLoginRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    console.log('   Old Password Login Status:', oldPassLoginRes.status, oldPassLoginRes.status === 401 ? '(Expected failure if password changed)' : '(Unexpected outcome)');

    // Step 5b: Try logging in with NEW password
    console.log('\n5b. Attempting brand login with NEW password set during invite acceptance...');
    const newPassLoginRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: acceptPassword,
      }),
    });

    const newPassLoginData = await newPassLoginRes.json();
    console.log('   New Password Login Status:', newPassLoginRes.status);
    console.log('   Token:', newPassLoginData.accessToken ? 'RECEIVED' : 'NONE');
    console.log('   Memberships:', JSON.stringify(newPassLoginData.memberships, null, 2));

    // Step 6: Check Business Status in memberships
    const bizStatus = newPassLoginData.memberships?.[0]?.business?.status;
    console.log(`\n6. Business Status in returned memberships: "${bizStatus}"`);

    if (bizStatus === 'APPROVED') {
      console.log(' SUCCESS: Business status is APPROVED after admin approval!');
    } else {
      console.error(` FAILURE: Business status is "${bizStatus}", expected "APPROVED"!`);
    }

  } catch (err) {
    console.error(' TEST FAILED WITH ERROR:', err.message);
  }
}

runTest();
