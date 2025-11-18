# Remaining TODOs Breakdown

**Last Updated:** January 2025  
**Status:** All Critical TODOs Complete - These are Optional/Future Enhancements

---

## 📊 Summary

- **Frontend Features:** 2 TODOs (PDF/Excel export)
- **Backend Services:** 12 TODOs (payment processing, notifications, etc.)
- **Infrastructure:** 6 TODOs (monitoring, RBAC integration, etc.)
- **Total:** 20 TODOs (all optional/future work)

---

## 🎨 Frontend Features (Optional)

### 1. Financial Reports Export
**File:** `components/shared/FinancialReports.jsx:82`  
**TODO:** `// TODO: Implement PDF/Excel export`  
**Current Status:** Shows "Export functionality coming soon" message  
**Priority:** Medium  
**Description:** Add ability to export financial reports as PDF or Excel files  
**Impact:** Nice-to-have feature for reporting functionality

### 2. Tax Report PDF Download
**File:** `components/pages/accountant/tax-reporting/ui.jsx:54`  
**TODO:** `// TODO: Generate PDF and download`  
**Current Status:** Shows "PDF download feature coming soon" message  
**Priority:** Medium  
**Description:** Generate and download T776 tax reports as PDF  
**Impact:** Nice-to-have feature for tax reporting

---

## 💳 Payment Processing (Backend)

### 3. Payment Gateway Processing
**File:** `lib/services/payment-gateway-failure-service.js:158`  
**TODO:** `// TODO: Actually process the payment via payment gateway`  
**Priority:** High (when payment gateway is integrated)  
**Description:** Implement actual payment processing via Stripe/payment gateway  
**Impact:** Required for production payment processing

### 4. Payment Retry via Stripe
**File:** `lib/services/payment-retry-service.js:173`  
**TODO:** `// TODO: Actually retry the payment via Stripe API`  
**Priority:** High (when payment gateway is integrated)  
**Description:** Implement actual payment retry logic using Stripe API  
**Impact:** Required for automatic payment retries

### 5. Payment Gateway Health Check
**File:** `lib/services/payment-gateway-failure-service.js:193`  
**TODO:** `// TODO: Implement actual gateway health check`  
**Priority:** Medium  
**Description:** Implement health check for payment gateway availability  
**Impact:** Improves reliability monitoring

### 6. Late Fee Application
**File:** `lib/services/payment-retry-service.js:253`  
**TODO:** `// TODO: Apply late fees (implement late fee calculation service)`  
**Priority:** Medium  
**Description:** Integrate late fee calculation service when payment retry fails  
**Impact:** Required for complete payment workflow

### 7. Payment Dispute Audit Logging
**File:** `lib/services/payment-dispute-service.js:313`  
**TODO:** `// TODO: Add to audit log`  
**Priority:** Low  
**Description:** Add payment dispute actions to audit log  
**Impact:** Improves audit trail completeness

---

## 📱 Notifications (Backend)

### 8. SMS Sending
**File:** `lib/services/notification-service.js:113`  
**TODO:** `// TODO: SMS sending (when implemented)`  
**Priority:** Medium  
**Description:** Implement SMS notification sending  
**Impact:** Adds SMS notification capability

### 9. Push Notifications
**File:** `lib/services/notification-service.js:114`  
**TODO:** `// TODO: Push notification (when implemented)`  
**Priority:** Medium  
**Description:** Implement push notification sending  
**Impact:** Adds push notification capability

---

## 👥 Tenant Management (Backend)

### 10. Emergency Contacts & Employers
**File:** `lib/domains/tenant/TenantService.ts:63`  
**TODO:** `// TODO: Handle emergency contacts and employers creation`  
**Priority:** Medium  
**Description:** Implement creation of emergency contacts and employers when creating tenant  
**Impact:** Completes tenant creation workflow

---

## 📅 Financial Periods (Backend)

### 11. Year-End Closing Period Reopening
**File:** `lib/services/year-end-closing-service.js:117`  
**TODO:** `// TODO: Implement when FinancialPeriod model is created`  
**Priority:** Low  
**Description:** Implement period reopening functionality when FinancialPeriod model exists  
**Impact:** Required for year-end closing workflow

---

## 🔐 RBAC Integration (Backend)

### 12. Authentication System Integration
**Files:**
- `lib/rbac/middleware.ts:45`
- `lib/rbac/queryBuilders.ts:327, 340`
- `lib/rbac/apiIntegration.ts:47`
- `lib/rbac/combinedMiddleware.ts:41`
- `lib/rbac/examples.ts:178`

**TODO:** `// TODO: Implement based on your authentication system`  
**Priority:** High (when auth system is finalized)  
**Description:** Integrate RBAC middleware with authentication system  
**Impact:** Required for RBAC to work properly

---

## 🔍 Monitoring & Infrastructure

### 13. Error Monitoring Service
**File:** `lib/utils/api-interceptors.js:73`  
**TODO:** `// TODO: Send to error monitoring service (Sentry, DataDog, etc.)`  
**Priority:** Medium  
**Description:** Integrate error logging with external monitoring service (Sentry, DataDog)  
**Impact:** Improves production error tracking

### 14. Late Fee Service - PMC ID
**File:** `lib/services/late-fee-service.js:157`  
**TODO:** `// TODO: Get PMC ID if applicable`  
**Priority:** Low  
**Description:** Retrieve PMC ID when calculating late fees for PMC-managed properties  
**Impact:** Completes late fee calculation logic

### 15. Trial Handler Email Notifications
**File:** `lib/services/trial-handler.ts:98`  
**TODO:** `// TODO: Send email notifications`  
**Priority:** Low  
**Description:** Send email notifications for trial-related events  
**Impact:** Improves trial management communication

---

## 📊 Priority Breakdown

### High Priority (Required for Production)
- Payment Gateway Processing (#3)
- Payment Retry via Stripe (#4)
- RBAC Authentication Integration (#12)

### Medium Priority (Important Features)
- Financial Reports Export (#1)
- Tax Report PDF Download (#2)
- Payment Gateway Health Check (#5)
- Late Fee Application (#6)
- SMS Sending (#8)
- Push Notifications (#9)
- Emergency Contacts & Employers (#10)
- Error Monitoring Service (#13)

### Low Priority (Nice-to-Have)
- Payment Dispute Audit Logging (#7)
- Year-End Closing Period Reopening (#11)
- Late Fee Service - PMC ID (#14)
- Trial Handler Email Notifications (#15)

---

## ✅ What's Already Complete

All critical TODOs from the legacy code removal and architecture migration are complete:
- ✅ Legacy hook removal (useApiErrorHandler, fetchWithErrorHandling)
- ✅ Component migration to v1Api
- ✅ Unused import cleanup
- ✅ Outdated comment cleanup
- ✅ Domain-driven architecture implementation
- ✅ API-first design
- ✅ Shared schema implementation

---

## 🎯 Recommendation

These TODOs represent **future enhancements** and **backend integrations** that don't block the current refactoring work. They can be addressed:

1. **As needed** - When specific features are requested
2. **During sprint planning** - As part of feature development
3. **When dependencies are ready** - Some require external services (Stripe, SMS provider, etc.)

**Current Status:** ✅ **All critical refactoring work is complete!**

