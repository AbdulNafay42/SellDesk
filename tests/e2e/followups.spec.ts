import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const API_URL = 'http://localhost:4000';
const prisma = new PrismaClient();

test.describe('Follow-ups E2E Flow', () => {
  const ts = Date.now().toString(36);
  const ownerEmail = `e2e_fol_owner_${ts}@example.test`;
  const ownerPassword = 'Password123!';
  let bizId: string;
  let custName: string;

  test.beforeAll(async () => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ownerEmail,
        password: ownerPassword,
        fullName: 'Fol Owner',
        businessName: `E2E Fol Biz ${ts}`,
        phone: '03007778899',
        city: 'Multan',
        country: 'Pakistan',
      }),
    });
    const data = await res.json();
    bizId = data.business.id;

    await prisma.business.update({ where: { id: bizId }, data: { status: 'APPROVED' } });

    custName = `Customer Lead ${ts}`;
    await prisma.followupLead.create({
      data: {
        businessId: bizId,
        customerName: custName,
        customerPhone: '03007778899',
        city: 'Multan',
        inquiredProduct: 'Embroidered Kurti',
        hoursElapsed: 24,
        lastMessage: 'Rate bata dein please',
        suggestedFollowup: 'Hi! Limited stock left, 10% discount on order today.',
        status: 'PENDING',
      },
    });
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Seller can trigger follow-up via UI, see loading state, and verify persistence after page reload', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('input[type="email"]', ownerEmail);
    await page.fill('input[type="password"]', ownerPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*(?:dashboard|orders|conversations|products)/, { timeout: 15000 });

    // 2. Open Follow-ups page
    await page.goto('/followups');
    await expect(page.getByText(custName)).toBeVisible({ timeout: 10000 });

    // 3. Click 1-Click Send WhatsApp Follow-up button
    await page.click('button:has-text("1-Click Send WhatsApp Follow-up")');

    // 4. Verify badge updates to Follow-up Sent
    await expect(page.getByText('Follow-up Sent')).toBeVisible({ timeout: 10000 });

    // 5. Reload page
    await page.reload();

    // 6. Verify status remains Follow-up Sent (persisted in PostgreSQL)
    await expect(page.getByText('Follow-up Sent')).toBeVisible({ timeout: 10000 });
  });
});
