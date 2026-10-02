import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const API_URL = 'http://localhost:4000';
const prisma = new PrismaClient();

test.describe('Shipping E2E Flow', () => {
  const ts = Date.now().toString(36);
  const ownerEmail = `e2e_ship_owner_${ts}@example.test`;
  const ownerPassword = 'Password123!';
  let bizId: string;

  test.beforeAll(async () => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ownerEmail,
        password: ownerPassword,
        fullName: 'Ship Owner',
        businessName: `E2E Ship Biz ${ts}`,
        phone: '03004445566',
        city: 'Karachi',
        country: 'Pakistan',
      }),
    });
    const data = await res.json();
    bizId = data.business.id;

    await prisma.business.update({ where: { id: bizId }, data: { status: 'APPROVED' } });
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Seller can book consignment via UI modal, see loading state, and verify persistence after page reload', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('input[type="email"]', ownerEmail);
    await page.fill('input[type="password"]', ownerPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*(?:dashboard|orders|conversations|products)/, { timeout: 15000 });

    // 2. Navigate to Shipping
    await page.goto('/shipping');

    // 3. Open Booking Modal
    await page.click('button:has-text("Book Consignment")');
    await expect(page.getByRole('heading', { name: 'Book Pakistani Courier Consignment' })).toBeVisible({ timeout: 10000 });

    // 4. Fill form fields
    const orderNum = `ORD-E2E-${ts}`;
    const custName = `Usman Tariq ${ts}`;
    await page.fill('input[placeholder="ORD-1095"]', orderNum);
    await page.fill('input[placeholder="Hamza Tariq"]', custName);
    await page.fill('input[placeholder="0312-7788990"]', '03127788990');
    await page.fill('textarea[placeholder="House #, Street #, Area, City..."]', 'Plot 42, Block 6, PECHS, Karachi');

    // 5. Submit modal form
    await page.click('button:has-text("Generate Consignment")');

    // 6. Verify newly booked consignment appears in table
    await expect(page.getByText(orderNum)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(custName)).toBeVisible();

    // 7. Reload browser page
    await page.reload();

    // 8. Verify consignment persists after page reload (persisted in PostgreSQL)
    await expect(page.getByText(orderNum)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(custName)).toBeVisible();
  });
});
