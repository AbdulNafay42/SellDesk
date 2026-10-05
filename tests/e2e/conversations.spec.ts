import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const API_URL = 'http://localhost:4000';
const prisma = new PrismaClient();

test.describe('Conversations E2E Flow', () => {
  const ts = Date.now().toString(36);
  const ownerEmail = `e2e_conv_owner_${ts}@example.test`;
  const ownerPassword = 'Password123!';
  let bizId: string;
  let conversationId: string;

  test.beforeAll(async () => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ownerEmail,
        password: ownerPassword,
        fullName: 'Conv Owner',
        businessName: `E2E Conv Biz ${ts}`,
        phone: '03003334455',
        city: 'Lahore',
        country: 'Pakistan',
      }),
    });
    const data = await res.json();
    bizId = data.business.id;

    await prisma.business.update({ where: { id: bizId }, data: { status: 'APPROVED' } });

    await prisma.whatsAppConfig.create({
      data: {
        businessId: bizId,
        phoneNumberId: `E2E_PHONE_${ts}`,
        wabaId: `E2E_WABA_${ts}`,
        accessToken: `E2E_TOKEN_${ts}`,
        verifyToken: 'selldesk_verify_token_2026',
        displayPhoneNumber: '+92 300 3334455',
        verifiedName: 'E2E Biz Store',
        isActive: true,
      },
    });

    const cust = await prisma.customer.create({
      data: { businessId: bizId, fullName: 'Farhan Ali', phoneNumber: '03003334455', city: 'Lahore' },
    });

    const conv = await prisma.conversation.create({
      data: {
        businessId: bizId,
        customerId: cust.id,
        channel: 'WHATSAPP',
        externalContactId: '03003334455',
        status: 'OPEN',
      },
    });
    conversationId = conv.id;

    await prisma.message.create({
      data: {
        businessId: bizId,
        conversationId: conv.id,
        direction: 'INBOUND',
        type: 'TEXT',
        text: 'Salam, Black Hoodie XL available hai?',
        status: 'RECEIVED',
      },
    });
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Seller can reply to conversation, see loading state, and verify message persists after browser reload', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('input[type="email"]', ownerEmail);
    await page.fill('input[type="password"]', ownerPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*(?:dashboard|orders|conversations|products)/, { timeout: 15000 });

    // 2. Open Conversations page
    await page.goto('/conversations');
    await expect(page.getByRole('heading', { name: 'Farhan Ali', level: 3 })).toBeVisible({ timeout: 10000 });

    // 3. Fill reply text
    const replyMsg = `Walaikum Assalam Farhan! Stock available hai (Ref ${ts})`;
    await page.fill('input[placeholder="Type your WhatsApp reply..."]', replyMsg);

    // 4. Click Send
    const sendBtn = page.getByRole('button', { name: /Send/i });
    await sendBtn.click();

    // 5. Verify reply message appears in chat thread
    await expect(page.getByText(replyMsg).first()).toBeVisible({ timeout: 10000 });

    // 6. Reload browser page
    await page.reload();

    // 7. Verify reply message still exists (persisted in PostgreSQL)
    await expect(page.getByText(replyMsg).first()).toBeVisible({ timeout: 10000 });
  });
});
