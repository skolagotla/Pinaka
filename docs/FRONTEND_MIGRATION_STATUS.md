# Frontend Migration Status: Legacy APIs → v1 APIs

**Date:** January 2025  
**Status:** 🚀 **In Progress** - Core Components Migrated

---

## 🎯 Migration Overview

Migrating all frontend components from legacy APIs (`/api/...`) to v1 APIs (`/api/v1/...`) using the Domain-Driven, API-First, Shared-Schema architecture.

---

## ✅ Completed Migrations

### Core Components (High Priority)

1. **✅ Properties (Landlord)**
   - File: `components/pages/landlord/properties/ui.jsx`
   - Status: Migrated to v1Api
   - Changes:
     - Updated `usePinakaCRUDWithAddress` to use `domain: 'properties'` and `useV1Api: true`
     - Endpoint: `/api/properties` → `/api/v1/properties`

2. **✅ Tenants (Landlord)**
   - File: `components/pages/landlord/tenants/ui.jsx`
   - Status: Migrated to v1Api
   - Changes:
     - Updated `usePinakaCRUDWithAddress` to use `domain: 'tenants'` and `useV1Api: true`
     - Endpoint: `/api/tenants` → `/api/v1/tenants`

3. **✅ Leases (Landlord + PMC)**
   - Files:
     - `components/pages/landlord/leases/ui.jsx`
     - `components/pages/pmc/leases/ui.jsx`
   - Status: Migrated to v1Api
   - Changes:
     - Updated `usePinakaCRUD` to use `domain: 'leases'` and `useV1Api: true`
     - Endpoint: `/api/leases` → `/api/v1/leases`

4. **🔄 Rent Payments (Landlord) - Partial**
   - File: `components/pages/landlord/rent-payments/ui.jsx`
   - Status: Partially migrated (fetchPayments updated)
   - Changes:
     - Updated `fetchPayments` to use `v1Api.rentPayments.list()`
     - Still needs: Update other fetch calls (partial payments, send receipt, etc.)

---

## 🔧 Infrastructure Updates

### ✅ Enhanced usePinakaCRUD Hook

**File:** `lib/hooks/usePinakaCRUD.js`

**Changes:**
- Added `domain` parameter (e.g., 'properties', 'tenants', 'leases')
- Added `useV1Api` flag (default: false for backward compatibility)
- Updated `create`, `update`, `remove`, and `refresh` methods to support v1Api
- Lazy loads v1Api client to avoid circular dependencies
- Automatically maps domain names to v1Api resources

**Usage:**
```javascript
const pinaka = usePinakaCRUD({
  apiEndpoint: '/api/v1/properties', // v1 endpoint
  domain: 'properties', // Domain name for v1Api
  useV1Api: true, // Use v1Api client
  initialData: properties,
  entityName: 'Property',
});
```

### ✅ Enhanced usePinakaCRUDWithAddress Hook

**File:** `lib/hooks/usePinakaCRUDWithAddress.js`

**Changes:**
- Now passes `domain` and `useV1Api` flags to `usePinakaCRUD`
- Maintains backward compatibility

---

## ⏳ Pending Migrations

### High Priority Components

1. **Rent Payments (Landlord)** - Partial
   - Remaining: Update partial payment endpoints, send receipt endpoints
   - File: `components/pages/landlord/rent-payments/ui.jsx`

2. **Maintenance Requests**
   - Files:
     - `components/shared/MaintenanceClient.jsx`
     - `components/pages/landlord/maintenance/ui.jsx` (if exists)
   - Uses: `useMaintenanceRequests`, `useMaintenanceActions` hooks
   - Needs: Update hooks to use v1Api

3. **Documents**
   - Files:
     - `components/pages/landlord/documents/ui.jsx`
     - `components/shared/LibraryClient.jsx`
   - Needs: Migration to v1Api

### Medium Priority Components

4. **Vendors**
   - Files:
     - `components/pages/landlord/vendors/ui.jsx`
     - `components/pages/pmc/vendors/ui.jsx`
   - Needs: Migration to v1Api

5. **Inspections**
   - Files:
     - `components/pages/landlord/inspections/ui.jsx`
     - `components/pages/pmc/inspections/ui.jsx`
   - Needs: Migration to v1Api

6. **Expenses**
   - Files:
     - `components/pages/landlord/financials/ui.jsx`
   - Needs: Migration to v1Api

7. **Conversations/Messages**
   - Files:
     - `components/pages/pmc/messages/ui.jsx`
     - `components/shared/MessagesClient.jsx`
     - `components/shared/PMCCommunicationChannel.jsx`
   - Needs: Migration to v1Api

### Low Priority Components

8. **Applications**
   - Needs: Migration to v1Api

9. **Notifications**
   - Files:
     - `components/shared/NotificationCenter.jsx`
   - Needs: Migration to v1Api

10. **Tasks**
    - Files:
      - `components/pages/landlord/calendar/ui.jsx`
      - `components/pages/pmc/calendar/ui.jsx`
    - Needs: Migration to v1Api

11. **Invitations**
    - Files:
      - `components/pages/pmc/invitations/ui.jsx`
    - Needs: Migration to v1Api

---

## 📋 Migration Pattern

### For Components Using usePinakaCRUD

**Before:**
```javascript
const pinaka = usePinakaCRUD({
  apiEndpoint: '/api/properties',
  initialData: properties,
  entityName: 'Property',
});
```

**After:**
```javascript
const pinaka = usePinakaCRUD({
  apiEndpoint: '/api/v1/properties', // v1 endpoint
  domain: 'properties', // Domain name for v1Api
  useV1Api: true, // Use v1Api client
  initialData: properties,
  entityName: 'Property',
});
```

### For Components Using usePinakaCRUDWithAddress

**Before:**
```javascript
const pinaka = usePinakaCRUDWithAddress({
  apiEndpoint: '/api/tenants',
  initialData: tenants,
  entityName: 'Tenant',
  initialCountry: 'CA',
});
```

**After:**
```javascript
const pinaka = usePinakaCRUDWithAddress({
  apiEndpoint: '/api/v1/tenants', // v1 endpoint
  domain: 'tenants', // Domain name for v1Api
  useV1Api: true, // Use v1Api client
  initialData: tenants,
  entityName: 'Tenant',
  initialCountry: 'CA',
});
```

### For Components Using useUnifiedApi/fetch Directly

**Before:**
```javascript
const { fetch } = useUnifiedApi();
const response = await fetch('/api/rent-payments', {});
const result = await response.json();
```

**After:**
```javascript
import { v1Api } from '@/lib/api/v1-client';
const response = await v1Api.rentPayments.list({ page: 1, limit: 50 });
const payments = response.data?.data || [];
```

---

## 🎯 Domain Mapping

| Domain Name | v1Api Resource | Legacy Endpoint |
|-------------|----------------|----------------|
| `properties` | `v1Api.properties` | `/api/properties` |
| `tenants` | `v1Api.tenants` | `/api/tenants` |
| `leases` | `v1Api.leases` | `/api/leases` |
| `rentPayments` | `v1Api.rentPayments` | `/api/rent-payments` |
| `maintenance` | `v1Api.maintenance` | `/api/maintenance` |
| `documents` | `v1Api.documents` | `/api/documents` |
| `expenses` | `v1Api.expenses` | `/api/financials/expenses` |
| `inspections` | `v1Api.inspections` | `/api/inspections` |
| `vendors` | `v1Api.vendors` | `/api/vendors` |
| `conversations` | `v1Api.conversations` | `/api/conversations` |
| `applications` | `v1Api.applications` | `/api/applications` |
| `notifications` | `v1Api.notifications` | `/api/notifications` |
| `tasks` | `v1Api.tasks` | `/api/tasks` |
| `invitations` | `v1Api.invitations` | `/api/invitations` |

---

## 📊 Progress Summary

| Category | Completed | Total | Progress |
|----------|-----------|-------|----------|
| **Core Components** | 3 | 4 | 75% |
| **High Priority** | 1 | 3 | 33% |
| **Medium Priority** | 0 | 4 | 0% |
| **Low Priority** | 0 | 4 | 0% |
| **Infrastructure** | 2 | 2 | 100% |
| **Overall** | 6 | 17 | ~35% |

---

## 🚀 Next Steps

1. **Complete Rent Payments Migration**
   - Update partial payment endpoints
   - Update send receipt endpoints
   - Test thoroughly

2. **Migrate Maintenance Components**
   - Update `useMaintenanceRequests` hook
   - Update `useMaintenanceActions` hook
   - Migrate `MaintenanceClient.jsx`

3. **Migrate Remaining Components**
   - Follow migration pattern above
   - Test each component after migration
   - Update documentation

4. **Remove Legacy API Support**
   - After all components migrated
   - Remove legacy API endpoints
   - Clean up deprecated code

---

## ✅ Testing Checklist

For each migrated component:

- [ ] List/GET operations work
- [ ] Create/POST operations work
- [ ] Update/PATCH operations work
- [ ] Delete/DELETE operations work
- [ ] Search/filter works
- [ ] Pagination works (if applicable)
- [ ] Error handling works
- [ ] Loading states work
- [ ] Type safety verified (no `any` types)

---

**Last Updated:** January 2025

