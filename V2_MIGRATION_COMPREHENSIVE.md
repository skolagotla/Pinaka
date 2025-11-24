# Comprehensive V2 Migration Summary

## Overview
This document summarizes the comprehensive migration of the Pinaka monorepo from Next.js API routes + Prisma to FastAPI v2 + PostgreSQL v2 schema.

## Migration Status

### ✅ Completed Components

#### 1. Backend (FastAPI v2)
- ✅ All v2 database tables created (organizations, users, roles, user_roles, properties, units, leases, lease_tenants, landlords, tenants, vendors, work_orders, work_order_assignments, work_order_comments, attachments, notifications, audit_logs)
- ✅ FastAPI routers implemented for:
  - Auth (`auth_v2.py`)
  - Organizations (`organizations.py`)
  - Properties (`properties.py`)
  - Units (`units.py`)
  - Landlords (`landlords.py`)
  - Tenants (`tenants.py`)
  - Vendors (`vendors_v2.py`)
  - Leases (`leases.py`)
  - Work Orders (`work_orders.py`) - including assign-vendor endpoint
  - Attachments (`attachments.py`)
  - Notifications (`notifications.py`)
  - Audit Logs (`audit_logs.py`)
  - Users & Roles (`users.py`)
  - Global Search (`search.py`)
- ✅ RBAC (Role-Based Access Control) implemented
- ✅ JWT authentication with v2 endpoints
- ✅ Database migrations (Alembic) for all v2 tables

#### 2. Frontend Data Layer
- ✅ Single API client (`lib/api/v2-client.ts`) for FastAPI v2
- ✅ React Query hooks (`lib/hooks/useV2Data.ts`) for all domains:
  - `useOrganizations`, `useProperties`, `useUnits`
  - `useLandlords`, `useTenants`, `useVendors`
  - `useLeases`, `useWorkOrders`
  - `useAttachments`, `useNotifications`
  - `useUsers`, `useAssignRole`
- ✅ Authentication hook (`lib/hooks/useV2Auth.ts`) using v2 API
- ✅ Maintenance hooks (`useMaintenanceRequests.js`, `useMaintenanceActions.js`) using v2

#### 3. Pages Migrated to v2
- ✅ **Portfolio** (`app/portfolio/[role]/page.jsx`) - Role-based dashboard
- ✅ **Properties** (`app/properties/page.jsx`, `app/properties/[id]/page.jsx`)
- ✅ **Units** - Integrated with properties
- ✅ **Landlords** (`app/landlords/page.jsx`, `app/landlords/[id]/page.jsx`)
- ✅ **Tenants** (`app/tenants/page.jsx`)
- ✅ **Leases** (`app/leases/page.jsx`)
- ✅ **Work Orders Kanban** (`app/operations/kanban/page.jsx`) - Fully migrated
- ✅ **Partners/Vendors** (`app/partners/page.jsx`) - Using v2 hooks
- ✅ **Dashboard** (`app/dashboard/page.jsx`) - Redirects to portfolio

#### 4. Components Migrated
- ✅ **LayoutClient** - Using v2 auth
- ✅ **NotificationCenter** - Using v2 notifications API
- ✅ **GlobalSearch** - Using v2 search endpoint
- ✅ **AttachmentsList** - Using v2 attachments API
- ✅ **MaintenanceClient** - Partially migrated (core functions use v2, some legacy v1Api calls remain for complex workflows)

#### 5. Next.js API Routes Removed
- ✅ Removed migrated routes (backed up):
  - `/api/v1/properties`
  - `/api/v1/units`
  - `/api/v1/landlords`
  - `/api/v1/tenants`
  - `/api/v1/leases`
  - `/api/v1/maintenance`
  - `/api/v1/vendors`
  - `/api/v1/notifications`
  - `/api/v1/search`

### 🔄 In Progress / Partial

#### 1. MaintenanceClient Component
- ✅ Core data fetching migrated to v2 hooks
- ✅ Work order creation/update migrated to v2
- ✅ Comments migrated to v2
- ✅ Vendor assignment migrated to v2
- ⚠️ Some complex approval workflows still use v1Api (expenses, approval requests)
- ⚠️ Status mapping between old (Pending/In Progress/Closed) and new (pending/in_progress/completed) needs refinement
- ⚠️ Still uses Ant Design components (needs Flowbite migration)

#### 2. Remaining Pages
- ⚠️ Some admin pages may still use legacy APIs
- ⚠️ Financials, Reports, Settings pages need verification
- ⚠️ Calendar, Checklist, Library pages need verification

### ❌ Not Yet Migrated

#### 1. Legacy Features
- ❌ Expense tracking (still uses v1Api)
- ❌ Approval workflows (some still use adminApi)
- ❌ Some specialized endpoints (e.g., vendor usage stats)

#### 2. UI Components
- ❌ MaintenanceClient still uses Ant Design (needs Flowbite conversion)
- ❌ Some legacy components may still use Ant Design

## Architecture

### Data Flow
```
Frontend (Next.js/React)
  ↓
v2Api Client (lib/api/v2-client.ts)
  ↓
React Query Hooks (lib/hooks/useV2Data.ts)
  ↓
FastAPI Backend (apps/backend-api)
  ↓
PostgreSQL v2 Schema
```

### Authentication Flow
1. User logs in via `/api/v2/auth/login`
2. JWT token stored in localStorage as `v2_access_token`
3. `v2Api` client automatically includes token in requests
4. `useV2Auth` hook provides current user and roles
5. RBAC enforced at FastAPI level

### Role System
- **super_admin**: Platform-wide access
- **pmc_admin**: Organization-wide admin
- **pm**: Property manager (org-scoped)
- **landlord**: Property owner (sees own properties)
- **tenant**: Renter (sees own leases/work orders)
- **vendor**: Service provider (sees assigned work orders)

## Key Files

### Backend
- `apps/backend-api/main.py` - FastAPI app with all routers
- `apps/backend-api/routers/*.py` - Domain routers
- `apps/backend-api/db/models_v2.py` - SQLAlchemy models
- `apps/backend-api/schemas/*.py` - Pydantic schemas
- `apps/backend-api/alembic/versions/*.py` - Database migrations

### Frontend
- `lib/api/v2-client.ts` - Central API client
- `lib/hooks/useV2Data.ts` - React Query hooks
- `lib/hooks/useV2Auth.ts` - Authentication hook
- `apps/web-app/app/**/page.jsx` - Next.js pages

## Migration Checklist

### Backend
- [x] Create v2 database schema
- [x] Implement FastAPI routers
- [x] Add RBAC middleware
- [x] Create database migrations
- [x] Add vendor assignment endpoint
- [x] Add global search endpoint

### Frontend
- [x] Create v2 API client
- [x] Create React Query hooks
- [x] Migrate authentication
- [x] Migrate core pages (Portfolio, Properties, Tenants, Landlords, Leases)
- [x] Migrate Work Orders Kanban
- [x] Migrate Partners/Vendors
- [x] Migrate NotificationCenter
- [x] Migrate GlobalSearch
- [x] Migrate AttachmentsList
- [x] Partially migrate MaintenanceClient
- [ ] Complete MaintenanceClient migration (expenses, approvals)
- [ ] Convert MaintenanceClient to Flowbite UI
- [ ] Verify all admin pages
- [ ] Remove all remaining v1Api calls
- [ ] Remove all Prisma references

### Cleanup
- [x] Remove migrated Next.js API routes
- [ ] Remove unused Prisma files
- [ ] Update documentation
- [ ] Add inline comments explaining v2 architecture

## Next Steps

1. **Complete MaintenanceClient Migration**
   - Migrate expense tracking to v2 (if v2 endpoint exists)
   - Migrate approval workflows to v2
   - Convert to Flowbite UI components

2. **Verify Remaining Pages**
   - Check Financials, Reports, Settings
   - Check Calendar, Checklist, Library
   - Ensure all use v2 APIs

3. **Remove Legacy Code**
   - Remove all v1Api imports
   - Remove Prisma imports
   - Remove unused Next.js API route files

4. **Testing**
   - Test all roles (super_admin, pmc_admin, pm, landlord, tenant, vendor)
   - Test critical flows (create work order, assign vendor, add comment)
   - Test role-based access control

5. **Documentation**
   - Add comments explaining v2 architecture
   - Update README with v2 setup instructions
   - Document role system

## Notes

- The v2 migration is **mostly complete** for core functionality
- MaintenanceClient is the largest remaining component to fully migrate
- Some legacy features (expenses, approvals) may need v2 endpoints created first
- UI consistency (Flowbite) is important but can be done incrementally
- All critical user-facing pages are now using v2 APIs

## Verification

Run the verification script to check migration status:
```bash
node scripts/verify-v2-migration.js
```

This will show:
- Frontend files still using v1 API
- Next.js routes that can be removed
- FastAPI routers that are active

