import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:4000';

test.describe('Authentication E2E Flow', () => {
  const ts = Date.now().toString(36);
  const userEmail = `e2e_owner_${ts}@example.test`;
  const userPassword = 'Password123!';
  let userId: string;
  let businessId: string;

  test.beforeAll(async () => {
    // Register user & business via API for deterministic login credentials
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        password: userPassword,
        fullName: 'E2E Owner Auth',
        businessName: `E2E Auth Business ${ts}`,
        phone: '03001112233',
        city: 'Lahore',
        country: 'Pakistan',
      }),
    });
    const data = await res.json();
    userId = data.user.id;
    businessId = data.business.id;

    // Approve business in PostgreSQL via direct DB update
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.business.update({
      where: { id: businessId },
      data: { status: 'APPROVED' },
    });
    await prisma.$disconnect();
  });

  test('User can submit login form, authenticate, access dashboard, and remain authenticated after refresh', async ({ page }) => {
    // 1. Open login page
    await page.goto('/login');
    await expect(page).toHaveURL(/.*login/);

    // 2. Fill in credentials
    await page.fill('input[type="email"]', userEmail);
    await page.fill('input[type="password"]', userPassword);

    // 3. Submit form
    await page.click('button[type="submit"]');

    // 4. Verify login redirection to dashboard
    await expect(page).toHaveURL(/.*(?:dashboard|orders|conversations|products)/, { timeout: 15000 });

    // 5. Verify local storage token / active business exists
    const token = await page.evaluate(() => localStorage.getItem('selldesk_auth_token'));
    expect(token).toBeTruthy();

    // 6. Refresh page and verify session persists
    await page.reload();
    const tokenAfterReload = await page.evaluate(() => localStorage.getItem('selldesk_auth_token'));
    expect(tokenAfterReload).toBe(token);

    // 7. Verify protected content remains accessible
    await expect(page.locator('body')).not.toContainText('Sign in to your account');
  });
});
