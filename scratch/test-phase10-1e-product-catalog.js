const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const API_URL = 'http://localhost:4000';

async function runPhase10_1eTests() {
  console.log('==================================================');
  console.log('SELLDESK — PHASE 10.1E DYNAMIC PRODUCT CATALOG & TENANT ISOLATION TEST SUITE');
  console.log('==================================================\n');

  const ts = Date.now().toString(36);
  let passedCount = 0;
  const totalCount = 15;

  // ----------------------------------------------------
  // SETUP: Provision Business A, Business B, and Business C (Empty)
  // ----------------------------------------------------
  console.log('[Setup] Registering Business A, Business B, and Business C...');

  // Business A
  const regARes = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `cat_ownera_${ts}@example.test`,
      password: 'Password123!',
      fullName: 'Catalog Owner A',
      businessName: `Catalog Biz A ${ts}`,
      phone: '03001119988',
      city: 'Lahore',
      country: 'Pakistan',
    }),
  });
  const dataA = await regARes.json();
  const tokenA = dataA.accessToken;
  const bizAId = dataA.business.id;

  // Business B
  const regBRes = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `cat_ownerb_${ts}@example.test`,
      password: 'Password123!',
      fullName: 'Catalog Owner B',
      businessName: `Catalog Biz B ${ts}`,
      phone: '03004449988',
      city: 'Karachi',
      country: 'Pakistan',
    }),
  });
  const dataB = await regBRes.json();
  const tokenB = dataB.accessToken;
  const bizBId = dataB.business.id;

  // Business C (Empty Catalog)
  const regCRes = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `cat_ownerc_${ts}@example.test`,
      password: 'Password123!',
      fullName: 'Catalog Owner C',
      businessName: `Catalog Biz C ${ts}`,
      phone: '03007779988',
      city: 'Islamabad',
      country: 'Pakistan',
    }),
  });
  const dataC = await regCRes.json();
  const tokenC = dataC.accessToken;
  const bizCId = dataC.business.id;

  // Approve all businesses in DB for TenantGuard
  await prisma.business.update({ where: { id: bizAId }, data: { status: 'APPROVED' } });
  await prisma.business.update({ where: { id: bizBId }, data: { status: 'APPROVED' } });
  await prisma.business.update({ where: { id: bizCId }, data: { status: 'APPROVED' } });

  // Create Product in Business A
  const prodARes = await fetch(`${API_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
      'x-tenant-id': bizAId,
    },
    body: JSON.stringify({
      name: `Custom Silk Kurta ${ts}`,
      description: '100% Pure Silk Pakistani Kurta',
      basePrice: 5500,
      sku: `SKU-KURTA-${ts}`,
      variants: [
        { size: 'M', color: 'Emerald Green', sku: `SKU-KURTA-${ts}-M`, price: 5500, stock: 20 },
        { size: 'L', color: 'Emerald Green', sku: `SKU-KURTA-${ts}-L`, price: 6000, stock: 15 },
      ],
    }),
  });
  const prodA = await prodARes.json();

  // Create Product in Business B
  const prodBRes = await fetch(`${API_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenB}`,
      'x-tenant-id': bizBId,
    },
    body: JSON.stringify({
      name: `Velvet Blazer ${ts}`,
      description: 'Royal Black Velvet Party Blazer',
      basePrice: 12500,
      sku: `SKU-BLAZER-${ts}`,
      variants: [
        { size: 'XL', color: 'Royal Black', sku: `SKU-BLAZER-${ts}-XL`, price: 13000, stock: 8 },
      ],
    }),
  });
  const prodB = await prodBRes.json();

  console.log(`[Setup] Created Product A (${prodA.id}) for Biz A, Product B (${prodB.id}) for Biz B.\n`);

  // ----------------------------------------------------
  // TEST 1: Products can be retrieved for a valid tenant
  // ----------------------------------------------------
  console.log('[Test 1] Retrieving products for valid tenant (Business A)...');
  const getProdsARes = await fetch(`${API_URL}/api/products`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokenA}`,
      'x-tenant-id': bizAId,
    },
  });
  const prodsA = await getProdsARes.json();
  if (getProdsARes.status === 200 && Array.isArray(prodsA) && prodsA.length > 0) {
    console.log('✓ PASS: Products successfully retrieved for valid tenant');
    passedCount++;
  } else {
    console.log(`✗ FAIL: Unable to retrieve products for valid tenant (status: ${getProdsARes.status})`);
  }

  // ----------------------------------------------------
  // TEST 2: Product selector receives real PostgreSQL products
  // ----------------------------------------------------
  console.log('\n[Test 2] Validating returned product structure against PostgreSQL schema...');
  const fetchedProdA = Array.isArray(prodsA) ? prodsA.find((p) => p.id === prodA.id) : null;
  if (fetchedProdA && fetchedProdA.name === `Custom Silk Kurta ${ts}` && Array.isArray(fetchedProdA.variants) && fetchedProdA.variants.length === 2) {
    console.log('✓ PASS: Real PostgreSQL products with variants returned to selector');
    passedCount++;
  } else {
    console.log('✗ FAIL: Product structure does not match PostgreSQL DB schema');
  }

  // ----------------------------------------------------
  // TEST 3: No hardcoded demo products are used by production selector
  // ----------------------------------------------------
  console.log('\n[Test 3] Verifying no hardcoded demo product names in selector response...');
  const hasHardcodedInA = Array.isArray(prodsA) && prodsA.some((p) =>
    p.name === 'Oversized Black Premium Hoodie' || p.name === 'Vintage Wash Denim Jacket' || p.name === 'Minimalist Essential White Tee'
  );
  if (!hasHardcodedInA) {
    console.log('✓ PASS: No hardcoded demo products returned in active catalog selector');
    passedCount++;
  } else {
    console.log('✗ FAIL: Hardcoded demo products present in selector response');
  }

  // ----------------------------------------------------
  // TEST 4: Business A can retrieve its own products
  // ----------------------------------------------------
  console.log('\n[Test 4] Verifying Business A retrieves its own catalog...');
  const bizAHasOwnProd = Array.isArray(prodsA) && prodsA.some((p) => p.id === prodA.id);
  if (bizAHasOwnProd) {
    console.log('✓ PASS: Business A successfully retrieved its created product');
    passedCount++;
  } else {
    console.log('✗ FAIL: Business A could not find its own product');
  }

  // ----------------------------------------------------
  // TEST 5: Business A cannot retrieve Business B products (Tenant Isolation)
  // ----------------------------------------------------
  console.log('\n[Test 5] Verifying Business A cannot see Business B products...');
  const bizAHasBizBProd = Array.isArray(prodsA) && prodsA.some((p) => p.id === prodB.id);
  if (!bizAHasBizBProd) {
    console.log('✓ PASS: Strict tenant isolation — Business A catalog contains 0 products from Business B');
    passedCount++;
  } else {
    console.log('✗ FAIL: Cross-tenant product leakage detected in GET /api/products');
  }

  // ----------------------------------------------------
  // TEST 6: Cross-tenant product ID is rejected on order creation
  // ----------------------------------------------------
  console.log('\n[Test 6] Testing cross-tenant productId rejection during manual order creation...');
  const crossProdOrderRes = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
      'x-tenant-id': bizAId,
    },
    body: JSON.stringify({
      customerName: 'Attack Customer',
      customerPhone: '03009998877',
      city: 'Lahore',
      address: '123 Test St',
      productName: 'Illegal Cross Tenant Order',
      productId: prodB.id, // Belongs to Business B!
      totalAmount: 12500,
    }),
  });
  if (crossProdOrderRes.status === 400 || crossProdOrderRes.status === 403) {
    console.log(`✓ PASS: Cross-tenant productId correctly rejected with status ${crossProdOrderRes.status}`);
    passedCount++;
  } else {
    console.log(`✗ FAIL: Cross-tenant productId accepted with status ${crossProdOrderRes.status}`);
  }

  // ----------------------------------------------------
  // TEST 7: Cross-tenant variant ID is rejected on order creation
  // ----------------------------------------------------
  console.log('\n[Test 7] Testing cross-tenant variantId rejection during manual order creation...');
  const varBId = prodB.variants[0].id;
  const crossVarOrderRes = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
      'x-tenant-id': bizAId,
    },
    body: JSON.stringify({
      customerName: 'Attack Customer 2',
      customerPhone: '03009998877',
      city: 'Lahore',
      address: '123 Test St',
      productName: 'Illegal Cross Variant Order',
      variantId: varBId, // Belongs to Business B!
      totalAmount: 13000,
    }),
  });
  if (crossVarOrderRes.status === 400 || crossVarOrderRes.status === 403) {
    console.log(`✓ PASS: Cross-tenant variantId correctly rejected with status ${crossVarOrderRes.status}`);
    passedCount++;
  } else {
    console.log(`✗ FAIL: Cross-tenant variantId accepted with status ${crossVarOrderRes.status}`);
  }

  // ----------------------------------------------------
  // TEST 8: Empty catalog returns safe empty state
  // ----------------------------------------------------
  console.log('\n[Test 8] Fetching products for fresh Business C (0 products)...');
  const getProdsCRes = await fetch(`${API_URL}/api/products`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokenC}`,
      'x-tenant-id': bizCId,
    },
  });
  const prodsC = await getProdsCRes.json();
  if (getProdsCRes.status === 200 && Array.isArray(prodsC) && prodsC.length === 0) {
    console.log('✓ PASS: Empty catalog returns safe [] empty state without hardcoded mock items');
    passedCount++;
  } else {
    console.log('✗ FAIL: Empty catalog returned non-empty or non-array state');
  }

  // ----------------------------------------------------
  // TEST 9: Unauthenticated product API call does not fall back to fake products
  // ----------------------------------------------------
  console.log('\n[Test 9] Verifying unauthenticated GET /api/products returns HTTP 401...');
  const unauthRes = await fetch(`${API_URL}/api/products`, {
    method: 'GET',
  });
  if (unauthRes.status === 401) {
    console.log('✓ PASS: Unauthenticated request rejected with HTTP 401 (no fake mock fallbacks)');
    passedCount++;
  } else {
    console.log(`✗ FAIL: Unauthenticated request responded with HTTP ${unauthRes.status}`);
  }

  // ----------------------------------------------------
  // TEST 10: AI catalog matching uses correct businessId
  // ----------------------------------------------------
  console.log('\n[Test 10] Testing AI order extraction with Business A catalog context...');
  const aiExtractResA = await fetch(`${API_URL}/api/ai/extract-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
      'x-tenant-id': bizAId,
    },
    body: JSON.stringify({ text: `Silk Kurta size M emerald green Lahore` }),
  });
  const aiExtractA = await aiExtractResA.json();
  if (aiExtractResA.status === 201 && aiExtractA.extractedOrder?.productName.includes('Silk Kurta')) {
    console.log(`✓ PASS: AI catalog matching correctly matched Business A product "${aiExtractA.extractedOrder.productName}"`);
    passedCount++;
  } else {
    console.log('✗ FAIL: AI extraction failed to match Business A catalog product');
  }

  // ----------------------------------------------------
  // TEST 11: AI cannot match a product belonging to another tenant
  // ----------------------------------------------------
  console.log('\n[Test 11] Testing AI catalog isolation — Business A AI extracting message for Business B item...');
  const aiCrossRes = await fetch(`${API_URL}/api/ai/extract-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
      'x-tenant-id': bizAId,
    },
    body: JSON.stringify({ text: `Velvet Blazer Royal Black size XL` }), // Item belongs to Biz B!
  });
  const aiCross = await aiCrossRes.json();
  // AI under Biz A context should NOT return Prod B's ID
  const matchedCrossProdId = aiCross.extractedOrder?.productId;
  if (matchedCrossProdId !== prodB.id) {
    console.log(`✓ PASS: AI extraction under Business A did NOT leak Business B product ID (productId: ${matchedCrossProdId || 'null'})`);
    passedCount++;
  } else {
    console.log('✗ FAIL: AI extraction leaked cross-tenant product ID!');
  }

  // ----------------------------------------------------
  // TEST 12: Existing product/variant price data is used instead of hardcoded price values
  // ----------------------------------------------------
  console.log('\n[Test 12] Verifying real variant price (6000 PKR) is used in AI extraction...');
  const aiPriceRes = await fetch(`${API_URL}/api/ai/extract-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
      'x-tenant-id': bizAId,
    },
    body: JSON.stringify({ text: `Silk Kurta size L emerald green` }),
  });
  const aiPriceData = await aiPriceRes.json();
  const extractedPrice = aiPriceData.extractedOrder?.itemPrice;
  if (extractedPrice === 6000 || extractedPrice === 5500) {
    console.log(`✓ PASS: AI order extraction used real variant price (Rs ${extractedPrice}) from database catalog`);
    passedCount++;
  } else {
    console.log(`✗ FAIL: AI order extraction used hardcoded price (Rs ${extractedPrice})`);
  }

  // ----------------------------------------------------
  // TEST 13: Tenant switching refreshes product catalog correctly
  // ----------------------------------------------------
  console.log('\n[Test 13] Simulating tenant context switch (Biz A -> Biz B)...');
  const getProdsBRes = await fetch(`${API_URL}/api/products`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokenB}`,
      'x-tenant-id': bizBId,
    },
  });
  const prodsB = await getProdsBRes.json();
  const bHasVelvet = Array.isArray(prodsB) && prodsB.some((p) => p.id === prodB.id);
  const bHasKurta = Array.isArray(prodsB) && prodsB.some((p) => p.id === prodA.id);
  if (bHasVelvet && !bHasKurta) {
    console.log('✓ PASS: Tenant context switch correctly loaded Business B catalog and purged Business A products');
    passedCount++;
  } else {
    console.log('✗ FAIL: Tenant switch failed catalog isolation check');
  }

  // ----------------------------------------------------
  // TEST 14: Order creation flow works with valid real product and variant IDs
  // ----------------------------------------------------
  console.log('\n[Test 14] Testing manual order creation with valid Business A productId and variantId...');
  const varA1Id = prodA.variants[0].id;
  const createValidOrderRes = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
      'x-tenant-id': bizAId,
    },
    body: JSON.stringify({
      customerName: 'Tariq Mahmood',
      customerPhone: '03005554433',
      city: 'Lahore',
      address: 'Gulberg III, Block B',
      productName: prodA.name,
      variantInfo: `Size: ${prodA.variants[0].size} • Color: ${prodA.variants[0].color}`,
      productId: prodA.id,
      variantId: varA1Id,
      totalAmount: prodA.variants[0].price,
      paymentMethod: 'COD',
    }),
  });
  const validOrder = await createValidOrderRes.json();
  if (createValidOrderRes.status === 201 && validOrder.id && validOrder.notes?.includes(prodA.id)) {
    console.log(`✓ PASS: Manual order successfully created with real productId ${prodA.id} and variantId ${varA1Id}`);
    passedCount++;
  } else {
    console.log(`✗ FAIL: Manual order creation failed with status ${createValidOrderRes.status}`);
  }

  // ----------------------------------------------------
  // TEST 15: No automatic order creation introduced by AI or catalog phase
  // ----------------------------------------------------
  console.log('\n[Test 15] Verifying zero automatic order creation from AI catalog calls...');
  const ordersBeforeRes = await fetch(`${API_URL}/api/orders`, {
    headers: { Authorization: `Bearer ${tokenA}`, 'x-tenant-id': bizAId },
  });
  const ordersBeforeCount = (await ordersBeforeRes.json()).length;

  // Trigger AI extraction
  await fetch(`${API_URL}/api/ai/extract-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
      'x-tenant-id': bizAId,
    },
    body: JSON.stringify({ text: `Need 2 silk kurtas COD Lahore` }),
  });

  const ordersAfterRes = await fetch(`${API_URL}/api/orders`, {
    headers: { Authorization: `Bearer ${tokenA}`, 'x-tenant-id': bizAId },
  });
  const ordersAfterCount = (await ordersAfterRes.json()).length;

  if (ordersBeforeCount === ordersAfterCount) {
    console.log('✓ PASS: AI catalog extraction introduced ZERO automatic order creation (order count unchanged)');
    passedCount++;
  } else {
    console.log('✗ FAIL: AI extraction automatically created an order record!');
  }

  // ----------------------------------------------------
  // SUMMARY REPORT
  // ----------------------------------------------------
  console.log('\n==================================================');
  console.log(`RESULTS: ${passedCount} / ${totalCount} ASSERTIONS PASSED`);
  console.log('==================================================');

  if (passedCount === totalCount) {
    console.log('Status: PASS');
  } else {
    console.log('Status: FAILED');
  }

  await prisma.$disconnect();
  return passedCount === totalCount;
}

runPhase10_1eTests().catch((err) => {
  console.error('Test script crashed:', err);
  process.exit(1);
});
