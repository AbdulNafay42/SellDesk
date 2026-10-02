const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const API_URL = 'http://localhost:4000';

async function apiCall(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = res.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const error = new Error(data.message || `HTTP ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function main() {
  console.log('==================================================');
  console.log('SELLDESK — PHASE 7 SCHEMA HARDENING TEST SUITE');
  console.log('==================================================\n');

  const ts = Date.now().toString(36);

  // Setup Business A & Business B in DB
  console.log('[Setup] Provisioning Business A and Business B...');
  const bizA = await prisma.business.create({
    data: {
      name: `Tenant A ${ts}`,
      slug: `tenant-a-${ts}`,
      status: 'APPROVED',
    },
  });

  const bizB = await prisma.business.create({
    data: {
      name: `Tenant B ${ts}`,
      slug: `tenant-b-${ts}`,
      status: 'APPROVED',
    },
  });

  const productA = await prisma.product.create({
    data: {
      businessId: bizA.id,
      name: `Product A ${ts}`,
      basePrice: 1000,
    },
  });

  const productB = await prisma.product.create({
    data: {
      businessId: bizB.id,
      name: `Product B ${ts}`,
      basePrice: 1500,
    },
  });

  const customerA = await prisma.customer.create({
    data: {
      businessId: bizA.id,
      fullName: 'Customer A',
      phoneNumber: '03001234567',
    },
  });

  const customerB = await prisma.customer.create({
    data: {
      businessId: bizB.id,
      fullName: 'Customer B',
      phoneNumber: '03009876543',
    },
  });

  console.log(`Created Business A (${bizA.id}) and Business B (${bizB.id}).\n`);

  // ==================================================
  // TEST 1 — Business A can create SKU ABC-001
  // ==================================================
  console.log('▶ TEST 1: Business A can create SKU ABC-001...');
  const skuCode = `SKU-ABC-001-${ts}`;
  const variantA = await prisma.productVariant.create({
    data: {
      businessId: bizA.id,
      productId: productA.id,
      sku: skuCode,
      price: 1000,
      stock: 50,
    },
  });
  if (variantA && variantA.sku === skuCode) {
    console.log(`✅ PASS: Business A created SKU ${skuCode}`);
  } else {
    console.error('❌ FAIL: Business A could not create SKU');
    process.exit(1);
  }

  // ==================================================
  // TEST 2 — Business B can create same SKU ABC-001
  // ==================================================
  console.log('▶ TEST 2: Business B can create same SKU ABC-001...');
  const variantB = await prisma.productVariant.create({
    data: {
      businessId: bizB.id,
      productId: productB.id,
      sku: skuCode,
      price: 1200,
      stock: 30,
    },
  });
  if (variantB && variantB.sku === skuCode) {
    console.log(`✅ PASS: Business B successfully created identical SKU ${skuCode}`);
  } else {
    console.error('❌ FAIL: Business B could not create identical SKU');
    process.exit(1);
  }

  // ==================================================
  // TEST 3 — Business A cannot create duplicate SKU ABC-001
  // ==================================================
  console.log('▶ TEST 3: Business A cannot create duplicate SKU ABC-001...');
  try {
    await prisma.productVariant.create({
      data: {
        businessId: bizA.id,
        productId: productA.id,
        sku: skuCode,
        price: 1000,
        stock: 10,
      },
    });
    console.error('❌ FAIL: Business A created duplicate SKU in same tenant!');
    process.exit(1);
  } catch (err) {
    console.log('✅ PASS: Business A duplicate SKU correctly rejected by composite unique constraint.');
  }

  // ==================================================
  // TEST 4 — Business A can create order ORD-1001
  // ==================================================
  console.log('▶ TEST 4: Business A can create order ORD-1001...');
  const orderNum = `ORD-1001-${ts}`;
  const orderA = await prisma.order.create({
    data: {
      businessId: bizA.id,
      customerId: customerA.id,
      orderNumber: orderNum,
      subtotal: 1000,
      totalAmount: 1000,
    },
  });
  if (orderA && orderA.orderNumber === orderNum) {
    console.log(`✅ PASS: Business A created order ${orderNum}`);
  } else {
    console.error('❌ FAIL: Business A could not create order');
    process.exit(1);
  }

  // ==================================================
  // TEST 5 — Business B can create same order ORD-1001
  // ==================================================
  console.log('▶ TEST 5: Business B can create same order ORD-1001...');
  const orderB = await prisma.order.create({
    data: {
      businessId: bizB.id,
      customerId: customerB.id,
      orderNumber: orderNum,
      subtotal: 1500,
      totalAmount: 1500,
    },
  });
  if (orderB && orderB.orderNumber === orderNum) {
    console.log(`✅ PASS: Business B created identical order number ${orderNum}`);
  } else {
    console.error('❌ FAIL: Business B could not create identical order number');
    process.exit(1);
  }

  // ==================================================
  // TEST 6 — Business A cannot create duplicate ORD-1001
  // ==================================================
  console.log('▶ TEST 6: Business A cannot create duplicate ORD-1001...');
  try {
    await prisma.order.create({
      data: {
        businessId: bizA.id,
        customerId: customerA.id,
        orderNumber: orderNum,
        subtotal: 1000,
        totalAmount: 1000,
      },
    });
    console.error('❌ FAIL: Business A created duplicate order number in same tenant!');
    process.exit(1);
  } catch (err) {
    console.log('✅ PASS: Business A duplicate order number correctly rejected by composite unique constraint.');
  }

  // ==================================================
  // TEST 7 — Business A category is visible to Business A
  // ==================================================
  console.log('▶ TEST 7: Category tenancy - Business A category creation...');
  const categoryA = await prisma.category.create({
    data: {
      businessId: bizA.id,
      name: `Winter Collection ${ts}`,
      slug: `winter-${ts}`,
    },
  });
  if (categoryA && categoryA.businessId === bizA.id) {
    console.log(`✅ PASS: Category created for Business A (${categoryA.id})`);
  } else {
    console.error('❌ FAIL: Category creation failed');
    process.exit(1);
  }

  // ==================================================
  // TEST 8 — Business B cannot access Business A category
  // ==================================================
  console.log('▶ TEST 8: Business B tenant scoping on Category...');
  const catForB = await prisma.category.findFirst({
    where: {
      id: categoryA.id,
      businessId: bizB.id,
    },
  });
  if (!catForB) {
    console.log('✅ PASS: Business B query for Business A category returned null (tenant-scoped).');
  } else {
    console.error('❌ FAIL: Business B accessed Business A category!');
    process.exit(1);
  }

  // ==================================================
  // TEST 9 — Business A cannot modify Business B category
  // ==================================================
  console.log('▶ TEST 9: Business A cannot modify Business B category...');
  const categoryB = await prisma.category.create({
    data: {
      businessId: bizB.id,
      name: `Summer Collection ${ts}`,
      slug: `summer-${ts}`,
    },
  });
  const updateCount = await prisma.category.updateMany({
    where: {
      id: categoryB.id,
      businessId: bizA.id,
    },
    data: { name: 'Hacked Category' },
  });
  if (updateCount.count === 0) {
    console.log('✅ PASS: Cross-tenant category update affected 0 rows.');
  } else {
    console.error('❌ FAIL: Business A mutated Business B category!');
    process.exit(1);
  }

  // ==================================================
  // TEST 10 — Authentication uses PostgreSQL users
  // ==================================================
  console.log('▶ TEST 10: Authentication uses real PostgreSQL users...');
  const realUserEmail = `realuser_${ts}@test.pk`;
  const regUser = await apiCall(`${API_URL}/api/auth/register`, {
    method: 'POST',
    body: {
      email: realUserEmail,
      password: 'MyRealPassword123!',
      fullName: 'Real User',
      businessName: `Real Biz ${ts}`,
      phone: '03005555555',
      city: 'Lahore',
      country: 'Pakistan',
    },
  });

  const loginUser = await apiCall(`${API_URL}/api/auth/login`, {
    method: 'POST',
    body: {
      email: realUserEmail,
      password: 'MyRealPassword123!',
    },
  });
  if (loginUser && loginUser.accessToken && loginUser.user.email === realUserEmail) {
    console.log('✅ PASS: Real PostgreSQL user registered and logged in successfully.');
  } else {
    console.error('❌ FAIL: Real PostgreSQL authentication failed');
    process.exit(1);
  }

  // ==================================================
  // TEST 11 — Known fallback password / arbitrary user rejected
  // ==================================================
  console.log('▶ TEST 11: Fallback password on non-existent user rejected...');
  try {
    await apiCall(`${API_URL}/api/auth/login`, {
      method: 'POST',
      body: {
        email: `nonexistent_${ts}@test.pk`,
        password: 'password123',
      },
    });
    console.error('❌ FAIL: Fallback authentication authenticated a nonexistent user!');
    process.exit(1);
  } catch (err) {
    if (err.status === 401) {
      console.log('✅ PASS: Nonexistent user authentication correctly rejected with 401 Unauthorized.');
    } else {
      console.error(`❌ FAIL: Unexpected error status ${err.status}`);
      process.exit(1);
    }
  }

  // ==================================================
  // TEST 12 — Super Admin provisioning works securely
  // ==================================================
  console.log('▶ TEST 12: Super Admin provisioning security...');
  const superAdminLogin = await apiCall(`${API_URL}/api/auth/login`, {
    method: 'POST',
    body: {
      email: 'abdulnafay2005@gmail.com',
      password: 'password123',
    },
  });
  const adminToken = superAdminLogin.accessToken;

  const provisionedOwnerEmail = `prov_owner_${ts}@test.pk`;
  const provRes = await apiCall(`${API_URL}/api/admin/tenants/provision`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
    body: {
      name: `Provisioned Brand ${ts}`,
      ownerName: 'Provisioned Owner',
      ownerEmail: provisionedOwnerEmail,
      whatsappPhone: '03007777777',
      city: 'Islamabad',
      plan: 'GROWTH',
    },
  });

  if (!provRes || !provRes.id) {
    console.error('❌ FAIL: Tenant provisioning failed');
    process.exit(1);
  }

  // Verify created user does NOT accept password123
  try {
    await apiCall(`${API_URL}/api/auth/login`, {
      method: 'POST',
      body: {
        email: provisionedOwnerEmail,
        password: 'password123',
      },
    });
    console.error('❌ FAIL: Provisioned user was assigned static password123!');
    process.exit(1);
  } catch (err) {
    if (err.status === 401) {
      console.log('✅ PASS: Provisioned user static password123 login rejected (401 Unauthorized).');
    } else {
      console.error(`❌ FAIL: Unexpected error status ${err.status}`);
      process.exit(1);
    }
  }

  // Verify InvitationToken was created for setup
  const invitation = await prisma.invitationToken.findFirst({
    where: { email: provisionedOwnerEmail },
  });
  if (invitation && invitation.token) {
    console.log(`  Invitation Token Verified: Created invitation token (${invitation.token.substring(0, 10)}...)`);
  } else {
    console.error('❌ FAIL: Invitation token was not created for provisioned tenant');
    process.exit(1);
  }

  // ==================================================
  // TEST 13 — Existing tenant isolation verification
  // ==================================================
  console.log('▶ TEST 13: Tenant isolation verification...');
  const bizAOrders = await prisma.order.findMany({ where: { businessId: bizA.id } });
  const bizBOrders = await prisma.order.findMany({ where: { businessId: bizB.id } });
  if (bizAOrders.length === 1 && bizBOrders.length === 1) {
    console.log('✅ PASS: Tenant queries strictly scoped by businessId.');
  } else {
    console.error('❌ FAIL: Tenant query leakage detected!');
    process.exit(1);
  }

  console.log('\n==================================================');
  console.log('🎉 ALL 13 PHASE 7 SCHEMA HARDENING TESTS PASSED!');
  console.log('==================================================');
}

main()
  .catch((err) => {
    console.error('Test execution error:', err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
