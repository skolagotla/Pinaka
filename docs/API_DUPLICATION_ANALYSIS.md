# API Duplication Analysis

**Date:** January 17, 2025

This document analyzes potential API endpoint duplications in the codebase.

---

## 🔍 Potential Duplicates Found

### 1. ⚠️ **Lease Renewal Cron Jobs** - OVERLAPPING FUNCTIONALITY

**Files:**
- `pages/api/cron/lease-renewals.ts` - **OLD** (sends reminders 60 days before)
- `pages/api/cron/lease-expiration-check.ts` - **NEW** (sends reminders at 90, 75, 65-61 days)

**Analysis:**
- **OLD endpoint** (`lease-renewals.ts`): Sends a single reminder 60 days before expiration
- **NEW endpoint** (`lease-expiration-check.ts`): Sends multiple reminders at 90, 75, 65-61 days AND auto-converts to month-to-month

**Recommendation:** 
- ✅ **KEEP NEW** (`lease-expiration-check.ts`) - More comprehensive, implements business rules
- ❌ **DEPRECATE/REMOVE OLD** (`lease-renewals.ts`) - Functionality is superseded

**Action:** Remove or deprecate `pages/api/cron/lease-renewals.ts` since the new endpoint covers all functionality.

---

### 2. ⚠️ **Partial Payment Endpoints** - POTENTIAL OVERLAP ⚠️ NEEDS REVIEW

**Files:**
- `pages/api/rent-payments/[id]/partial.ts` - Creates partial payment (POST)
- `pages/api/rent-payments/[id]/partial-payments.ts` - Lists (GET) and creates (POST) partial payments
- `pages/api/partial-payments/[id].ts` - Updates (PATCH) and deletes (DELETE) partial payment by ID
- `pages/api/rent-payments/[id]/partial-payment/[partialId].ts` - Updates (PATCH) and deletes (DELETE) partial payment by ID

**Analysis:**
- **`/api/rent-payments/[id]/partial.ts`** - POST only, creates partial payment with receipt generation
- **`/api/rent-payments/[id]/partial-payments.ts`** - GET (list) and POST (create), simpler version
- **`/api/partial-payments/[id].ts`** - PATCH and DELETE by partial payment ID
- **`/api/rent-payments/[id]/partial-payment/[partialId].ts`** - PATCH and DELETE by partial payment ID (nested route)

**Recommendation:**
- ⚠️ **REVIEW NEEDED** - There appears to be overlap:
  - Two endpoints for creating partial payments (`partial.ts` vs `partial-payments.ts`)
  - Two endpoints for updating/deleting (`partial-payments/[id].ts` vs `rent-payments/[id]/partial-payment/[partialId].ts`)
- **Suggested consolidation:**
  - Keep `/api/rent-payments/[id]/partial-payments.ts` for GET/POST (list and create)
  - Keep `/api/rent-payments/[id]/partial-payment/[partialId].ts` for PATCH/DELETE (nested route is clearer)
  - Consider removing `/api/rent-payments/[id]/partial.ts` if `partial-payments.ts` covers the same functionality
  - Consider removing `/api/partial-payments/[id].ts` in favor of nested route

**Action:** Review which endpoints are actually used in the UI and consolidate.

---

### 3. ✅ **Stripe Webhooks** - DIFFERENT PURPOSES (NOT DUPLICATES)

**Files:**
- `pages/api/stripe/webhook.ts` - **ACTIVE** (handles payment webhooks: payment_intent, charge.dispute)
- `pages/api/webhooks/stripe.ts` - **COMMENTED OUT** (handles subscription webhooks: customer.subscription.*)

**Analysis:**
- **Different purposes:**
  - `stripe/webhook.ts` - Payment processing webhooks (payment_intent.succeeded, payment_intent.payment_failed, charge.dispute.*)
  - `webhooks/stripe.ts` - Subscription management webhooks (customer.subscription.*, invoice.*) - **NOT YET IMPLEMENTED**

**Recommendation:**
- ✅ **KEEP BOTH** - They serve different purposes
- ⚠️ **Consider consolidating** - Could merge into one webhook handler with event routing, but not critical

---

### 4. ✅ **Document Expiration** - DIFFERENT PURPOSES (NOT DUPLICATES)

**Files:**
- `pages/api/cron/document-expirations.ts` - **AUTOMATED** (cron job, runs daily)
- `pages/api/admin/check-expiration.ts` - **MANUAL** (admin/landlord can trigger manually)

**Analysis:**
- **Different purposes:**
  - `cron/document-expirations.ts` - Automated daily cron job
  - `admin/check-expiration.ts` - Manual trigger for testing/debugging

**Recommendation:**
- ✅ **KEEP BOTH** - Automated vs manual serve different needs

---

### 5. ✅ **Lease Documents** - DIFFERENT ACCESS LEVELS (NOT DUPLICATES)

**Files:**
- `pages/api/lease-documents/` - **LANDLORD** access (upload, manage lease documents)
- `pages/api/tenant-lease-documents/` - **TENANT** access (view only, through their lease)

**Analysis:**
- **Different access levels:**
  - `lease-documents/` - Landlords can upload/manage documents
  - `tenant-lease-documents/` - Tenants can only view documents for their leases

**Recommendation:**
- ✅ **KEEP BOTH** - Different permissions and use cases

---

### 6. ✅ **Rent Payments** - DIFFERENT ACCESS LEVELS (NOT DUPLICATES)

**Files:**
- `pages/api/rent-payments/` - **LANDLORD/PMC** access (manage all rent payments)
- `pages/api/tenants/payments/` - **TENANT** access (view own payment history)

**Analysis:**
- **Different access levels:**
  - `rent-payments/` - Landlords/PMCs manage payments for all tenants
  - `tenants/payments/` - Tenants view only their own payments

**Recommendation:**
- ✅ **KEEP BOTH** - Different permissions and use cases

---

### 7. ✅ **Authentication** - DIFFERENT USER TYPES (NOT DUPLICATES)

**Files:**
- `pages/api/auth/login.ts` - **USER** login (landlord/tenant/pmc)
- `pages/api/admin/auth/login.ts` - **ADMIN** login (super admin, platform admin)

**Analysis:**
- **Different user types:**
  - `auth/login.ts` - Regular users (landlord, tenant, PMC)
  - `admin/auth/login.ts` - Admin users (super admin, platform admin)

**Recommendation:**
- ✅ **KEEP BOTH** - Different authentication flows for different user types

---

### 8. ✅ **Logout** - DIFFERENT USER TYPES (NOT DUPLICATES)

**Files:**
- `pages/api/auth/logout.ts` - **USER** logout
- `pages/api/admin/auth/logout.ts` - **ADMIN** logout

**Analysis:**
- **Different user types:**
  - `auth/logout.ts` - Regular users
  - `admin/auth/logout.ts` - Admin users

**Recommendation:**
- ✅ **KEEP BOTH** - Different session management for different user types

---

## 📊 Summary

### Actual Duplicates Found: **1-2**

1. ⚠️ **Lease Renewal Cron Jobs** - `lease-renewals.ts` should be deprecated/removed
2. ⚠️ **Partial Payment Endpoints** - Potential overlap, needs review

### Not Duplicates (Different Purposes): **6**

1. ✅ Stripe Webhooks (payment vs subscription)
2. ✅ Document Expiration (automated vs manual)
3. ✅ Lease Documents (landlord vs tenant access)
4. ✅ Rent Payments (landlord vs tenant access)
5. ✅ Authentication (user vs admin)
6. ✅ Logout (user vs admin)

---

## 🎯 Recommendations

### High Priority
1. **Remove `pages/api/cron/lease-renewals.ts`** - Functionality fully replaced by `lease-expiration-check.ts`
   - Update `vercel.json` to use `/api/cron/lease-expiration-check` instead
   - Remove from documentation

2. **Review and consolidate partial payment endpoints** - Check which are actually used:
   - `/api/rent-payments/[id]/partial.ts` vs `/api/rent-payments/[id]/partial-payments.ts`
   - `/api/partial-payments/[id].ts` vs `/api/rent-payments/[id]/partial-payment/[partialId].ts`
   - Keep the ones that are used, remove duplicates

### Low Priority (Optional)
3. **Consider consolidating Stripe webhooks** - Could merge into one handler with event routing, but not critical
4. **Consider consolidating auth endpoints** - Could use a single login endpoint with role detection, but current separation is fine

---

## ✅ Conclusion

**✅ CONSOLIDATION COMPLETE (January 17, 2025)**

**Duplicates Found and Removed:**
1. ✅ **Lease Renewal Cron Jobs** - Removed `pages/api/cron/lease-renewals.ts`, updated `vercel.json` to use `/api/cron/lease-expiration-check`
2. ✅ **Partial Payment Endpoints** - Consolidated:
   - ✅ Kept `/api/rent-payments/[id]/partial.ts` - POST (creates with receipt generation, used in UI)
   - ✅ Kept `/api/rent-payments/[id]/partial-payment/[partialId].ts` - PATCH/DELETE (nested route, used in UI)
   - ❌ Removed `/api/rent-payments/[id]/partial-payments.ts` - GET/POST (not used, partial payments included in rent payment response)
   - ❌ Removed `/api/partial-payments/[id].ts` - PATCH/DELETE (flat route, not used)

All other similar endpoints serve different purposes (different access levels, different user types, or different functionality).

---

## 📊 Impact

- **Code Reduction:** Removed 2 duplicate API endpoints
- **Maintenance:** Reduced code duplication, easier to maintain
- **Clarity:** Clearer API structure with no overlapping functionality

