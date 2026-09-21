# SellDesk 🛍️📱

> **A WhatsApp-based commerce management platform for small businesses — initially targeting Instagram/WhatsApp clothing sellers.**

**Customer Conversation → AI Understanding → Lead/Order → Customer CRM → Follow-up → Payment → Delivery → Analytics**

---

## 📌 Project Information
- **Repository**: [SellDesk on GitHub](https://github.com/AbdulNafay42/SellDesk)
- **Author**: Abdul Nafay ([abdulnafay2005@gmail.com](mailto:abdulnafay2005@gmail.com))
- **Primary ICP**: Small Pakistani online clothing & fashion businesses operating on WhatsApp / Instagram.

---

## 🏗️ Core Value Proposition
- Turn unstructured WhatsApp conversations into structured, trackable business operations.
- Automate order extraction, inventory check, and customer inquiry response with human-in-the-loop safety.
- Single platform to manage Orders, Inventory, CRM, Follow-ups, COD tracking, and Courier logistics.

---

## 🧭 Product Roadmap Summary

```text
PHASE 0  : Problem & Market Validation (Target: 20-30 Pakistani online sellers)
PHASE 1  : Product Definition & ICP Scoping
PHASE 2  : Product UX/UI Wireframes & Workflows
PHASE 3  : SaaS Core — Auth, Business Onboarding & User Roles
PHASE 4  : Product Catalog & Multi-Variant Inventory System
PHASE 5  : Customer CRM & Interaction Timeline
PHASE 6  : Order Management Lifecycle (NEW -> CONFIRMED -> PROCESSING -> PACKED -> SHIPPED -> DELIVERED)
PHASE 7  : WhatsApp Business Platform Webhook & Integration
PHASE 8  : Conversation & Messaging Engine
PHASE 9  : AI Intent Classification & Structured Order Extraction
PHASE 10 : AI Guardrailed Auto-Response Engine
PHASE 11 : Custom Order Handling & Seller Review Workflows
PHASE 12 : Human-in-the-Loop Seller Approval Dashboard
PHASE 13 : Automated Lead & Cart Recovery Follow-ups
PHASE 14 : Dynamic Inventory Sync & Low-Stock Alerts
PHASE 15 : Business Intelligence & Analytics Dashboard
PHASE 16 : Payment Tracking (COD, Bank Transfer, JazzCash/Easypaisa/Raast)
PHASE 17 : Courier & Logistics Integration (Leopard, Trax, CallCourier, M&P, TCS)
PHASE 18 : Returns, Exchanges & Refund Lifecycle Management
PHASE 19 : Team Roles & Permission Management
PHASE 20 : SaaS Subscription Tiers & Billing System
PHASE 21 : Private Beta with 5–10 Active Businesses
PHASE 22 : Public Launch & Scaling
```

---

## 🛠️ Recommended Tech Stack

- **Frontend**: Next.js, TypeScript, SCSS / Vanilla CSS
- **Backend**: NestJS, TypeScript, REST API & Webhook Handlers
- **Database & ORM**: PostgreSQL, Prisma ORM
- **Cache & Queues**: Redis, BullMQ (for Webhooks, AI processing, Follow-up scheduling)
- **AI Service Layer**: LLM API (Intent Classification, Order Extraction, RAG Response Generation)
- **Storage**: Object Storage (S3 / Cloud storage for custom design attachments & product media)

---

## 🚀 Vertical Implementation Slices

- **Slice 1**: Auth + Multi-tenant Business Management + Product Catalog
- **Slice 2**: Customer CRM + Order Management Engine
- **Slice 3**: Conversation Messaging System
- **Slice 4**: WhatsApp Cloud API Integration
- **Slice 5**: AI Intent Classification & Order Parsing
- **Slice 6**: Guardrailed AI Assistant + Human Approval UI
- **Slice 7**: Follow-ups + Live Inventory Sync
- **Slice 8**: Analytics + Payments (COD tracking)
- **Slice 9**: Courier Shipping Integration + Returns Lifecycle
- **Slice 10**: SaaS Billing + Team Permissions + Hardening

---

## 🔐 Multi-Tenancy & Security
- Strict multi-tenant isolation via `business_id` scoping on every database model and API request.
- Encrypted webhook endpoints & secure token handling.
- Audit logging for critical financial, order, and inventory state transitions.
