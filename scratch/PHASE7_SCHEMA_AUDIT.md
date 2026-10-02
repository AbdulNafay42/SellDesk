# PHASE 7 — FULL PRISMA SCHEMA AUDIT REPORT

**Date**: September 30, 2026  
**File**: `apps/api/prisma/schema.prisma`

---

## 1. Schema Inventory

### Enums (11)
- `Role`: OWNER, ADMIN, STAFF
- `BusinessStatus`: PENDING, APPROVED, REJECTED, SUSPENDED
- `PlatformRole`: SUPER_ADMIN, USER
- `ProductStatus`: DRAFT, ACTIVE, ARCHIVED
- `OrderStatus`: NEW, CONFIRMED, PROCESSING, PACKED, SHIPPED, DELIVERED, CANCELLED, RETURNED
- `PaymentStatus`: PENDING, PAID, REFUNDED, FAILED
- `ConversationChannel`: WHATSAPP
- `ConversationStatus`: OPEN, CLOSED
- `MessageDirection`: INBOUND, OUTBOUND
- `MessageType`: TEXT, OTHER
- `MessageStatus`: RECEIVED, PROCESSING, PROCESSED, FAILED, SENT

### Models (17)

| Model Name | Root / Tenant Owned | Primary Key | Foreign Keys | Current `@unique` | Current `@@unique` | Current Indexes | Identified Multi-Tenant Risk |
|---|---|---|---|---|---|---|---|
| `User` | Global User | `id` (uuid) | None | `email` | None | None | None |
| `Business` | Root Tenant | `id` (uuid) | None | `slug` | None | None | None |
| `WhatsAppConfig` | Tenant-Owned | `id` (uuid) | `businessId` | `businessId`, `phoneNumberId` | None | `[phoneNumberId]` | `phoneNumberId` is globally unique (Correct for Meta WABA) |
| `InvitationToken` | Tenant-Owned | `id` (uuid) | `userId`, `businessId` | `token` | None | None | None |
| `BusinessMember` | Tenant-Owned | `id` (uuid) | `userId`, `businessId` | None | `[userId, businessId]` | None | None |
| `Category` | 🔴 **Global** | `id` (uuid) | None | None | None | None | 🔴 **NOT Tenant-Owned**: No `businessId` foreign key! |
| `Product` | Tenant-Owned | `id` (uuid) | `businessId`, `categoryId` | None | None | `[businessId]` | None |
| `ProductVariant` | Indirect | `id` (uuid) | `productId` | `sku` | None | `[productId]` | 🔴 **Global Unique SKU**: Prevents SKU reuse across tenants |
| `Customer` | Tenant-Owned | `id` (uuid) | `businessId` | None | None | `[businessId, phoneNumber]` | None |
| `Order` | Tenant-Owned | `id` (uuid) | `businessId`, `customerId` | `orderNumber` | None | `[businessId]` | 🔴 **Global Unique OrderNumber**: Prevents order # reuse across tenants |
| `Conversation` | Tenant-Owned | `id` (uuid) | `businessId`, `customerId` | None | `[businessId, channel, externalContactId]` | `[businessId]`, `[customerId]` | Properly scoped |
| `Message` | Tenant-Owned | `id` (uuid) | `businessId`, `conversationId` | None | `[businessId, externalMessageId]` | `[businessId]`, `[conversationId]` | Properly scoped |
| `StockMovement` | Tenant-Owned | `id` (uuid) | `businessId` | None | None | `[businessId]` | None |
| `PaymentRecord` | Tenant-Owned | `id` (uuid) | `businessId` | None | None | `[businessId]` | None |
| `Consignment` | Tenant-Owned | `id` (uuid) | `businessId` | `cnNumber` | None | `[businessId]` | 🔴 **Global Unique CN Number**: Prevents CN # reuse across tenants |
| `ReturnRequest` | Tenant-Owned | `id` (uuid) | `businessId` | `returnNumber` | None | `[businessId]` | 🔴 **Global Unique Return Number**: Prevents return # reuse across tenants |
| `FollowupLead` | Tenant-Owned | `id` (uuid) | `businessId` | None | None | `[businessId]` | None |
| `AiAction` | Tenant-Owned | `id` (uuid) | `businessId` | None | None | `[businessId]` | None |
| `Invoice` | Tenant-Owned | `id` (uuid) | `businessId` | `invoiceNumber` | None | `[businessId]` | 🔴 **Global Unique Invoice Number**: Prevents invoice # reuse across tenants |

---

## 2. Identified Fix Plan

1. **`Category`**: Add `businessId String`, relation `business Business @relation(...)`, and composite constraint `@@unique([businessId, slug])`.
2. **`ProductVariant`**: Add `businessId String`, relation `business Business @relation(...)`, and composite constraint `@@unique([businessId, sku])`.
3. **`Order`**: Replace `orderNumber String @unique` with `orderNumber String` and `@@unique([businessId, orderNumber])`.
4. **`Consignment`**: Replace `cnNumber String @unique` with `cnNumber String` and `@@unique([businessId, cnNumber])`.
5. **`ReturnRequest`**: Replace `returnNumber String @unique` with `returnNumber String` and `@@unique([businessId, returnNumber])`.
6. **`Invoice`**: Replace `invoiceNumber String @unique` with `invoiceNumber String` and `@@unique([businessId, invoiceNumber])`.
