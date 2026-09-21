# SellDesk — Master Product Roadmap & Architectural Plan

> **A WhatsApp-based commerce management platform for small businesses — initially targeting Instagram/WhatsApp clothing sellers.**

Customer conversation → AI understanding → Lead/Order → Customer → Follow-up → Payment → Delivery → Analytics

---

## 🧭 Overall Roadmap Architecture

```text
PHASE 0: Problem Validation
   ↓
PHASE 1: Product Definition
   ↓
PHASE 2: Technical Architecture & UX/UI
   ↓
PHASE 3: MVP — Business Dashboard
   ↓
PHASE 4: WhatsApp Integration
   ↓
PHASE 5: AI Commerce Assistant
   ↓
PHASE 6: Orders + Inventory + Customers
   ↓
PHASE 7: Automation & Follow-ups
   ↓
PHASE 8: Payments + Courier Integration
   ↓
PHASE 9: Beta Testing (5-10 Real Businesses)
   ↓
PHASE 10: Launch & Public Acquisition
   ↓
PHASE 11: Scale & Category Expansion
```

---

## Detailed Phases Breakdown

### PHASE 0 — Validate the Problem
- **Target**: 20–30 Instagram/WhatsApp clothing sellers (doing 10+ orders/week, COD, manual tracking).
- **Research Topics**: Order intake channels, WhatsApp inquiry volume, recording methods, COD tracking, returns handling, follow-up workflows, pain points & willingness to pay.
- **Decision Gate**: Proceed only if sellers confirm Excel + WhatsApp + Notebook tracking is a major bottleneck.

### PHASE 1 — Product Definition
- **ICP**: Small Pakistani online clothing businesses.
- **Core Value Proposition**: Manage WhatsApp orders, customers, and follow-ups from one place. Turn conversations into organized business operations.

### PHASE 2 — Product UX/UI Layout
- **Core Navigation**: Dashboard, Conversations, Orders, Customers, Products, Inventory, Follow-ups, Analytics, Settings, Shipping, Automations, AI, Team, Billing.

### PHASE 3 — SaaS Base & Authentication
- Multi-tenant Auth (Sign up, Login, Password Reset).
- Business onboarding (Name, Category, Currency PKR, Location, Timezone).
- Role-Based Access Control (Owner, Admin, Staff).

### PHASE 4 — Product & Inventory Catalog
- Products schema with multi-variants (SKUs, Sizes, Colors, Images, Price, Stock count).

### PHASE 5 — Customer CRM
- Customer profile tracking (Orders history, Delivered vs Returned ratio, Total spent, Activity timeline).

### PHASE 6 — Order Lifecycle Engine
- Order Statuses: `NEW` ➔ `CONFIRMED` ➔ `PROCESSING` ➔ `PACKED` ➔ `SHIPPED` ➔ `DELIVERED` (Exceptions: `CANCELLED`, `RETURNED`, `FAILED`).
- Order creation modal (Customer, Variant, Quantity, Address, City, COD/Prepaid, Notes).

### PHASE 7 — WhatsApp Cloud API Webhook Infrastructure
- Meta WhatsApp Business Platform webhooks connected to NestJS backend handlers.
- Decoupled architecture: Webhook ➔ Queue ➔ Engine ➔ PostgreSQL & Realtime UI.

### PHASE 8 — Conversation Management Engine
- Chat threads, message history, customer linking, attachment storage.

### PHASE 9 — AI Classification & Extraction Service
- Intent Classifier (`PRODUCT_INQUIRY`, `PRICE_INQUIRY`, `AVAILABILITY`, `ORDER`, `CUSTOMIZATION`, `DELIVERY_SUPPORT`, `RETURN`, `COMPLAINT`).
- Structured extraction of order details (Product, Variant, Quantity, Payment method, City) into JSON payload.

### PHASE 10 — AI Guardrailed Auto-Response System
- RAG lookup against Database (Prices, Stock levels, Delivery policies).
- Guardrails preventing hallucinated pricing or out-of-stock commitments.

### PHASE 11 & 12 — Custom Orders & Human-in-the-Loop Approval UI
- Attachment design uploads (custom printing, stickers, adjustments).
- Dashboard review drawer: `[Approve]`, `[Ask Customer]`, `[Reject]`.

### PHASE 13 — Automated Follow-ups & Cart Recovery
- Scheduled reminders for inquiries that drop off after inquiry.

### PHASE 14 — Inventory Synchronization & Low Stock Alerts
- Real-time stock decrement upon order confirmation. Low stock warnings.

### PHASE 15 — Business Intelligence & Analytics
- Monthly Revenue, Order volume, Average Order Value (AOV), Return rates, Best-selling variants.

### PHASE 16 — Payment Management
- Track COD, Bank Transfer, EasyPaisa, JazzCash, Raast transactions & status (`Paid`, `Pending`, `Refunded`).

### PHASE 17 & 18 — Courier Integrations & Return Lifecycles
- Shipment creation & tracking API integration with Pakistani couriers.
- Return lifecycle management (`Requested` ➔ `Approved` ➔ `Picked Up` ➔ `Received` ➔ `Refunded`).

---

## 🏗️ Technical Stack & Architecture

```text
                 CUSTOMER
                    │
                    ▼
             WhatsApp Client
                    │
                    ▼
        WhatsApp Business Platform API
                    │
                    ▼
               NestJS Webhook
                    │
                    ▼
              Redis / BullMQ
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   Conversation   AI Engine   Order Engine
   Service        Service     Service
        │           │           │
        └───────────┼───────────┘
                    ▼
           PostgreSQL (Prisma)
                    │
                    ▼
           Next.js Dashboard UI
```

---

## 🚀 Execution Order (Vertical Slices)

1. **Slice 1**: Auth + Multi-tenant Business + Products Catalog
2. **Slice 2**: Customers CRM + Order Lifecycle Engine
3. **Slice 3**: Conversation Infrastructure
4. **Slice 4**: WhatsApp Webhook Integration
5. **Slice 5**: AI Intent & Order Extraction Service
6. **Slice 6**: AI Guardrailed Responses & Seller Review UI
7. **Slice 7**: Automated Follow-ups & Dynamic Inventory Sync
8. **Slice 8**: Analytics Dashboard + COD Payment Tracking
9. **Slice 9**: Courier Shipping Integration + Returns System
10. **Slice 10**: Subscriptions, Billing & Team Permissions
