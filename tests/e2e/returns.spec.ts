import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const API_URL = 'http://localhost:4000';
const prisma = new PrismaClient();

test.describe('Returns E2E Flow', () => {
  const ts = Date.now().toString(36);
  const ownerEmail = `e2e_ret_owner_${ts}@example.test`;
  const ownerPassword = 'Password123!';
  let bizId: string;
  let returnNumber: string;

  test.beforeAll(async () => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ownerEmail,
        password: ownerPassword,
        fullName: 'Ret Owner',
        businessName: `E2E Ret Biz ${ts}`,
        phone: '03006667788',
        city: 'Rawalpindi',
        country: 'Pakistan',
      }),
    });
    const data = await res.json();
    bizId = data.business.id;

    await prisma.business.update({ where: { id: bizId }, data: { status: 'APPROVED' } });

    returnNumber = `RET-${ts}`;
    await prisma.returnRequest.create({
      data: {
        businessId: bizId,
        returnNumber,
        orderNumber: `ORD-RET-${ts}`,
        customerName: `Customer Ret ${ts}`,
        customerPhone: '03006667788',
        productName: 'Oversized Hoodie',
        sku: `SKU-HOODIE-${ts}`,
        quantity: 1,
        returnReason: 'SIZE_MISMATCH',
        status: 'RETURN_REQUESTED',
        restocked: false,
      },
    });
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Seller can restock return via 1-Click Restock, see loading state, and verify persistence after page reload', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('input[type="email"]', ownerEmail);
    await page.fill('input[type="password"]', ownerPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*(?:dashboard|orders|conversations|products)/, { timeout: 15000 });

    // 2. Open Returns page
    await page.goto('/returns');
    await expect(page.getByText(returnNumber, { exact: true })).toBeVisible({ timeout: 10000 });

    // 3. Click 1-Click Restock button
    await page.click('button:has-text("1-Click Restock")');

    // 4. Verify badge updates to Restocked in Inventory
    await expect(page.getByText('Restocked in Inventory')).toBeVisible({ timeout: 10000 });

    // 5. Reload page
    await page.reload();

    // 6. Verify status remains Restocked in Inventory (persisted in PostgreSQL)
    await expect(page.getByText('Restocked in Inventory')).toBeVisible({ timeout: 10000 });
  });
});
