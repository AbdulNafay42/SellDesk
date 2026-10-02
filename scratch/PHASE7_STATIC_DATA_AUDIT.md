# SellDesk — Phase 7 Static & Mock Data Audit

This audit classifies all remaining mock, demo, static, fallback, and hardcoded references across the repository.

---

## Classification Summary

| File / Component | Target Item / Symbol | Classification | Action / Decision |
|---|---|---|---|
| `apps/api/src/modules/auth/auth.service.ts` | `mockDevUsers` | 4. DEAD CODE | **REMOVED** in Phase 7. Auth uses 100% PostgreSQL user lookup. |
| `apps/api/src/modules/admin/admin.service.ts` | `bcrypt.hashSync('password123', 10)` in `provisionTenant` | 6. SECURITY-SENSITIVE FALLBACK | **REPLACED** in Phase 7 with cryptographically random hash + `InvitationToken` creation. |
| `apps/api/src/modules/settings/settings.service.ts` | `bcrypt.hashSync('password123', 10)` in `inviteTeamMember` | 6. SECURITY-SENSITIVE FALLBACK | **REPLACED** in Phase 7 with cryptographically random hash. |
| `apps/api/src/modules/settings/settings.service.ts` | Category fallback `'Apparel & Clothing Store'` | 5. PRODUCTION MOCK DATA | Retained as profile category label for UI settings display until Settings categories are dynamic. |
| `apps/api/src/modules/whatsapp/whatsapp.service.ts` | `mockConfigs`, `mockCustomers`, `mockConversations`, `mockMessages` | 3. DEVELOPMENT/TEST ONLY | Retained as in-memory fallback for offline/decoupled integration tests when DB is unavailable. |
| `apps/web/src/app/signup/pending/page.tsx` | UI explanation text & status indicators | 2. INTENTIONAL UI EMPTY STATE | Retained. Valid user-facing waiting room view for pending businesses. |
| `apps/web/src/app/signup/rejected/page.tsx` | Rejection details & contact support prompt | 2. INTENTIONAL UI EMPTY STATE | Retained. Valid user-facing rejection view. |
| `apps/web/src/app/signup/suspended/page.tsx` | Account suspension notice | 2. INTENTIONAL UI EMPTY STATE | Retained. Valid user-facing suspension view. |
| `scratch/*.js` | `password123` test fixture credentials | 3. DEVELOPMENT/TEST ONLY | Retained strictly for automated regression scripts. |
| `biz-default` across repo | Global tenant fallback | 4. DEAD CODE / NONE | **AUDITED & CONFIRMED 0 REFERENCES** in API runtime. All controllers enforce `req.tenantId`. |

---

## Detailed Classification Breakdown

### 1. `biz-default` Audit
- **Findings**: 0 occurrences in `apps/api/src` or `apps/web/src`.
- **Verdict**: Fully eliminated in previous security phases. Every controller requires proper JWT and active tenant resolution.

### 2. Authentication Fallbacks
- **`mockDevUsers`**: Removed from `auth.service.ts`. All login queries hit PostgreSQL `prisma.user.findUnique`.
- **`password123` in provisioning**: `AdminService.provisionTenant` and `SettingsService.inviteTeamMember` no longer assign static `password123`. Cryptographically random 24-byte hex strings are used for default hashes, accompanied by `InvitationToken` generation for password setup.

### 3. WhatsApp In-Memory Cache
- **`mockConfigs`, `mockCustomers`, `mockConversations`, `mockMessages`**: Used only when PostgreSQL connection throws exceptions or in unit test setups.

---

## Conclusion
All security-sensitive fallbacks and dead dev users have been removed. UI empty states are correctly isolated to frontend client pages.
