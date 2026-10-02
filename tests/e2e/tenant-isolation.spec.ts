import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const API_URL = 'http://localhost:4000';
const prisma = new PrismaClient();

test.describe('Tenant & Business Isolation E2E Flow', () => {
  const ts = Date.now().toString(36);
  
  // Business A Data
  const ownerAEmail = `e2e_ownera_${ts}@example.test`;
  const ownerAPassword = 'Password123!';
  let bizAId: string;
  let orderANumber: string;

  // Business B Data
  const ownerBEmail = `e2e_ownerb_${ts}@example.test`;
  const ownerBPassword = 'Password123!';
  let bizBId: string;
  let orderBNumber: string;

  test.beforeAll(async () => {
    // 1. Setup Business A
    const resA = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ownerAEmail,
        password: ownerAPassword,
        fullName: 'Owner A',
        businessName: `E2E Tenant A ${ts}`,
        phone: '03001111111',
        city: 'Lahore',
        country: 'Pakistan',
      }),
    });
    const dataA = await resA.json();
    bizAId = dataA.business.id;

    await prisma.business.update({ where: { id: bizAId }, data: { status: 'APPROVED' } });

    // Create Customer & Order for Business A
    const custA = await prisma.customer.create({
      data: { businessId: bizAId, fullName: `Customer A ${ts}`, phoneNumber: '03001111111' },
    });
    orderANumber = `ORD-A-${ts}`;
    await prisma.order.create({
      data: {
        businessId: bizAId,
        customerId: custA.id,
        orderNumber: orderANumber,
        subtotal: 5500,
        totalAmount: 5500,
      },
    });

    // 2. Setup Business B
    const resB = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ownerBEmail,
        password: ownerBPassword,
        fullName: 'Owner B',
        businessName: `E2E Tenant B ${ts}`,
        phone: '03002222222',
        city: 'Karachi',
        country: 'Pakistan',
      }),
    });
    const dataB = await resB.json();
    bizBId = dataB.business.id;

    await prisma.business.update({ where: { id: bizBId }, data: { status: 'APPROVED' } });

    // Create Customer & Order for Business B
    const custB = await prisma.customer.create({
      data: { businessId: bizBId, fullName: `Customer B ${ts}`, phoneNumber: '03002222222' },
    });
    orderBNumber = `ORD-B-${ts}`;
    await prisma.order.create({
      data: {
        businessId: bizBId,
        customerId: custB.id,
        orderNumber: orderBNumber,
        subtotal: 9900,
        totalAmount: 9900,
      },
    });
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Owner A sees Business A order in UI, but cannot see Business B order', async ({ page }) => {
    // Login as Owner A
    await page.goto('/login');
    await page.fill('input[type="email"]', ownerAEmail);
    await page.fill('input[type="password"]', ownerAPassword);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*(?:dashboard|orders|conversations|products)/, { timeout: 15000 });

    // Navigate to Orders page
    await page.goto('/orders');

    // Verify Business A Order is visible
    await expect(page.getByText(orderANumber)).toBeVisible({ timeout: 10000 });

    // Verify Business B Order is NOT visible
    await expect(page.getByText(orderBNumber)).not.toBeVisible();
  });

  test('Owner B sees Business B order in UI, but cannot see Business A order', async ({ page }) => {
    // Login as Owner B
    await page.goto('/login');
    await page.fill('input[type="email"]', ownerBEmail);
    await page.fill('input[type="password"]', ownerBPassword);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*(?:dashboard|orders|conversations|products)/, { timeout: 15000 });

    // Navigate to Orders page
    await page.goto('/orders');

    // Verify Business B Order is visible
    await expect(page.getByText(orderBNumber)).toBeVisible({ timeout: 10000 });

    // Verify Business A Order is NOT visible
    await expect(page.getByText(orderANumber)).not.toBeVisible();
  });
});
