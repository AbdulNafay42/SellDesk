# SELLDESK COMPLETE PROJECT AUDIT

## 1. Executive Summary

SellDesk is a multi-tenant e-commerce and WhatsApp commerce management platform built on a Next.js (App Router) frontend and a NestJS REST API backend powered by Prisma ORM and PostgreSQL.

This audit provides a comprehensive inventory and data-source analysis across every page, component, API endpoint, backend service, Prisma model, authentication flow, and tenant scoping mechanism in the repository.

### Key Architectural Insights
1. **Hybrid Real / Mock Backend Layer**: While authentication (`User`, `Business`, `BusinessMember`), Orders, Products, Customers, Conversations, Messages, and WhatsAppConfig possess complete Prisma models and active database queries in NestJS services, **10 out of 16 backend services retain fallback in-memory arrays or hardcoded mock data** (e.g., `mockOrders`, `mockProducts`, `mockDevUsers`, `mockMovements`, `payments`, `consignments`, `returns`). When PostgreSQL tables are empty or queries fail, these services silently return fake data to the frontend instead of empty arrays or explicit database errors.
2. **Features Without Database Backing**:
   - **Analytics**: Returns static metric calculations (0 PKR revenue, 0% growth) or hardcoded fallbacks without executing `prisma.order.aggregate` or date-based database grouping.
   - **AI Engine**: Completely operates on in-memory mock actions (`mockPendingActions`) and hardcoded pattern extraction. No OpenAI/LLM integration or Prisma AI action logging exists.
   - **Inventory Sync**: Uses in-memory array `mockMovements` tied to `biz-default`. No Prisma `StockMovement` model exists in `schema.prisma`.
   - **Payments Ledger**: Uses in-memory array `payments` tied to `biz-default`. No Prisma `Payment` model exists in `schema.prisma`.
   - **Shipping & Couriers**: Uses in-memory array `consignments` tied to `biz-default`. No Prisma `Consignment` model exists in `schema.prisma`.
   - **Returns & Exchanges**: Uses in-memory array `returns` tied to `biz-default`. No Prisma `Return` model exists in `schema.prisma`.
   - **Follow-ups**: Uses in-memory array `mockLeads` tied to `biz-default`. No Prisma `Followup` model exists in `schema.prisma`.
   - **Settings (Team, Billing, Profile)**: Uses in-memory records (`businessStore`, `teamStore`) instead of reading from `Business`, `BusinessMember`, and user memberships.
3. **Multi-Tenant Security Isolation**: Multi-tenant protection is strictly implemented at the API boundary via `TenantGuard` (validating JWT user ID against `BusinessMember` table and checking `status === 'APPROVED'`). However, fallback mock services hardcode `biz-default`, meaning un-scoped or mock operations bleed data between tenants if fallback paths trigger.

---

## 2. Architecture Diagram

```text
                               +-----------------------------+
                               |     Next.js Web Client      |
                               | (apps/web - Port 3000/3001) |
                               +--------------+--------------+
                                              |
                                              | HTTP Requests + Bearer JWT + X-Tenant-ID
                                              v
                               +-----------------------------+
                               |    NestJS Backend Engine    |
                               |     (apps/api - Port 4000)  |
                               +--------------+--------------+
                                              |
                     +------------------------+------------------------+
                     |                                                 |
                     v                                                 v
        +-------------------------+                       +-------------------------+
        |  NestJS Guards & Auth   |                       |    In-Memory Mocks /    |
        | JwtAuthGuard, TenantGuard|                      | Hardcoded Fallbacks     |
        +------------+------------+                       | biz-default arrays      |
                     |                                    +------------+------------+
                     v                                                 |
        +-------------------------+                                    | (When DB empty
        |  Prisma ORM Services    |                                    |  or module unbacked)
        | User, Business, Order,  |                                    |
        | Product, Customer, Conv |                                    |
        +------------+------------+                                    |
                     |                                                 |
                     v                                                 v
        +-------------------------+                       +-------------------------+
        |  PostgreSQL Database    |                       | Rendered Dynamic / Mock |
        |  (Active Database Data) |                       | UI Components           |
        +-------------------------+                       +-------------------------+
```

---

## 3. Overall Dynamic vs Static Summary

Based on full codebase analysis:

| Classification | Count | Description |
| -------------- | ----- | ----------- |
| **Fully Dynamic** | 6 | Auth (Register/Login/Me/Memberships), WhatsApp Webhook, Orders (CRUD), Products (CRUD), Customers (CRUD), WhatsApp Config |
| **Mostly Dynamic** | 3 | Admin Portal (DB businesses + shared mock fallback), Conversations (Prisma + mock fallback), Select Tenant (DB + localStorage) |
| **Mixed (Dynamic + Mock/Static)** | 4 | Dashboard (API metrics + static AI widget), Settings (API business profile + hardcoded team/billing), Invite Flow, Signup Pending |
| **Mock / Fake Backed** | 7 | AI Engine, Inventory Sync, Follow-ups, Payments Ledger, Shipping & Couriers, Returns & Exchanges, Analytics |
| **Static Hardcoded** | 1 | Landing Page (`apps/web/src/app/page.tsx` & landing components) |

---

## 4. Complete Route Audit

| Route | Page File | Dynamic/Static | Data Source | API Endpoint | Database Model | Tenant Scoped | Auth Required | Mock Data | Notes |
| ----- | --------- | -------------- | ----------- | ------------ | -------------- | ------------- | ------------- | --------- | ----- |
| `/` | `app/page.tsx` | STATIC | Hardcoded | None | None | NO | NO | YES (Static Copy) | Landing page marketing content |
| `/login` | `app/login/page.tsx` | DYNAMIC | User Input / API | `POST /api/auth/login` | `User`, `BusinessMember` | NO | NO | Fallback mock user if DB fails | Handles auth JWT generation |
| `/signup` | `app/signup/page.tsx` | DYNAMIC | User Input / API | `POST /api/auth/register` | `User`, `Business`, `BusinessMember` | NO | NO | Fallback mock biz if DB fails | Registers pending business |
| `/signup/pending` | `app/signup/pending/page.tsx` | MIXED | URL Params / State | None | None | NO | NO | NO | Pending approval screen |
| `/select-tenant` | `app/select-tenant/page.tsx` | DYNAMIC | Auth Context / API | `GET /api/auth/memberships` | `BusinessMember`, `Business` | YES | YES | Fallback mock memberships | Allows selecting active store |
| `/invite/[token]` | `app/invite/[token]/page.tsx` | DYNAMIC | URL Token / API | `GET /api/auth/invitation/:token`, `POST /api/auth/accept-invite` | `InvitationToken`, `User` | NO | NO | Fallback mock token | Team invitation acceptance |
| `/dashboard` | `app/dashboard/page.tsx` | MIXED | API + Static | `GET /api/analytics/metrics`, `GET /api/orders` | `Order` (if populated) | YES | YES | Hardcoded AI intent activity | Main executive dashboard |
| `/orders` | `app/orders/page.tsx` | DYNAMIC | API / Database | `GET /api/orders`, `POST /api/orders`, `PATCH /api/orders/:id/status` | `Order`, `Customer` | YES | YES | Fallback `mockOrders` | Real order management with mock fallback |
| `/customers` | `app/customers/page.tsx` | DYNAMIC | API / Database | `GET /api/customers`, `POST /api/customers` | `Customer` | YES | YES | Fallback `mockCustomers` | Real customer management with mock fallback |
| `/products` | `app/products/page.tsx` | DYNAMIC | API / Database | `GET /api/products`, `POST /api/products` | `Product`, `ProductVariant` | YES | YES | Fallback `mockProducts` | Product catalog management |
| `/inventory` | `app/inventory/page.tsx` | MOCK | API / In-Memory | `GET /api/inventory/movements`, `POST /api/inventory/movements` | None (In-Memory) | PARTIAL (`biz-default`) | YES | YES (`mockMovements`) | No Prisma inventory movement model |
| `/conversations` | `app/conversations/page.tsx` | DYNAMIC | API / Database | `GET /api/conversations`, `POST /api/conversations/:id/reply` | `Conversation`, `Message` | YES | YES | Fallback `mockConversations` | WhatsApp inbox & live chat |
| `/ai` | `app/ai/page.tsx` | MOCK | API / In-Memory | `POST /api/ai/extract-order`, `POST /api/ai/generate-reply`, `GET /api/ai/actions` | None (In-Memory) | NO | YES | YES (`mockPendingActions`) | AI extraction engine preview |
| `/followups` | `app/followups/page.tsx` | MOCK | API / In-Memory | `GET /api/followups`, `POST /api/followups/:id/trigger` | None (In-Memory) | PARTIAL (`biz-default`) | YES | YES (`mockLeads`) | Abandoned cart recovery leads |
| `/analytics` | `app/analytics/page.tsx` | MOCK | API / Calculation | `GET /api/analytics/metrics` | None (Hardcoded 0) | YES | YES | Hardcoded chart datasets | Analytics dashboard |
| `/payments` | `app/payments/page.tsx` | MOCK | API / In-Memory | `GET /api/payments`, `POST /api/payments/:id/verify` | None (In-Memory) | PARTIAL (`biz-default`) | YES | YES (`payments`) | COD & bank payment verification |
| `/shipping` | `app/shipping/page.tsx` | MOCK | API / In-Memory | `GET /api/shipping`, `POST /api/shipping/book` | None (In-Memory) | PARTIAL (`biz-default`) | YES | YES (`consignments`) | Courier booking & tracking |
| `/returns` | `app/returns/page.tsx` | MOCK | API / In-Memory | `GET /api/returns`, `POST /api/returns/:id/restock` | None (In-Memory) | PARTIAL (`biz-default`) | YES | YES (`returns`) | Returns & exchange management |
| `/settings` | `app/settings/page.tsx` | MIXED | API / Database / In-Memory | `GET /api/settings/business`, `GET /api/whatsapp/config`, `POST /api/whatsapp/config` | `WhatsAppConfig` (DB), `Business` (DB/Mock) | YES | YES | In-memory team/billing | Store profile, team, billing, WhatsApp config |
| `/admin` | `app/admin/page.tsx` | MOSTLY DYNAMIC | API / Database | `GET /api/admin/pending-businesses`, `PATCH /api/admin/businesses/:id/approve` | `Business`, `User` | NO (Global) | YES (`SUPER_ADMIN`) | Shared mock pending biz fallback | Platform administration |

---

## 5. Complete Component Audit

| Component | File Path | Used By | Purpose | Data Source | Dynamic/Static | Tenant Sensitive | Auth Sensitive |
| --------- | --------- | ------- | ------- | ----------- | -------------- | ---------------- | -------------- |
| `DashboardPage` | `components/dashboard/DashboardPage.tsx` | `/dashboard` page | Main dashboard UI | API + Hardcoded AI Widget | MIXED | YES | YES |
| `Sidebar` | `components/layout/Sidebar.tsx` | All dashboard layouts | Main navigation drawer | Hardcoded menu + User Context | MIXED | NO | YES |
| `Header` | `components/layout/Header.tsx` | All dashboard layouts | Top header & store selector | `AuthContext` (Memberships) | DYNAMIC | YES | YES |
| `ClientAuthGuard` | `components/layout/ClientAuthGuard.tsx` | Layout wrapper | Route protection guard | `AuthContext` & `localStorage` | DYNAMIC | YES | YES |
| `HeroSection` | `components/landing/HeroSection.tsx` | Landing page | Hero marketing section | Hardcoded text/images | STATIC | NO | NO |
| `HeroCommandCenter` | `components/landing/HeroCommandCenter.tsx` | Landing page | Mock UI preview | Hardcoded mock stats | STATIC | NO | NO |
| `WorkflowSection` | `components/landing/WorkflowSection.tsx` | Landing page | Workflow step visualizer | Hardcoded copy | STATIC | NO | NO |
| `ProductCapabilitiesSection` | `components/landing/ProductCapabilitiesSection.tsx` | Landing page | Feature grid | Hardcoded feature list | STATIC | NO | NO |
| `OperationsLogisticsSection` | `components/landing/OperationsLogisticsSection.tsx` | Landing page | Operations showcase | Hardcoded text | STATIC | NO | NO |
| `AiHumanControlSection` | `components/landing/AiHumanControlSection.tsx` | Landing page | AI feature showcase | Hardcoded text | STATIC | NO | NO |
| `PricingSection` | `components/landing/PricingSection.tsx` | Landing page | Pricing tier cards | Hardcoded PKR pricing | STATIC | NO | NO |
| `FaqSection` | `components/landing/FaqSection.tsx` | Landing page | FAQ accordion | Hardcoded Q&A | STATIC | NO | NO |
| `FinalCtaSection` | `components/landing/FinalCtaSection.tsx` | Landing page | Bottom call to action | Hardcoded text | STATIC | NO | NO |
| `LandingHeader` | `components/landing/LandingHeader.tsx` | Landing page | Navbar for landing | Hardcoded navigation links | STATIC | NO | NO |
| `LandingFooter` | `components/landing/LandingFooter.tsx` | Landing page | Footer | Hardcoded footer links | STATIC | NO | NO |

---

## 6. Complete API Audit

| Method | Endpoint | Auth Required | TenantGuard | Service Method | DB Model | Tenant Filter | Frontend Used | Mock / Fallback | Protection Level |
| ------ | -------- | ------------- | ----------- | -------------- | -------- | ------------- | ------------- | --------------- | ---------------- |
| `POST` | `/api/auth/register` | NO | NO | `AuthService.register` | `User`, `Business`, `BusinessMember` | N/A | YES (`/signup`) | Fallback `mockDevUsers` | UNPROTECTED (Public) |
| `POST` | `/api/auth/login` | NO | NO | `AuthService.login` | `User`, `BusinessMember` | N/A | YES (`/login`) | Fallback `mockDevUsers` | UNPROTECTED (Public) |
| `GET` | `/api/auth/me` | YES (`JwtAuthGuard`) | NO | `AuthService.getProfile` | `User` | N/A | YES (`AuthContext`) | Fallback `mockDevUsers` | PROTECTED |
| `GET` | `/api/auth/memberships` | YES (`JwtAuthGuard`) | NO | `AuthService.getUserMemberships` | `BusinessMember` | User ID | YES (`AuthContext`) | Fallback `mockMemberships` | PROTECTED |
| `GET` | `/api/auth/invitation/:token` | NO | NO | `AuthService.validateInvitation` | `InvitationToken` | N/A | YES (`/invite/[token]`) | Fallback `sharedMockInvitations` | UNPROTECTED (Public) |
| `POST` | `/api/auth/accept-invite` | NO | NO | `AuthService.acceptInvitation` | `InvitationToken`, `User` | N/A | YES (`/invite/[token]`) | Fallback `sharedMockInvitations` | UNPROTECTED (Public) |
| `GET` | `/api/orders` | YES (`JwtAuthGuard`) | YES (`TenantGuard`) | `OrdersService.findAll` | `Order` | `businessId` | YES (`/orders`, `/dashboard`) | Fallback `mockOrders` | PROTECTED |
| `POST` | `/api/orders` | YES (`JwtAuthGuard`) | YES (`TenantGuard`) | `OrdersService.create` | `Order` | `businessId` | YES (`/orders`) | Fallback `mockOrders` | PROTECTED |
| `PATCH` | `/api/orders/:id/status` | YES (`JwtAuthGuard`) | YES (`TenantGuard`) | `OrdersService.updateStatus` | `Order` | `businessId` | YES (`/orders`) | Fallback `mockOrders` | PROTECTED |
| `GET` | `/api/customers` | YES (`JwtAuthGuard`) | YES (`TenantGuard`) | `CustomersService.findAll` | `Customer` | `businessId` | YES (`/customers`) | Fallback `mockCustomers` | PROTECTED |
| `GET` | `/api/customers/:id` | YES (`JwtAuthGuard`) | YES (`TenantGuard`) | `CustomersService.findOne` | `Customer` | `businessId` | YES (`/customers`) | Fallback `mockCustomers` | PROTECTED |
| `POST` | `/api/customers` | YES (`JwtAuthGuard`) | YES (`TenantGuard`) | `CustomersService.create` | `Customer` | `businessId` | YES (`/customers`) | Fallback `mockCustomers` | PROTECTED |
| `GET` | `/api/products` | YES (`JwtAuthGuard`) | YES (`TenantGuard`) | `ProductsService.findAll` | `Product` | `businessId` | YES (`/products`) | Fallback `mockProducts` | PROTECTED |
| `GET` | `/api/products/:id` | YES (`JwtAuthGuard`) | YES (`TenantGuard`) | `ProductsService.findOne` | `Product` | `businessId` | YES (`/products`) | Fallback `mockProducts` | PROTECTED |
| `POST` | `/api/products` | YES (`JwtAuthGuard`) | YES (`TenantGuard`) | `ProductsService.create` | `Product` | `businessId` | YES (`/products`) | Fallback `mockProducts` | PROTECTED |
| `GET` | `/api/conversations` | YES (`JwtAuthGuard`) | YES (`TenantGuard`) | `ConversationsService.findAll` | `Conversation`, `Message` | `businessId` | YES (`/conversations`) | Fallback `mockConversations` | PROTECTED |
| `GET` | `/api/conversations/:id` | YES (`JwtAuthGuard`) | YES (`TenantGuard`) | `ConversationsService.findOne` | `Conversation` | `businessId` | YES (`/conversations`) | Fallback `mockConversations` | PROTECTED |
| `POST` | `/api/conversations/:id/reply` | YES (`JwtAuthGuard`) | YES (`TenantGuard`) | `ConversationsService.sendReply` | `Message` | `businessId` | YES (`/conversations`) | Fallback `mockConversations` | PROTECTED |
| `GET` | `/api/inventory/movements` | YES (`JwtAuthGuard`) | YES (`TenantGuard`) | `InventoryService.getMovements` | None | `biz-default` fallback | YES (`/inventory`) | Pure Mock (`mockMovements`) | PARTIALLY PROTECTED |
| `POST` | `/api/inventory/movements` | YES (`JwtAuthGuard`) | YES (`TenantGuard`) | `InventoryService.recordMovement` | None | `biz-default` fallback | YES (`/inventory`) | Pure Mock (`mockMovements`) | PARTIALLY PROTECTED |
| `GET` | `/api/followups` | YES (`JwtAuthGuard`) | YES (`TenantGuard`) | `FollowupsService.getLeads` | None | `biz-default` fallback | YES (`/followups`) | Pure Mock (`mockLeads`) | PARTIALLY PROTECTED |
| `POST` | `/api/followups/:id/trigger` | YES (`JwtAuthGuard`) | YES (`TenantGuard`) | `FollowupsService.triggerFollowup` | None | `biz-default` fallback | YES (`/followups`) | Pure Mock (`mockLeads`) | PARTIALLY PROTECTED |
| `GET` | `/api/payments` | YES (`JwtAuthGuard`) | YES (`TenantGuard`) | `PaymentsService.findAll` | None | `biz-default` fallback | YES (`/payments`) | Pure Mock (`payments`) | PARTIALLY PROTECTED |
| `POST` | `/api/payments/:id/verify` | YES (`JwtAuthGuard`) | YES (`TenantGuard`) | `PaymentsService.verifyPayment` | None | `biz-default` fallback | YES (`/payments`) | Pure Mock (`payments`) | PARTIALLY PROTECTED |
| `GET` | `/api/shipping` | YES (`JwtAuthGuard`) | YES (`TenantGuard`) | `ShippingService.findAll` | None | `biz-default` fallback | YES (`/shipping`) | Pure Mock (`consignments`) | PARTIALLY PROTECTED |
| `POST` | `/api/shipping/book` | YES (`JwtAuthGuard`) | YES (`TenantGuard`) | `ShippingService.bookConsignment` | None | `biz-default` fallback | YES (`/shipping`) | Pure Mock (`consignments`) | PARTIALLY PROTECTED |
| `GET` | `/api/returns` | YES (`JwtAuthGuard`) | YES (`TenantGuard`) | `ReturnsService.findAll` | None | `biz-default` fallback | YES (`/returns`) | Pure Mock (`returns`) | PARTIALLY PROTECTED |
| `POST` | `/api/returns/:id/restock` | YES (`JwtAuthGuard`) | YES (`TenantGuard`) | `ReturnsService.restock` | None | `biz-default` fallback | YES (`/returns`) | Pure Mock (`returns`) | PARTIALLY PROTECTED |
| `GET` | `/api/analytics/metrics` | YES (`JwtAuthGuard`) | YES (`TenantGuard`) | `AnalyticsService.getMetrics` | None | None | YES (`/analytics`, `/dashboard`) | Hardcoded zeros | PARTIALLY PROTECTED |
| `GET` | `/api/settings/business` | YES (`JwtAuthGuard`) | YES (`TenantGuard`) | `SettingsService.getBusinessProfile` | None | `biz-default` fallback | YES (`/settings`) | Hardcoded (`businessStore`) | PARTIALLY PROTECTED |
| `PUT` | `/api/settings/business` | YES (`JwtAuthGuard`) | YES (`TenantGuard`) | `SettingsService.updateBusinessProfile` | None | `biz-default` fallback | YES (`/settings`) | Hardcoded (`businessStore`) | PARTIALLY PROTECTED |
| `GET` | `/api/settings/team` | YES (`JwtAuthGuard`) | YES (`TenantGuard`) | `SettingsService.getTeamMembers` | None | `biz-default` fallback | YES (`/settings`) | Hardcoded (`teamStore`) | PARTIALLY PROTECTED |
| `GET` | `/api/whatsapp/config` | YES (`JwtAuthGuard`) | YES (`TenantGuard`) | `WhatsAppService.getTenantConfig` | `WhatsAppConfig` | `businessId` | YES (`/settings`) | Fallback `mockConfigs` | PROTECTED |
| `POST` | `/api/whatsapp/config` | YES (`JwtAuthGuard`) | YES (`TenantGuard`) | `WhatsAppService.saveTenantConfig` | `WhatsAppConfig` | `businessId` | YES (`/settings`) | Fallback `mockConfigs` | PROTECTED |
| `GET` | `/api/whatsapp/webhook` | NO | NO | `WhatsAppService.verifyWebhook` | None | Verification Token | YES (Meta Cloud API) | NO | UNPROTECTED (Public Webhook) |
| `POST` | `/api/whatsapp/webhook` | NO | NO | `WhatsAppService.handleWebhookPayload` | `Business`, `Customer`, `Conversation`, `Message` | `phoneNumberId` | YES (Meta Cloud API) | Fallback mock map | UNPROTECTED (Public Webhook) |
| `GET` | `/api/admin/pending-businesses` | YES (`JwtAuthGuard`, `SuperAdminGuard`) | NO | `AdminService.getPendingBusinesses` | `Business` | Platform Global | YES (`/admin`) | Shared mock pending biz | PROTECTED (`SUPER_ADMIN`) |
| `PATCH` | `/api/admin/businesses/:id/approve` | YES (`JwtAuthGuard`, `SuperAdminGuard`) | NO | `AdminService.approveBusiness` | `Business` | Platform Global | YES (`/admin`) | Shared mock pending biz | PROTECTED (`SUPER_ADMIN`) |
| `PATCH` | `/api/admin/businesses/:id/reject` | YES (`JwtAuthGuard`, `SuperAdminGuard`) | NO | `AdminService.rejectBusiness` | `Business` | Platform Global | YES (`/admin`) | Shared mock pending biz | PROTECTED (`SUPER_ADMIN`) |
| `GET` | `/api/admin/metrics` | YES (`JwtAuthGuard`, `SuperAdminGuard`) | NO | `AdminService.getMetrics` | `Business`, `Order` | Platform Global | YES (`/admin`) | Hardcoded metrics if empty | PROTECTED (`SUPER_ADMIN`) |
| `POST` | `/api/ai/extract-order` | NO | NO | `AiService.extractOrder` | None | None | YES (`/ai`) | Hardcoded Regex Matcher | UNPROTECTED |
| `POST` | `/api/ai/generate-reply` | NO | NO | `AiService.generateGuardrailedReply` | None | None | YES (`/ai`) | Hardcoded Guardrail Reply | UNPROTECTED |
| `GET` | `/api/ai/actions` | NO | NO | `AiService.getPendingActions` | None | None | YES (`/ai`) | Pure Mock (`mockPendingActions`) | UNPROTECTED |

---

## 7. Complete Database Audit

| Model Name | Purpose | Primary Key | Foreign Keys / Relations | Tenant-Owned | Prisma Schema Enforced | Application Enforced | Risk Rating |
| ---------- | ------- | ----------- | ------------------------ | ------------ | ---------------------- | -------------------- | ----------- |
| `User` | Platform user accounts | `id` (UUID) | `memberships`, `invitations` | USER-OWNED | N/A | Global Auth | LOW |
| `Business` | Registered seller tenant stores | `id` (UUID) | `members`, `products`, `customers`, `orders`, `conversations`, `whatsAppConfig` | GLOBAL / TENANT ROOT | Unique `slug` | Approved status check | LOW |
| `BusinessMember` | User to Business membership join table | `id` (UUID) | `userId` (`User`), `businessId` (`Business`) | TENANT-OWNED | `@@unique([userId, businessId])` | `TenantGuard` validation | LOW |
| `InvitationToken` | Team invite tokens | `id` (UUID) | `userId` (`User`), `businessId` (`Business`) | TENANT-OWNED | Unique `token` | AuthService validation | LOW |
| `Category` | Product category catalog | `id` (UUID) | `products` | GLOBAL | None | Category filter | MEDIUM (Missing `businessId`) |
| `Product` | Items sold by store | `id` (UUID) | `businessId` (`Business`), `categoryId` (`Category`) | TENANT-OWNED | `@@index([businessId])` | Service WHERE clause | LOW |
| `ProductVariant` | Size/color product variations | `id` (UUID) | `productId` (`Product`) | TENANT-OWNED (via Product) | Unique `sku`, `@@index([productId])` | Product relation | LOW |
| `Customer` | WhatsApp buyer contacts | `id` (UUID) | `businessId` (`Business`) | TENANT-OWNED | `@@index([businessId, phoneNumber])` | Service WHERE clause | LOW |
| `Order` | Placed customer orders | `id` (UUID) | `businessId` (`Business`), `customerId` (`Customer`) | TENANT-OWNED | Unique `orderNumber`, `@@index([businessId])` | Service WHERE clause | LOW |
| `WhatsAppConfig` | Meta Cloud API credentials | `id` (UUID) | `businessId` (`Business`) | TENANT-OWNED | Unique `businessId`, `phoneNumberId` | Service lookup | LOW |
| `Conversation` | WhatsApp chat threads | `id` (UUID) | `businessId` (`Business`), `customerId` (`Customer`) | TENANT-OWNED | `@@unique([businessId, channel, externalContactId])` | Service WHERE clause | LOW |
| `Message` | Inbound/Outbound chat messages | `id` (UUID) | `businessId` (`Business`), `conversationId` (`Conversation`) | TENANT-OWNED | `@@unique([businessId, externalMessageId])` | Service WHERE clause | LOW |

---

## 8. Feature-by-Feature Audit

### 1. Authentication & Registration
- **Frontend**: `/login`, `/signup`, `/select-tenant`, `/invite/[token]`
- **Backend**: `AuthModule` (`auth.controller.ts`, `auth.service.ts`)
- **Database**: `User`, `Business`, `BusinessMember`, `InvitationToken` models fully wired.
- **Dynamic Status**: FULLY DYNAMIC. Registration creates User + Business + BusinessMember in PostgreSQL. Login returns signed JWT.
- **Mock Fallback**: If PostgreSQL database connection fails, `auth.service.ts` falls back to in-memory `mockDevUsers` array.

### 2. Dashboard
- **Frontend**: `/dashboard` (`DashboardPage.tsx`)
- **Backend**: `/api/analytics/metrics`, `/api/orders`
- **Database**: `Order` model.
- **Dynamic Status**: MIXED. Fetches dynamic order list and metrics, but metrics service currently returns hardcoded growth percentage (`revenueGrowthPercent: 0`), and right sidebar contains static AI widget cards.

### 3. Orders Management
- **Frontend**: `/orders` (`apps/web/src/app/orders/page.tsx`)
- **Backend**: `OrdersModule` (`orders.controller.ts`, `orders.service.ts`)
- **Database**: `Order` model backed by PostgreSQL.
- **Dynamic Status**: MOSTLY DYNAMIC. Creates, lists, and updates orders in DB.
- **Mock Fallback**: If DB returns 0 orders or query throws error, falls back to rendering `mockOrders` array.

### 4. Customers Management
- **Frontend**: `/customers` (`apps/web/src/app/customers/page.tsx`)
- **Backend**: `CustomersModule` (`customers.controller.ts`, `customers.service.ts`)
- **Database**: `Customer` model backed by PostgreSQL.
- **Dynamic Status**: MOSTLY DYNAMIC.
- **Mock Fallback**: Falls back to rendering `mockCustomers` array when DB is empty/unconnected.

### 5. Products Catalog
- **Frontend**: `/products` (`apps/web/src/app/products/page.tsx`)
- **Backend**: `ProductsModule` (`products.controller.ts`, `products.service.ts`)
- **Database**: `Product`, `ProductVariant` models backed by PostgreSQL.
- **Dynamic Status**: MOSTLY DYNAMIC.
- **Mock Fallback**: Falls back to `mockProducts` array when DB is empty.

### 6. Inventory Sync
- **Frontend**: `/inventory` (`apps/web/src/app/inventory/page.tsx`)
- **Backend**: `InventoryModule` (`inventory.controller.ts`, `inventory.service.ts`)
- **Database**: NONE. No `StockMovement` model in `schema.prisma`.
- **Dynamic Status**: MOCK. Operates on in-memory array `mockMovements` hardcoded to `biz-default`.

### 7. Conversations & WhatsApp Inbox
- **Frontend**: `/conversations` (`apps/web/src/app/conversations/page.tsx`)
- **Backend**: `ConversationsModule`, `WhatsAppModule`
- **Database**: `Conversation`, `Message`, `WhatsAppConfig` models.
- **Dynamic Status**: MOSTLY DYNAMIC. Real webhooks from Meta Cloud API auto-create Conversations and Messages in PostgreSQL.
- **Mock Fallback**: `conversations.service.ts` falls back to `mockConversations` array if DB contains no records.

### 8. AI Engine
- **Frontend**: `/ai` (`apps/web/src/app/ai/page.tsx`)
- **Backend**: `AiModule` (`ai.controller.ts`, `ai.service.ts`)
- **Database**: NONE.
- **Dynamic Status**: MOCK. Uses in-memory array `mockPendingActions` and client-side regex matcher.

### 9. Follow-ups (Abandoned Carts)
- **Frontend**: `/followups` (`apps/web/src/app/followups/page.tsx`)
- **Backend**: `FollowupsModule` (`followups.controller.ts`, `followups.service.ts`)
- **Database**: NONE.
- **Dynamic Status**: MOCK. Uses in-memory array `mockLeads` hardcoded to `biz-default`.

### 10. Analytics
- **Frontend**: `/analytics` (`apps/web/src/app/analytics/page.tsx`)
- **Backend**: `AnalyticsModule` (`analytics.controller.ts`, `analytics.service.ts`)
- **Database**: NONE. Does not query Prisma `Order` aggregations.
- **Dynamic Status**: MOCK / STATIC. Returns zero metrics and static chart structures.

### 11. Payments Ledger
- **Frontend**: `/payments` (`apps/web/src/app/payments/page.tsx`)
- **Backend**: `PaymentsModule` (`payments.controller.ts`, `payments.service.ts`)
- **Database**: NONE.
- **Dynamic Status**: MOCK. Uses in-memory array `payments` hardcoded to `biz-default`.

### 12. Shipping & Couriers
- **Frontend**: `/shipping` (`apps/web/src/app/shipping/page.tsx`)
- **Backend**: `ShippingModule` (`shipping.controller.ts`, `shipping.service.ts`)
- **Database**: NONE.
- **Dynamic Status**: MOCK. Uses in-memory array `consignments` hardcoded to `biz-default`.

### 13. Returns & Exchanges
- **Frontend**: `/returns` (`apps/web/src/app/returns/page.tsx`)
- **Backend**: `ReturnsModule` (`returns.controller.ts`, `returns.service.ts`)
- **Database**: NONE.
- **Dynamic Status**: MOCK. Uses in-memory array `returns` hardcoded to `biz-default`.

### 14. Settings (Profile, Team, Billing, WhatsApp Config)
- **Frontend**: `/settings` (`apps/web/src/app/settings/page.tsx`)
- **Backend**: `SettingsModule`, `WhatsAppModule`
- **Database**: `WhatsAppConfig` (DB backed). Business Profile, Team, and Billing use in-memory objects (`businessStore`, `teamStore`).
- **Dynamic Status**: MIXED. WhatsApp Cloud API configuration saves to PostgreSQL; profile & team settings save to in-memory JS variables.

### 15. Super Admin Portal
- **Frontend**: `/admin` (`apps/web/src/app/admin/page.tsx`)
- **Backend**: `AdminModule` (`admin.controller.ts`, `admin.service.ts`)
- **Database**: `Business`, `User` models.
- **Dynamic Status**: MOSTLY DYNAMIC. Fetches pending business approvals from DB.
- **Mock Fallback**: If DB pending businesses array is empty, falls back to `sharedMockPendingBusinesses` in-memory array.

---

## 9. Hardcoded Data Report

| File Path | Variable / Symbol | Description / Data Contained | Reaches UI? | Leak / Scope Risk |
| --------- | ----------------- | ---------------------------- | ----------- | ----------------- |
| `apps/web/src/components/layout/Sidebar.tsx` | `navigation` array | Hardcoded notification badges (`Orders: 12`, `Follow-ups: 27`, `Payments: 2`) | YES | Displayed to all logged-in users regardless of store |
| `apps/web/src/components/layout/Header.tsx` | Header status badge | `WhatsApp Cloud API Connected` badge | YES | Always shows connected even if tenant has no config |
| `apps/web/src/components/dashboard/DashboardPage.tsx` | AI Intent Widget | Hardcoded sample extractions (`2 black XL COD Lahore`) | YES | Static preview widget on tenant dashboard |
| `apps/api/src/modules/settings/settings.service.ts` | `businessStore` | Static profile for `SellDesk Apparels PK` (`biz-default`) | YES | Returns hardcoded store profile if active tenant ID is unrecognised |
| `apps/api/src/modules/settings/settings.service.ts` | `teamStore` | Static team member list (`Abdul Nafay`, `Sarah Khan`) | YES | Returns hardcoded team list for `biz-default` |
| `apps/api/src/modules/followups/followups.service.ts` | `mockLeads` | Sample Pakistani leads (`Hamza Tariq`, `Sana Malik`, `Bilal Ahmed`) | YES | Serves static abandoned cart leads |
| `apps/api/src/modules/inventory/inventory.service.ts` | `mockMovements` | Sample stock adjustments (`HD-BLK-XL`, `JKT-VNT-M`) | YES | Serves static stock movements |
| `apps/api/src/modules/payments/payments.service.ts` | `payments` | Sample payments (`ORD-1089`, `ORD-1090`) | YES | Serves static payment ledger |
| `apps/api/src/modules/shipping/shipping.service.ts` | `consignments` | Sample couriers (`TRX-99882211` - TRAX, Leopard) | YES | Serves static courier consignments |
| `apps/api/src/modules/returns/returns.service.ts` | `returns` | Sample returns (`RET-8801`, `RET-8802`) | YES | Serves static return requests |

---

## 10. Mock Data Report

| File Path | Mock Symbol Name | Production Path / Trigger | Can Authenticated Users See It? | Cross-Tenant Leak Risk |
| --------- | ---------------- | ------------------------- | ------------------------------ | --------------------- |
| `apps/api/src/modules/auth/auth.service.ts` | `mockDevUsers` | Triggered when DB user search fails | YES (If DB query fails) | HIGH (Shares mock credentials) |
| `apps/api/src/modules/admin/admin.service.ts` | `sharedMockPendingBusinesses` | Triggered when DB pending list is empty | YES (Super Admin sees mock stores) | MEDIUM (Mock businesses intermingled with DB stores) |
| `apps/api/src/modules/orders/orders.service.ts` | `mockOrders` | Triggered when DB order query fails | YES (Seller sees fake orders) | HIGH (`biz-default` fallback leaks to all tenants) |
| `apps/api/src/modules/products/products.service.ts` | `mockProducts` | Triggered when DB product query fails | YES (Seller sees fake catalog) | HIGH (`biz-default` fallback leaks to all tenants) |
| `apps/api/src/modules/customers/customers.service.ts` | `mockCustomers` | Triggered when DB customer query fails | YES (Seller sees fake customers) | HIGH (`biz-default` fallback leaks to all tenants) |
| `apps/api/src/modules/conversations/conversations.service.ts` | `mockConversations` | Triggered when DB conversation query fails | YES (Seller sees fake chats) | HIGH (`biz-default` fallback leaks to all tenants) |

---

## 11. LocalStorage / SessionStorage Report

| Storage Mechanism | Key Name | Stored Value | Written By | Read By | Purpose | Security / Tenant Risk |
| ----------------- | -------- | ------------ | ---------- | ------- | ------- | --------------------- |
| `localStorage` | `selldesk_auth_token` | JWT Bearer String | `AuthContext.tsx` (login) | `api.ts` (apiFetch) | Authentication bearer token | LOW (Standard JWT storage) |
| `localStorage` | `selldesk_active_tenant_id` | Business UUID String | `AuthContext.tsx` (selectBusiness) | `api.ts` (`X-Tenant-ID` header) | Active tenant context | HIGH if trusted blindly; LOW because `TenantGuard` validates membership on NestJS server |

---

## 12. Authentication Audit

```text
Registration Flow:
User Input (/signup) -> POST /api/auth/register -> AuthService.register -> Prisma User.create & Business.create & BusinessMember.create (Role: OWNER) -> Return JWT

Login Flow:
User Input (/login) -> POST /api/auth/login -> AuthService.login -> Validate bcrypt -> Sign JWT with { sub: user.id, email, platformRole } -> Save token to localStorage

Session Restoration & Tenant Selection:
App Load -> AuthContext init -> GET /api/auth/me (Bearer JWT) -> GET /api/auth/memberships -> Match selldesk_active_tenant_id with memberships -> Set activeBusiness state
```

- **Enforcement Status**:
  - Frontend: `ClientAuthGuard.tsx` protects routes; redirects to `/login` if no token.
  - Backend: `JwtAuthGuard` (Passport JWT Strategy) verifies Bearer token on protected API endpoints.

---

## 13. Tenant Isolation Audit

```text
Tenant Scoping Execution Chain:
Client Request -> X-Tenant-ID Header -> JwtAuthGuard (Validates User) -> TenantGuard (Validates User Membership in BusinessMember table AND Business status === 'APPROVED') -> Request.tenantId attached -> Service execution -> Prisma query with where: { businessId: req.tenantId }
```

- **Isolation Evaluation**:
  - **Prisma-backed modules** (`orders`, `products`, `customers`, `conversations`, `whatsapp`): STRICTLY TENANT ISOLATED when querying database.
  - **Mock-backed modules** (`inventory`, `followups`, `payments`, `shipping`, `returns`, `settings`): WEAK ISOLATION. They rely on in-memory `.filter(x => x.businessId === tenantId)` against arrays pre-populated with `biz-default`.

---

## 14. Super Admin Audit

- **Route**: `/admin`
- **Controller Guard**: `@UseGuards(JwtAuthGuard, SuperAdminGuard)`
- **Data Source Breakdown**:
  - Pending Store Registrations: PostgreSQL `Business` table (`status: PENDING`) + Fallback `sharedMockPendingBusinesses`.
  - Approve / Reject / Suspend Actions: Modifies `Business.status` in PostgreSQL DB.
  - Platform Stats (MRR, Total Volume, Active Stores): Calculated dynamically from PostgreSQL `Business` and `Order` tables when populated; defaults to fallback calculations if DB records are sparse.

---

## 15. Business Selector Audit

- **Route**: `/select-tenant` & Header Dropdown
- **Data Source**: PostgreSQL `BusinessMember` join table via `GET /api/auth/memberships`.
- **Validation**: Backend `TenantGuard` checks every incoming `X-Tenant-ID` against the user's `BusinessMember` records in PostgreSQL. If a user manually changes `localStorage.selldesk_active_tenant_id` to a business ID they do not belong to, `TenantGuard` throws `403 Forbidden`.

---

## 16. Dashboard Audit

| Metric / Widget | Displayed Value Source | API Endpoint | Service Method | DB Query / Source | Fallback / Mock Source |
| --------------- | ---------------------- | ------------ | -------------- | ----------------- | ---------------------- |
| **Total Sales** | `mRes.grossRevenuePKR` | `GET /api/analytics/metrics` | `AnalyticsService.getMetrics` | Dynamic calculation when orders exist | Hardcoded 0 PKR default |
| **Orders Count** | `mRes.totalOrdersCount` | `GET /api/analytics/metrics` | `AnalyticsService.getMetrics` | Dynamic count when orders exist | Hardcoded 0 Orders default |
| **Recent Orders Table** | `oRes` array | `GET /api/orders` | `OrdersService.findAll` | PostgreSQL `prisma.order.findMany` | Fallback `mockOrders` array |
| **AI Intent Activity** | Static List | None (Client Component) | N/A | None | Hardcoded text cards |

---

## 17. WhatsApp Audit

- **Controller**: `apps/api/src/modules/whatsapp/whatsapp.controller.ts`
- **Webhook Handlers**:
  - `GET /api/whatsapp/webhook`: Meta Cloud API Verification challenge handler.
  - `POST /api/whatsapp/webhook`: Inbound Webhook Event Processor.
- **Data Flow**:
  1. Meta Cloud API sends Webhook payload -> `whatsapp.controller.ts`
  2. Resolves `phoneNumberId` to `WhatsAppConfig` record in PostgreSQL to find `businessId`.
  3. Finds or creates `Customer` by phone number.
  4. Finds or creates `Conversation` thread.
  5. Saves inbound `Message` into PostgreSQL DB.
- **Status**: **FULLY DYNAMIC DB-BACKED** (Has in-memory Map fallback only for disconnected dev environments).

---

## 18. AI Audit

- **Controller**: `apps/api/src/modules/ai/ai.controller.ts`
- **Engine Logic**:
  - `extractOrder`: Uses JavaScript regular expressions to extract SKU, quantity, and city from raw text.
  - `generateGuardrailedReply`: Returns template responses based on extracted fields.
  - `getPendingActions`: Returns in-memory array `mockPendingActions`.
- **Database Persistence**: NONE. No database tables exist for AI actions or prompts.

---

## 19. Security Findings

| Finding ID | Severity | Module / File | Description | Impact |
| ---------- | -------- | ------------- | ----------- | ------ |
| **SEC-01** | HIGH | Backend Fallback Services | Services (`orders`, `products`, `customers`, `conversations`) fall back to returning `biz-default` mock data when PostgreSQL returns empty results. | Authenticated users in real stores see demo store data when their catalog/orders are empty. |
| **SEC-02** | MEDIUM | Unbacked Modules (`inventory`, `payments`, `shipping`, `returns`, `followups`) | Modules rely entirely on in-memory JS arrays. | Data modifications in these modules are lost on server restart and lack DB-level constraint enforcement. |
| **SEC-03** | LOW | `Sidebar.tsx` | Navigation badges (`12 Orders`, `27 Follow-ups`, `2 Payments`) are hardcoded constants. | Visual inconsistency between navigation badges and actual tenant DB counts. |

---

## 20. Data Flow Problems

1. **Empty DB Fallback Ambiguity**: When a new store owner signs up and views their empty Orders/Products page, backend services trigger mock fallbacks, rendering demo items instead of an empty state.
2. **Unbacked Operational Modules**: Inventory, Payments, Shipping, Returns, and Follow-ups do not write to PostgreSQL.
3. **Analytics Metrics Disconnect**: `/analytics` endpoint does not perform aggregations over the Prisma `Order` model.

---

## 21. Dynamic/Static Master Matrix

| Component / Feature | Classification | Data Source | API Endpoint | DB Model | Hardcoded Data | Mock Fallback | Tenant Isolated | Auth Protected |
| ------------------- | -------------- | ----------- | ------------ | -------- | -------------- | ------------- | --------------- | -------------- |
| **Auth System** | DYNAMIC | PostgreSQL | `/api/auth/*` | `User`, `BusinessMember` | NO | Dev Fallback | YES | YES |
| **Orders Module** | DYNAMIC / MOCK | PostgreSQL / Array | `/api/orders` | `Order` | NO | `mockOrders` | YES | YES |
| **Products Module** | DYNAMIC / MOCK | PostgreSQL / Array | `/api/products` | `Product` | NO | `mockProducts` | YES | YES |
| **Customers Module** | DYNAMIC / MOCK | PostgreSQL / Array | `/api/customers` | `Customer` | NO | `mockCustomers` | YES | YES |
| **Conversations** | DYNAMIC / MOCK | PostgreSQL / Array | `/api/conversations` | `Conversation` | NO | `mockConversations` | YES | YES |
| **WhatsApp Config** | DYNAMIC | PostgreSQL | `/api/whatsapp/config` | `WhatsAppConfig` | NO | Map Fallback | YES | YES |
| **Super Admin** | DYNAMIC / MOCK | PostgreSQL / Array | `/api/admin/*` | `Business` | NO | Shared Mock | YES (Platform) | YES |
| **Inventory** | MOCK | In-Memory Array | `/api/inventory/*` | None | NO | `mockMovements` | PARTIAL | YES |
| **Follow-ups** | MOCK | In-Memory Array | `/api/followups/*` | None | NO | `mockLeads` | PARTIAL | YES |
| **Payments** | MOCK | In-Memory Array | `/api/payments/*` | None | NO | `payments` | PARTIAL | YES |
| **Shipping** | MOCK | In-Memory Array | `/api/shipping/*` | None | NO | `consignments` | PARTIAL | YES |
| **Returns** | MOCK | In-Memory Array | `/api/returns/*` | None | NO | `returns` | PARTIAL | YES |
| **AI Engine** | MOCK | In-Memory / Regex | `/api/ai/*` | None | Regex Copy | `mockPendingActions`| NO | YES |
| **Analytics** | STATIC / MOCK | Calculation | `/api/analytics/*` | None | Hardcoded 0 | Static Arrays | YES | YES |
| **Landing Page** | STATIC | Hardcoded TSX | None | None | Marketing Text | NO | NO | NO |

---

## 22. Recommended Architecture (Target State)

```text
                               +-----------------------------+
                               |     Next.js Web Client      |
                               +--------------+--------------+
                                              |
                                              | REST / JSON + Bearer JWT + X-Tenant-ID
                                              v
                               +-----------------------------+
                               |    NestJS REST Controller   |
                               +--------------+--------------+
                                              |
                                              v
                               +-----------------------------+
                               |    TenantGuard Security     |
                               | (Validates Membership & DB) |
                               +--------------+--------------+
                                              |
                                              v
                               +-----------------------------+
                               |     Prisma ORM Services     |
                               |  (100% PostgreSQL Backed)   |
                               |  NO MOCK FALLBACK ON EMPTY  |
                               +--------------+--------------+
                                              |
                                              v
                               +-----------------------------+
                               |     PostgreSQL Database     |
                               |  User, Business, Member,    |
                               |  Order, Product, Customer,  |
                               |  StockMovement, Payment,    |
                               |  Consignment, Return, Lead  |
                               +-----------------------------+
```

---

## 23. Recommended Fix Order

1. **Remove Silent Mock Fallbacks in DB-Backed Modules**: Modify `orders.service.ts`, `products.service.ts`, `customers.service.ts`, `conversations.service.ts` so that empty database query results return empty arrays (`[]`) rather than triggering demo mock data.
2. **Add Missing Prisma Models to `schema.prisma`**:
   - `StockMovement` (for Inventory)
   - `Payment` (for Payments Ledger)
   - `Consignment` (for Shipping)
   - `Return` (for Returns & Exchanges)
   - `FollowupLead` (for Abandoned Cart Follow-ups)
3. **Connect Unbacked Backend Services to Prisma**: Update `InventoryService`, `PaymentsService`, `ShippingService`, `ReturnsService`, `FollowupsService`, and `SettingsService` to query Prisma.
4. **Implement Real Database Aggregations for Analytics**: Update `AnalyticsService` to compute revenue, order count, and growth from PostgreSQL `Order` records.
5. **Clean Up Frontend Static Badges**: Dynamically populate sidebar counters from API endpoints.

---

## 24. Files Requiring Attention

### Critical
- `apps/api/src/modules/orders/orders.service.ts` (Remove silent mock fallback)
- `apps/api/src/modules/products/products.service.ts` (Remove silent mock fallback)
- `apps/api/src/modules/customers/customers.service.ts` (Remove silent mock fallback)
- `apps/api/src/modules/conversations/conversations.service.ts` (Remove silent mock fallback)

### High
- `apps/api/prisma/schema.prisma` (Add models for Inventory, Payments, Shipping, Returns, Followups)
- `apps/api/src/modules/inventory/inventory.service.ts` (Wire to Prisma)
- `apps/api/src/modules/payments/payments.service.ts` (Wire to Prisma)
- `apps/api/src/modules/shipping/shipping.service.ts` (Wire to Prisma)
- `apps/api/src/modules/returns/returns.service.ts` (Wire to Prisma)
- `apps/api/src/modules/followups/followups.service.ts` (Wire to Prisma)
- `apps/api/src/modules/analytics/analytics.service.ts` (Wire aggregations to Prisma)

### Medium
- `apps/api/src/modules/settings/settings.service.ts` (Wire business profile & team members to Prisma)
- `apps/web/src/components/layout/Sidebar.tsx` (Remove hardcoded badge counts)

---

## 25. Final Verdict

- **Truly Dynamic Core**: **Authentication, Tenant Switching, WhatsApp Webhooks & Messaging, and CRUD operations for Orders, Products, Customers, and WhatsApp Config** are fully wired to PostgreSQL and isolated per tenant via `TenantGuard`.
- **Static / Mock Backed Subsystems**: **Inventory, Payments, Shipping, Returns, Follow-ups, AI Engine, and Analytics** currently run on mock in-memory data structures or hardcoded zero/sample responses.
- **Architectural Risk**: The primary architectural issue is that DB-backed modules automatically revert to mock data when database tables are empty, creating potential user confusion and cross-tenant mock data exposure.
