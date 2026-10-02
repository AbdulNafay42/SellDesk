# SELLDESK — PHASE 5 PRODUCTION READINESS & COMPLETE SYSTEM AUDIT REPORT

**Date**: September 30, 2026  
**Auditor**: Antigravity AI Engineering Team  
**Status**: AUDIT COMPLETE (Non-destructive inspection phase)

---

## EXECUTIVE SUMMARY

A comprehensive production-readiness audit was performed on the SellDesk multi-tenant commerce platform. The system has successfully transitioned core registration, authentication, business management, and module data stores to PostgreSQL via Prisma ORM.

However, despite clean build passes and passing unit/integration regression suites, the audit revealed **critical P0 security vulnerabilities**, **database schema constraint risks**, and **frontend mock fallback technical debt** that must be remediated before production deployment.

### Key Audit Findings Overview
- 🔴 **P0 (Critical Security)**: `ReturnsService`, `PaymentsService`, and `FollowupsService` accept optional `businessId` parameters or issue un-scoped `update` queries, enabling cross-tenant mutation if an object ID is known.
- 🔴 **P0 (Authorization Flaw)**: Frontend `ClientAuthGuard` only checks for `PENDING` business status. `REJECTED` and `SUSPENDED` businesses are allowed into the frontend UI, where API calls fail with 403 error alerts instead of showing a dedicated rejection/suspension state screen.
- 🟠 **P1 (High - Database Schema Constraints)**: Models such as `ProductVariant` (`sku`), `Order` (`orderNumber`), `Consignment` (`cnNumber`), `ReturnRequest` (`returnNumber`), and `Invoice` (`invoiceNumber`) carry global `@unique` constraints in Prisma. In a multi-tenant environment, if Tenant A uses order number `#ORD-1001`, Tenant B is blocked from generating `#ORD-1001`. Additionally, `Category` is a global model lacking a `businessId` foreign key.
- 🟠 **P1 (High - Hardcoded Secrets & Seed Fallbacks)**: `AuthService` contains a `mockDevUsers` array with plaintext development fallback password comparisons (`password123`). `AdminService.provisionTenant` sets new account passwords to a static default `'password123'`.
- 🟡 **P2 (Medium - Client State Mutations & Disconnected APIs)**: Several frontend actions (e.g. `handleSendReply` in `/conversations`, `handleBookConsignment` in `/shipping`, `handleVerify` in `/payments`, `handleRestock` in `/returns`, and AI guardrail controls in `/ai`) perform only in-memory React state mutations without persisting to NestJS API endpoints.
- 🟢 **P3 (Low - Static UI Content & Metrics)**: Dashboard cards display static fallback metrics for low-stock warnings and AI intent feeds when live data is empty.

---

## 1. PROJECT STRUCTURE AUDIT

### Backend (`apps/api`)
- **Framework**: NestJS with Prisma ORM (PostgreSQL)
- **Modules (16)**: `admin`, `ai`, `analytics`, `auth`, `conversations`, `customers`, `followups`, `inventory`, `orders`, `payments`, `prisma`, `products`, `returns`, `settings`, `shipping`, `whatsapp`.
- **Controllers (16)**: All 16 modules feature dedicated NestJS controllers.
- **Guards**: `JwtAuthGuard` (Passport JWT), `TenantGuard` (Headers + BusinessMember validation), `SuperAdminGuard` (`platformRole === 'SUPER_ADMIN'`).

### Frontend (`apps/web`)
- **Framework**: Next.js (App Router, Client Components, Vanilla CSS & Glassmorphism design system)
- **Routes (18)**: `/`, `/admin`, `/ai`, `/analytics`, `/conversations`, `/customers`, `/dashboard`, `/followups`, `/inventory`, `/invite/[token]`, `/login`, `/orders`, `/payments`, `/products`, `/returns`, `/select-tenant`, `/settings`, `/signup`, `/signup/pending`.
- **Context & State**: `AuthContext.tsx` manages JWT tokens, user profile, business memberships list, and active business state. `api.ts` provides auto-wrapping fetch utility with `Authorization: Bearer <token>` and `X-Tenant-ID: <id>`.

---

## 2. AUTHENTICATION AUDIT

### Flow Tracing
1. **REGISTER (`/signup`)**:
   - Client posts to `/api/auth/register`.
   - `AuthService.register()` checks email uniqueness (normalized lowercase), hashes password via `bcrypt.hashSync(password, 10)`, generates a unique slug, and runs a Prisma transaction to create `User`, `Business` (`status: PENDING`), and `BusinessMember` (`role: OWNER`).
   - Returns JWT token and membership list. Client receives JWT, sets `selldesk_auth_token` and `selldesk_active_tenant_id` in `localStorage`, and redirects to `/signup/pending`.
2. **LOGIN (`/login`)**:
   - Client posts to `/api/auth/login`.
   - `AuthService.login()` verifies user via `bcrypt.compareSync()`.
   - **Finding**: Returns JWT and memberships list regardless of `Business.status`. User gets a valid JWT session.
3. **LOGOUT**:
   - `logout()` in `AuthContext.tsx` clears `localStorage` items (`selldesk_auth_token`, `selldesk_active_tenant_id`), clears React state, and redirects to `/login`.
4. **JWT Security & Strategy**:
   - JWT secret sourced from `process.env.JWT_SECRET` with dev key fallback.
   - Strategy extracts `sub` as `userId` and attaches `req.user`.

---

## 3. BUSINESS APPROVAL AUDIT

### Business Status State Matrix

| Business Status | User Login Allowed? | `/dashboard` Access | Tenant API Access | `/select-tenant` Access | Frontend UI Display | Backend Return |
|---|---|---|---|---|---|---|
| **PENDING** | YES (JWT issued) | BLOCKED (Redirected) | BLOCKED (`403 Forbidden`) | ALLOWED | `/signup/pending` screen | `403 Access denied. Business is PENDING.` |
| **APPROVED** | YES (JWT issued) | ALLOWED | ALLOWED | ALLOWED | Full Dashboard | `200 OK` |
| **REJECTED** | YES (JWT issued) | UNGUARDED on FE (Renders UI) | BLOCKED (`403 Forbidden`) | ALLOWED | API Error Alerts in UI | `403 Access denied. Business is REJECTED.` |
| **SUSPENDED** | YES (JWT issued) | UNGUARDED on FE (Renders UI) | BLOCKED (`403 Forbidden`) | ALLOWED | API Error Alerts in UI | `403 Access denied. Business is SUSPENDED.` |

> ⚠️ **AUDIT FINDING**: `ClientAuthGuard.tsx` only redirects on `status === 'PENDING'`. It lacks explicit handling for `REJECTED` and `SUSPENDED` business statuses, leaving users with broken UI screens showing 403 API errors.

---

## 4. MULTI-TENANT SECURITY AUDIT

### Controller Guard & Tenant Scoping Inspection

| Controller | Class Level Guards | Endpoint Scoping Method | Vulnerability / Leakage Risk |
|---|---|---|---|
| `OrdersController` | `@UseGuards(JwtAuthGuard, TenantGuard)` | `req.tenantId` passed to service | Low — properly scoped |
| `ProductsController` | `@UseGuards(JwtAuthGuard, TenantGuard)` | `req.tenantId` passed to service | Low — properly scoped |
| `CustomersController` | `@UseGuards(JwtAuthGuard, TenantGuard)` | `req.tenantId` passed to service | Low — properly scoped |
| `InventoryController` | `@UseGuards(JwtAuthGuard, TenantGuard)` | `req.tenantId` passed to service | Medium — `InventoryService` hardcodes stock values |
| `ReturnsController` | `@UseGuards(JwtAuthGuard, TenantGuard)` | `restockReturn(id, businessId?)` | 🔴 **HIGH**: `businessId` parameter is optional in service call. `update({ where: { id: ret.id } })` does not check tenant ID. |
| `PaymentsController` | `@UseGuards(JwtAuthGuard, TenantGuard)` | `verifyPayment(id, trxId?, businessId?)` | 🔴 **HIGH**: `businessId` parameter is optional. `update({ where: { id: payment.id } })` is unscoped. |
| `FollowupsController` | `@UseGuards(JwtAuthGuard, TenantGuard)` | `triggerFollowup(id, businessId?)` | 🔴 **HIGH**: `businessId` parameter is optional. |
| `WhatsAppController` | Mixed Guards | Webhook public, management guarded | Medium — Webhook matches by phone number |
| `AdminController` | `@UseGuards(JwtAuthGuard, SuperAdminGuard)` | Platform-wide | Low — Super Admin guarded |

---

## 5. RBAC AUDIT

### Role-Based Access Control Matrix

| Feature / Action | SUPER_ADMIN | OWNER | ADMIN | STAFF |
|---|---|---|---|---|
| **Access Platform Admin (`/admin`)** | ✅ ALLOWED | ❌ BLOCKED | ❌ BLOCKED | ❌ BLOCKED |
| **Approve/Reject Pending Businesses** | ✅ ALLOWED | ❌ BLOCKED | ❌ BLOCKED | ❌ BLOCKED |
| **Provision Brand Store** | ✅ ALLOWED | ❌ BLOCKED | ❌ BLOCKED | ❌ BLOCKED |
| **Manage Store Settings (`/settings`)** | ❌ (Platform only) | ✅ ALLOWED | ✅ ALLOWED | ❌ Restricted |
| **Invite Team Members** | ❌ (Platform only) | ✅ ALLOWED | ✅ ALLOWED | ❌ BLOCKED |
| **Create/Update Orders & Products** | ❌ (Platform only) | ✅ ALLOWED | ✅ ALLOWED | ✅ ALLOWED |
| **Approve AI Actions** | ❌ (Platform only) | ✅ ALLOWED | ✅ ALLOWED | ✅ ALLOWED |

---

## 6. SUPER ADMIN AUDIT

### Audit Findings for `/admin` Flow:
- **Database Backed**: YES. `getPendingBusinesses()`, `approveBusiness()`, `rejectBusiness()`, `getTenants()`, `provisionTenant()`, `toggleStatus()` query PostgreSQL directly.
- **Persistence**: Status changes and provisioned businesses survive server restarts.
- **Hardcoded Remnants**:
  - `AdminService.provisionTenant` hardcodes initial user password to `'password123'`.
  - `AdminService.getMetrics` calculates MRR as `active * 6999` (static formula rather than summing actual paid invoices).

---

## 7. DATABASE AUDIT

### Prisma Schema Models Inventory & Constraint Risk Analysis

| Model | Tenant Owned? | `businessId` | FK Relations | Indexes | Unique Constraints | Identified Schema Risk |
|---|---|---|---|---|---|---|
| `User` | No | None | `memberships`, `invitations` | Primary Key | `email` | None |
| `Business` | Root Tenant | Self (`id`) | `members`, `products`, `orders` | Primary Key | `slug` | None |
| `BusinessMember` | Yes | `businessId` | `user`, `business` | Primary Key | `[userId, businessId]` | None |
| `Category` | ❌ NO | None | `products` | Primary Key | None | 🔴 **Global Model**: No multi-tenant scoping! |
| `Product` | Yes | `businessId` | `business`, `category`, `variants` | `[businessId]` | Primary Key | None |
| `ProductVariant` | Indirect | Via `Product` | `product` | `[productId]` | `sku` | 🔴 **Global Unique SKU**: Prevents multi-tenant SKU overlap! |
| `Customer` | Yes | `businessId` | `business`, `orders`, `conversations` | `[businessId, phoneNumber]` | Primary Key | None |
| `Order` | Yes | `businessId` | `business`, `customer` | `[businessId]` | `orderNumber` | 🔴 **Global Unique OrderNumber**: Prevents multi-tenant order # overlap! |
| `Conversation` | Yes | `businessId` | `business`, `customer`, `messages` | `[businessId]`, `[customerId]` | `[businessId, channel, externalContactId]` | None |
| `Message` | Yes | `businessId` | `business`, `conversation` | `[businessId]`, `[conversationId]` | `[businessId, externalMessageId]` | None |
| `StockMovement` | Yes | `businessId` | `business` | `[businessId]` | Primary Key | None |
| `PaymentRecord` | Yes | `businessId` | `business` | `[businessId]` | Primary Key | None |
| `Consignment` | Yes | `businessId` | `business` | `[businessId]` | `cnNumber` | 🔴 **Global Unique CN Number** |
| `ReturnRequest` | Yes | `businessId` | `business` | `[businessId]` | `returnNumber` | 🔴 **Global Unique Return Number** |
| `FollowupLead` | Yes | `businessId` | `business` | `[businessId]` | Primary Key | None |
| `AiAction` | Yes | `businessId` | `business` | `[businessId]` | Primary Key | None |
| `Invoice` | Yes | `businessId` | `business` | `[businessId]` | `invoiceNumber` | 🔴 **Global Unique Invoice Number** |

---

## 8. COMPLETE FRONTEND DATA AUDIT

### Page-by-Page Audit Inventory

| Page | Primary Data | Source / API Route | Dynamic? | DB-Backed? | Hardcoded / Mock Remnants Identified | Empty State Handled? |
|---|---|---|---|---|---|---|
| `/dashboard` | Metrics & Orders | `/api/analytics/metrics`, `/api/orders` | Partial | YES | Follow-up card (`"0 Leads"`), Low Stock card (`"0 Variants"`), and AI Intent feed are static. | YES |
| `/orders` | Orders List | `/api/orders` | YES | YES | Create order modal product dropdown options are hardcoded strings. If API fails, falls back to local memory. | YES |
| `/products` | Catalog & Variants | `/api/products` | YES | YES | Fallback image URLs & static variant form templates. | YES |
| `/customers` | CRM Records | `/api/customers` | YES | YES | Customer Timeline drawer details (ordered items, chat history) are hardcoded static strings. | YES |
| `/inventory` | Stock Movements | `/api/inventory/movements` | YES | YES | Low Stock warning banner and restock modal dropdown options are hardcoded. | YES |
| `/analytics` | BI & Sales | `/api/analytics/metrics` | Partial | YES | `topProducts` table is empty (`[]`). Chat lead funnel count subtext is hardcoded text. | YES |
| `/conversations` | WhatsApp Inbox | `/api/conversations` | Partial | YES | `handleSendReply` & "Convert Chat to Order" only mutate local React state without posting to API. | YES |
| `/followups` | Recovery Leads | `/api/followups` | Partial | YES | `handleSendFollowup` mutates local React state without calling backend API. | YES |
| `/payments` | Settlement Ledger | `/api/payments` | Partial | YES | `handleVerify` mutates local React state without posting verification to API. | YES |
| `/shipping` | Courier CNs | `/api/shipping` | Partial | YES | `handleBookConsignment` appends to local state without posting to NestJS shipping API. | YES |
| `/returns` | Reverse Logistics | `/api/returns` | Partial | YES | `handleRestock` mutates local state without calling `/api/returns/:id/restock`. | YES |
| `/ai` | Guardrails & Queue | `/api/ai/actions` | YES | YES | AI Guardrail control toggles & threshold slider mutate local React state without saving. | YES |
| `/settings` | Profile, Team, Billing | `/api/settings/*` | YES | YES | Clean API integration. | YES |
| `/select-tenant` | Business List | `AuthContext.memberships` | YES | YES | Renders all memberships from DB. | YES |
| `/admin` | Super Admin Dashboard | `/api/admin/*` | YES | YES | Complete DB integration. | YES |

---

## 9. CRUD AUDIT MATRIX

| Module | Create | Read | Update | Delete | DB-Backed? | Tenant Scoped? |
|---|---|---|---|---|---|---|
| **Auth / Reg** | ✅ YES | ✅ YES | ✅ YES | ❌ N/A | YES | YES |
| **Businesses** | ✅ YES | ✅ YES | ✅ YES | ❌ N/A | YES | YES |
| **Orders** | ✅ YES | ✅ YES | ✅ YES | ❌ N/A | YES | YES |
| **Products** | ✅ YES | ✅ YES | ❌ (FE missing) | ❌ N/A | YES | YES |
| **Customers** | ✅ YES | ✅ YES | ❌ N/A | ❌ N/A | YES | YES |
| **Inventory** | ✅ YES | ✅ YES | ❌ N/A | ❌ N/A | YES | YES (Hardcoded service calculations) |
| **Analytics** | ❌ N/A | ✅ YES | ❌ N/A | ❌ N/A | YES | YES |
| **Conversations**| ❌ (FE disconnected)| ✅ YES | ❌ N/A | ❌ N/A | YES | YES |
| **Followups** | ❌ (FE disconnected)| ✅ YES | ❌ (FE disconnected)| ❌ N/A | YES | 🔴 Weak Guard |
| **Payments** | ❌ (FE disconnected)| ✅ YES | ❌ (FE disconnected)| ❌ N/A | YES | 🔴 Weak Guard |
| **Shipping** | ❌ (FE disconnected)| ✅ YES | ❌ N/A | ❌ N/A | YES | YES |
| **Returns** | ❌ (FE disconnected)| ✅ YES | ❌ (FE disconnected)| ❌ N/A | YES | 🔴 Weak Guard |
| **AI** | ✅ YES | ✅ YES | ✅ YES | ❌ N/A | YES | YES |
| **Settings** | ✅ YES | ✅ YES | ✅ YES | ❌ N/A | YES | YES |

---

## 10. API CONTRACT AUDIT

### Mismatches & Disconnections
1. `ConversationsPage.tsx`: `handleSendReply` does not call any API endpoint. Expected: `POST /api/conversations/:id/messages`.
2. `ShippingPage.tsx`: `handleBookConsignment` does not call `POST /api/shipping`.
3. `PaymentsPage.tsx`: `handleVerify` does not call `POST /api/payments/:id/verify`.
4. `ReturnsPage.tsx`: `handleRestock` does not call `POST /api/returns/:id/restock`.
5. `FollowupsPage.tsx`: `handleSendFollowup` does not call `POST /api/followups/:id/trigger`.

---

## 11. LOADING / EMPTY / ERROR STATES

- All 15 frontend pages correctly render clean empty states when zero records are returned from PostgreSQL.
- Zero records do **NOT** trigger mock data generation or fallback tenant switches.

---

## 12. STATIC / MOCK DATA AUDIT INVENTORY

| File | Line | Purpose | Category | Action Needed |
|---|---|---|---|---|
| `AuthService.ts` | 20-37 | Development fallback user array with plain passwords | E (Dev Mock) | Remove array completely |
| `AdminService.ts` | 235 | Hardcoded password `'password123'` when provisioning user | F (Production Risk) | Replace with secure random password generation / invite token |
| `AdminService.ts` | 171 | Hardcoded MRR calculation (`active * 6999`) | E (Dev Formula) | Calculate from actual paid `Invoice` records |
| `InventoryService.ts` | 32-33 | Hardcoded stock calculations (`previousStock: 10`) | F (Production Risk) | Fetch actual `ProductVariant.stock` and compute dynamically |
| `OrdersPage.tsx` | 415-420 | Hardcoded product dropdown options in manual order modal | F (Production Risk) | Populate dynamically from `api.get('/api/products')` |
| `InventoryPage.tsx` | 126-128 | Hardcoded low stock warning banner text | F (Production Risk) | Compute dynamically from low stock variants API |
| `AnalyticsPage.tsx` | 78 | Empty array for `topProducts` | E (Technical Debt) | Query top ordered products dynamically |

---

## 13. SERVER RESTART PERSISTENCE AUDIT

- All database records (`User`, `Business`, `BusinessMember`, `Product`, `Order`, `Consignment`, `PaymentRecord`, `ReturnRequest`, `AiAction`) are stored in PostgreSQL.
- Business status changes (`PENDING` ➔ `APPROVED` ➔ `SUSPENDED`) persist continuously across NestJS API server restarts.

---

## 14. REAL MULTI-TENANT AUDIT FINDINGS

- `TenantGuard` extracts tenant ID from `X-Tenant-ID` header, query, or body.
- `TenantGuard` verifies that `BusinessMember` exists for `(userId, targetBusinessId)` and that `Business.status === 'APPROVED'`.
- If Tenant A attempts to supply Tenant B's ID in `X-Tenant-ID`, `TenantGuard` throws a `403 Forbidden` exception (`User is not a verified member of business`).

---

## 15. BUSINESS SELECTOR AUDIT

- `/select-tenant` fetches memberships directly from `/api/auth/memberships` (backed by `prisma.businessMember.findMany`).
- Displays business name, city, role, and status badge.
- Clicking a `PENDING` business correctly redirects the user to `/signup/pending`.
- Selecting an `APPROVED` business calls `selectBusiness(id)`, which sets `selldesk_active_tenant_id` in `localStorage` and routes to `/dashboard`.

---

## 16. DATA CONSISTENCY REPORT (POSTGRESQL AUDIT)

Executed via non-destructive database query script `scratch/inspect-db-state.js`:
- **Total Users**: 82
- **Total Businesses**: 80
- **Total BusinessMembers**: 82
- **Business Status Breakdown**:
  - `APPROVED`: 57
  - `SUSPENDED`: 4
  - `PENDING`: 19
- **Users with memberships**: 82
- **Users with multiple businesses**: 0
- **Businesses with 0 members**: 0
- **Duplicate emails**: 0
- **Duplicate slugs**: 0

---

## 17. SECURITY & SENSITIVE DATA SEARCH

- **JWT Secrets**: `JWT_SECRET` properly loaded from process env in `apps/api/.env`.
- **Password Hashing**: Sourced via `bcryptjs` with 10 salt rounds.
- **Sensitive Logs**: No plain text passwords or tokens are printed in production logs.

---

## 18. TEST COVERAGE AUDIT

| Area | Existing Scratch Test | Database-Backed? | Coverage | Missing Test Cases |
|---|---|---|---|---|
| **DB & Isolation** | `test-tenant-isolation-bugfix.js` | YES | High | Cross-tenant object ID tampering |
| **Auth & Approvals** | `test-admin-approval-login.js` | YES | High | Token expiration & refresh |
| **WhatsApp Foundation** | `test-whatsapp-foundation.js` | YES | Medium | Real Meta webhook payload verification |
| **Business Mgmt** | `test-phase3-business-management.js`| YES | High | Duplicate membership attempts |
| **Security Audit** | `test-phase5-security-audit.js` | YES | Medium | Un-scoped update route tampering |

---

## 19. PRIORITIZED ACTION PLAN FOR NEXT PHASES

### 🔴 P0 — Critical (Security & Authorization Vulnerabilities)
1. **Fix Cross-Tenant Mutation in Services**:
   - Make `businessId` **MANDATORY** in `ReturnsService.restockReturn()`, `PaymentsService.verifyPayment()`, and `FollowupsService.triggerFollowup()`.
   - Update Prisma calls in those services to scope by `where: { id, businessId }`.
2. **Fix `ClientAuthGuard.tsx` for Rejected & Suspended Businesses**:
   - Add explicit checks for `activeBusiness.status === 'REJECTED'` and `activeBusiness.status === 'SUSPENDED'`.
   - Redirect to dedicated status notification pages or prevent access to seller dashboard screens.

### 🟠 P1 — High (Database Schema & Production Blockers)
3. **Multi-Tenant Unique Constraint Schema Migration**:
   - Update `schema.prisma` to replace global `@unique` on `ProductVariant.sku`, `Order.orderNumber`, `Consignment.cnNumber`, `ReturnRequest.returnNumber`, and `Invoice.invoiceNumber` with multi-tenant compound unique constraints (e.g. `@@unique([businessId, orderNumber])`).
   - Add `businessId` to `Category` model to prevent global category collisions across tenants.
4. **Remove Hardcoded Dev Passwords & Secure Provisioning**:
   - Remove `mockDevUsers` array in `AuthService.ts`.
   - Replace default password `'password123'` in `AdminService.provisionTenant()` with secure invitation tokens.

### 🟡 P2 — Medium (Frontend API Disconnections & Client State Debt)
5. **Connect Disconnected Frontend Actions to NestJS APIs**:
   - Connect `/conversations` reply composer to API.
   - Connect `/shipping` consignment booking modal to `POST /api/shipping`.
   - Connect `/payments` verification modal to `PATCH /api/payments/:id/verify`.
   - Connect `/returns` restock button to `POST /api/returns/:id/restock`.
   - Connect `/followups` 1-click send button to `POST /api/followups/:id/trigger`.
   - Connect `/ai` guardrail controls to backend settings API.

### 🟢 P3 — Low (UI Hardcoding Cleanup & Dynamic Metrics)
6. **Populate Static UI Components**:
   - Replace hardcoded product options in manual order modal with dynamic products list.
   - Compute low stock warning banner and dashboard summary cards dynamically from DB queries.
   - Query top-selling product variants dynamically in `/analytics`.

---
*End of Audit Report.*
