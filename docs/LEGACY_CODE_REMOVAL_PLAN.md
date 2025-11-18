# Legacy Code Removal Plan

**Date:** January 2025  
**Goal:** Remove all legacy code that doesn't comply with Domain-Driven, API-First, Shared-Schema architecture

---

## 🎯 Strategy

Since we have **100% compliance** with the new architecture and **no backward compatibility requirements**, we can safely remove:

1. **Legacy API Endpoints** - All non-v1 endpoints that have v1 equivalents
2. **Legacy Hooks** - Old API hooks replaced by `useUnifiedApi` or `v1Api`
3. **Legacy Utilities** - Deprecated helper functions
4. **Legacy Components** - Components using old patterns

---

## 📋 Removal Checklist

### Phase 1: Legacy API Endpoints

#### ✅ Keep (System/Infrastructure)
- `/api/admin/*` - Admin endpoints (system-level)
- `/api/auth/*` - Authentication endpoints
- `/api/cron/*` - Cron jobs
- `/api/stripe/*` - Payment processing
- `/api/webhooks/*` - Webhook handlers
- `/api/health/*` - Health checks
- `/api/register.ts` - User registration
- `/api/settings.ts` - Settings endpoint
- `/api/rbac/*` - RBAC system endpoints
- `/api/organizations/*` - Organization management

#### ❌ Remove (Have v1 Equivalents)
- `/api/properties/*` → `/api/v1/properties/*`
- `/api/tenants/*` → `/api/v1/tenants/*`
- `/api/leases/*` → `/api/v1/leases/*`
- `/api/rent-payments/*` → `/api/v1/rent-payments/*`
- `/api/maintenance/*` → `/api/v1/maintenance/*`
- `/api/documents/*` → `/api/v1/documents/*`
- `/api/expenses/*` → `/api/v1/expenses/*`
- `/api/inspections/*` → `/api/v1/inspections/*`
- `/api/vendors/*` → `/api/v1/vendors/*`
- `/api/conversations/*` → `/api/v1/conversations/*`
- `/api/applications/*` → `/api/v1/applications/*`
- `/api/notifications/*` → `/api/v1/notifications/*`
- `/api/tasks/*` → `/api/v1/tasks/*`
- `/api/invitations/*` → `/api/v1/invitations/*`
- `/api/analytics/*` → `/api/v1/analytics/*`
- `/api/forms/*` → `/api/v1/forms/*`
- `/api/landlord/signature.ts` → `/api/v1/landlord/signature.ts`
- `/api/units/*` → `/api/v1/properties/[id]/units/*`
- `/api/tenant-rent-data.ts` → `/api/v1/tenants/[id]/rent-data.ts`

### Phase 2: Legacy Hooks

#### ❌ Remove
- `lib/hooks/useApiErrorHandler.js` → Use `useUnifiedApi` or `v1Api`
- `lib/hooks/useApiClient.js` → Use `useUnifiedApi` or `v1Api`
- `lib/hooks/useApiCall.js` → Use `useUnifiedApi` or `v1Api`

### Phase 3: Legacy Utilities

#### Review & Remove If Deprecated
- Check for deprecated date formatters
- Check for deprecated validation helpers
- Check for deprecated API client utilities

### Phase 4: Component Updates

#### Update Components Using Legacy Patterns
- Replace `useApiErrorHandler` with `useUnifiedApi` or `v1Api`
- Replace direct `fetch('/api/...')` calls with `v1Api` methods
- Remove any remaining legacy endpoint references

---

## 🚀 Execution Order

1. **Update Components First** - Ensure all components use v1Api
2. **Remove Legacy Hooks** - Delete deprecated hooks
3. **Remove Legacy Endpoints** - Delete deprecated API routes
4. **Clean Up Imports** - Remove unused imports
5. **Verify** - Run tests and verify no broken references

---

## ⚠️ Notes

- **No Backward Compatibility** - User explicitly stated no backward compatibility needed
- **100% Migration Complete** - All business logic already migrated to v1
- **Safe to Remove** - All legacy endpoints have deprecation warnings and v1 equivalents

---

**Status:** Ready to Execute

