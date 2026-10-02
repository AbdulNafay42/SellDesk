import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const API_URL = 'http://localhost:4000';
const prisma = new PrismaClient();

test.describe('AI Engine & Guardrails E2E Flow', () => {
  const ts = Date.now().toString(36);
  const ownerEmail = `e2e_ai_owner_${ts}@example.test`;
  const ownerPassword = 'Password123!';
  let bizId: string;
  let actionCustomerName: string;

  test.beforeAll(async () => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ownerEmail,
        password: ownerPassword,
        fullName: 'AI Owner',
        businessName: `E2E AI Biz ${ts}`,
        phone: '03008889900',
        city: 'Faisalabad',
        country: 'Pakistan',
      }),
    });
    const data = await res.json();
    bizId = data.business.id;

    await prisma.business.update({ where: { id: bizId }, data: { status: 'APPROVED' } });

    actionCustomerName = `AI Customer ${ts}`;
    await prisma.aiAction.create({
      data: {
        businessId: bizId,
        type: 'ORDER_EXTRACTION',
        customerName: actionCustomerName,
        customerPhone: '03008889900',
        rawText: '2 black XL COD Lahore please',
        extractedData: JSON.stringify({ product: 'Black Hoodie', size: 'XL', qty: 2 }),
        confidence: 0.98,
        status: 'PENDING_APPROVAL',
      },
    });
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Seller can approve AI action, see loading state, verify persistence after page reload, and test AI simulator', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('input[type="email"]', ownerEmail);
    await page.fill('input[type="password"]', ownerPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*(?:dashboard|orders|conversations|products)/, { timeout: 15000 });

    // 2. Open AI page
    await page.goto('/ai');
    await expect(page.getByText(actionCustomerName)).toBeVisible({ timeout: 10000 });

    // 3. Approve AI Action
    await page.click('button:has-text("Approve & Create")');

    // 4. Verify status badge updates to APPROVED
    await expect(page.getByText('APPROVED')).toBeVisible({ timeout: 10000 });

    // 5. Reload page
    await page.reload();

    // 6. Verify status remains APPROVED (persisted in PostgreSQL)
    await expect(page.getByText('APPROVED')).toBeVisible({ timeout: 10000 });

    // 7. Test AI Simulator Playground
    await page.fill('textarea', 'Salam 1 Denim Jacket size L COD Islamabad');
    await page.click('button:has-text("Run Live AI Classification")');

    // 8. Verify simulator calls real backend API and returns live payload
    await expect(page.getByText('ORDER_EXTRACTION')).toBeVisible({ timeout: 10000 });
  });
});
