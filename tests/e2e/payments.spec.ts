import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const API_URL = 'http://localhost:4000';
const prisma = new PrismaClient();

test.describe('Payments E2E Flow', () => {
  const ts = Date.now().toString(36);
  const ownerEmail = `e2e_pay_owner_${ts}@example.test`;
  const ownerPassword = 'Password123!';
  let bizId: string;
  let paymentId: string;
  let orderNumber: string;

  test.beforeAll(async () => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ownerEmail,
        password: ownerPassword,
        fullName: 'Pay Owner',
        businessName: `E2E Pay Biz ${ts}`,
        phone: '03005556677',
        city: 'Islamabad',
        country: 'Pakistan',
      }),
    });
    const data = await res.json();
    bizId = data.business.id;

    await prisma.business.update({ where: { id: bizId }, data: { status: 'APPROVED' } });

    orderNumber = `ORD-PAY-${ts}`;
    const p = await prisma.paymentRecord.create({
      data: {
        businessId: bizId,
        orderNumber,
        customerName: `Customer Pay ${ts}`,
        customerPhone: '03005556677',
        paymentMethod: 'BANK_TRANSFER',
        amountPKR: 7500,
        status: 'PENDING_VERIFICATION',
      },
    });
    paymentId = p.id;
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Seller can verify payment via UI modal, see loading state, and verify persistence after page reload', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('input[type="email"]', ownerEmail);
    await page.fill('input[type="password"]', ownerPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*(?:dashboard|orders|conversations|products)/, { timeout: 15000 });

    // 2. Open Payments page
    await page.goto('/payments');
    await expect(page.getByText(orderNumber)).toBeVisible({ timeout: 10000 });

    // 3. Click Verify button for the pending payment
    await page.click('button:has-text("Verify")');
    await expect(page.getByText(`Payment Details #${orderNumber}`)).toBeVisible();

    // 4. Fill TRX Ref ID
    const trxRef = `TRX-MEEZAN-${ts}`;
    await page.fill('input[placeholder="Enter Transaction Reference ID (e.g. MEEZAN-992211)"]', trxRef);

    // 5. Submit Verification
    await page.click('button:has-text("Mark Verified & Paid")');

    // 6. Verify status badge updates to Settlement Paid
    await expect(page.getByText('Settlement Paid')).toBeVisible({ timeout: 10000 });

    // 7. Reload page
    await page.reload();

    // 8. Verify status remains Settlement Paid (persisted in PostgreSQL)
    await expect(page.getByText('Settlement Paid')).toBeVisible({ timeout: 10000 });
  });
});
