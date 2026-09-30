const fs = require('fs');
const path = require('path');

function auditPhase4() {
  console.log('====================================================');
  console.log('PHASE 4A — AUDIT OF REMAINING STATIC & MOCK DATA');
  console.log('====================================================\n');

  const findings = [
    {
      module: 'AI Module',
      file: 'apps/api/src/modules/ai/ai.service.ts',
      finding: '`mockPendingActions` static array; `getPendingActions()`, `approveAction()`, `rejectAction()` rely on in-memory mock array.',
      fallbackToBizDefault: '`generateGuardrailedReply()` uses hardcoded `biz-default` to query products.',
      endpoint: 'GET /api/ai/actions, POST /api/ai/actions/:id/approve, POST /api/ai/actions/:id/reject',
      frontendComponent: 'apps/web/src/app/ai/page.tsx (`initialActions` hardcoded array & local state mutation)',
      prismaModelSupport: 'Missing `AiAction` model in `schema.prisma`. Needs a database model for persistence.',
    },
    {
      module: 'Settings Module',
      file: 'apps/api/src/modules/settings/settings.service.ts',
      finding: '`businessStore` and `teamStore` in-memory maps; `getBilling()` has hardcoded invoice `INV-2026-09` for `biz-default`.',
      fallbackToBizDefault: '`businessStore["biz-default"]`, `teamStore["biz-default"]`, `getBilling("biz-default")`.',
      endpoint: 'GET /api/settings/business, PUT /api/settings/business, GET /api/settings/team, POST /api/settings/team/invite, GET /api/settings/billing',
      frontendComponent: 'apps/web/src/app/settings/page.tsx (`initialTeam` hardcoded array & hardcoded billing invoice HTML rows)',
      prismaModelSupport: 'Business profile & Team Members already exist in `Business`, `BusinessMember`, `User` Prisma models! Invoices can use a lightweight `Invoice` or computed billing response from DB counts.',
    },
    {
      module: 'Dead Code Cleanup',
      file: 'apps/api/src/modules/orders/orders.service.ts',
      finding: 'Unused `private mockOrders: any[] = [...]` class field.',
      fallbackToBizDefault: 'Unused `biz-default` references in dead array.',
      endpoint: 'None (findAll, create, updateStatus already use Prisma).',
      frontendComponent: 'None',
      prismaModelSupport: '`Order` model already fully active in PostgreSQL.',
    },
    {
      module: 'Dead Code Cleanup',
      file: 'apps/api/src/modules/conversations/conversations.service.ts',
      finding: 'Unused `private mockConversations: any[] = [...]` class field.',
      fallbackToBizDefault: 'Unused `biz-default` references in dead array.',
      endpoint: 'None (findAll, findOne, sendReply already use Prisma).',
      frontendComponent: 'None',
      prismaModelSupport: '`Conversation` and `Message` models already fully active in PostgreSQL.',
    },
    {
      module: 'Dead Code Cleanup',
      file: 'apps/api/src/modules/customers/customers.service.ts',
      finding: 'Unused `private mockCustomers: any[] = [...]` class field.',
      fallbackToBizDefault: 'Unused `biz-default` references in dead array.',
      endpoint: 'None (findAll, findOne, create already use Prisma).',
      frontendComponent: 'None',
      prismaModelSupport: '`Customer` model already fully active in PostgreSQL.',
    },
  ];

  console.log('AUDIT FINDINGS SUMMARY:\n');
  findings.forEach((item, index) => {
    console.log(`[Item ${index + 1}] ${item.module}`);
    console.log(`  File: ${item.file}`);
    console.log(`  Finding: ${item.finding}`);
    console.log(`  Fallback to biz-default: ${item.fallbackToBizDefault}`);
    console.log(`  Affected Endpoints: ${item.endpoint}`);
    console.log(`  Frontend Page: ${item.frontendComponent}`);
    console.log(`  Prisma Model Support: ${item.prismaModelSupport}\n`);
  });
}

auditPhase4();
