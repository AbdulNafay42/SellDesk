const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('==================================================');
  console.log('PHASE 7 — REAL DATABASE COLLISION AUDIT');
  console.log('==================================================\n');

  // 1. Audit Category table
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
  });
  console.log(`[Category Audit] Total categories in DB: ${categories.length}`);
  categories.forEach((c) => {
    console.log(`  - ID: ${c.id} | Name: "${c.name}" | Slug: "${c.slug}" | Products: ${c._count.products}`);
  });

  // 2. Audit ProductVariants SKUs
  const variants = await prisma.productVariant.findMany({
    include: { product: { select: { businessId: true } } },
  });
  console.log(`\n[SKU Audit] Total ProductVariants in DB: ${variants.length}`);
  const skuCounts = {};
  variants.forEach((v) => {
    const bizId = v.product?.businessId || 'UNKNOWN';
    if (!skuCounts[v.sku]) skuCounts[v.sku] = [];
    skuCounts[v.sku].push({ variantId: v.id, productId: v.productId, businessId: bizId });
  });

  let skuCollisions = 0;
  Object.keys(skuCounts).forEach((sku) => {
    if (skuCounts[sku].length > 1) {
      skuCollisions++;
      console.log(`  🔴 SKU Collision on "${sku}":`, skuCounts[sku]);
    }
  });
  if (skuCollisions === 0) console.log('  ✅ No SKU collisions found.');

  // 3. Audit Orders orderNumber
  const orders = await prisma.order.findMany({ select: { id: true, orderNumber: true, businessId: true } });
  console.log(`\n[Order Audit] Total Orders in DB: ${orders.length}`);
  const orderCounts = {};
  orders.forEach((o) => {
    if (!orderCounts[o.orderNumber]) orderCounts[o.orderNumber] = [];
    orderCounts[o.orderNumber].push(o);
  });
  let orderCollisions = 0;
  Object.keys(orderCounts).forEach((num) => {
    if (orderCounts[num].length > 1) {
      orderCollisions++;
      console.log(`  🔴 Order # Collision on "${num}":`, orderCounts[num]);
    }
  });
  if (orderCollisions === 0) console.log('  ✅ No Order # collisions found.');

  // 4. Audit Consignments cnNumber
  const consignments = await prisma.consignment.findMany({ select: { id: true, cnNumber: true, businessId: true } });
  console.log(`\n[Consignment Audit] Total Consignments in DB: ${consignments.length}`);
  const cnCounts = {};
  consignments.forEach((c) => {
    if (!cnCounts[c.cnNumber]) cnCounts[c.cnNumber] = [];
    cnCounts[c.cnNumber].push(c);
  });
  let cnCollisions = 0;
  Object.keys(cnCounts).forEach((cn) => {
    if (cnCounts[cn].length > 1) {
      cnCollisions++;
      console.log(`  🔴 CN # Collision on "${cn}":`, cnCounts[cn]);
    }
  });
  if (cnCollisions === 0) console.log('  ✅ No Consignment CN # collisions found.');

  // 5. Audit ReturnRequests returnNumber
  const returns = await prisma.returnRequest.findMany({ select: { id: true, returnNumber: true, businessId: true } });
  console.log(`\n[Return Audit] Total ReturnRequests in DB: ${returns.length}`);
  const retCounts = {};
  returns.forEach((r) => {
    if (!retCounts[r.returnNumber]) retCounts[r.returnNumber] = [];
    retCounts[r.returnNumber].push(r);
  });
  let retCollisions = 0;
  Object.keys(retCounts).forEach((ret) => {
    if (retCounts[ret].length > 1) {
      retCollisions++;
      console.log(`  🔴 Return # Collision on "${ret}":`, retCounts[ret]);
    }
  });
  if (retCollisions === 0) console.log('  ✅ No Return # collisions found.');

  // 6. Audit Invoices invoiceNumber
  const invoices = await prisma.invoice.findMany({ select: { id: true, invoiceNumber: true, businessId: true } });
  console.log(`\n[Invoice Audit] Total Invoices in DB: ${invoices.length}`);
  const invCounts = {};
  invoices.forEach((i) => {
    if (!invCounts[i.invoiceNumber]) invCounts[i.invoiceNumber] = [];
    invCounts[i.invoiceNumber].push(i);
  });
  let invCollisions = 0;
  Object.keys(invCounts).forEach((inv) => {
    if (invCounts[inv].length > 1) {
      invCollisions++;
      console.log(`  🔴 Invoice # Collision on "${inv}":`, invCounts[inv]);
    }
  });
  if (invCollisions === 0) console.log('  ✅ No Invoice # collisions found.');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
