# V2 Migration Plan - Complete FastAPI Implementation

## Status: In Progress

This document tracks the migration from Next.js API routes to FastAPI v2 backend.

## Phase 1: Database Schema ✅ COMPLETE

- [x] All v2 tables created (organizations, users, roles, user_roles, landlords, tenants, vendors, properties, units, leases, lease_tenants, work_orders, work_order_assignments, work_order_comments, attachments, notifications, audit_logs)
- [x] Migrations completed
- [x] Indexes added

## Phase 2: FastAPI Routers

### Completed Routers ✅
- [x] `/api/v2/auth` - Authentication (login, me)
- [x] `/api/v2/organizations` - Organizations CRUD
- [x] `/api/v2/properties` - Properties CRUD
- [x] `/api/v2/work-orders` - Work Orders CRUD + comments
- [x] `/api/v2/attachments` - File uploads/downloads
- [x] `/api/v2/landlords` - Landlords CRUD

### In Progress 🔄
- [ ] `/api/v2/tenants` - Tenants CRUD
- [ ] `/api/v2/leases` - Leases CRUD + tenant relationships
- [ ] `/api/v2/units` - Units CRUD
- [ ] `/api/v2/notifications` - Notifications (list, mark read)
- [ ] `/api/v2/audit-logs` - Audit logs (super_admin only)
- [ ] `/api/v2/users` - User management + role assignment

## Phase 3: Next.js API Route Mapping

### Domain Routes to Migrate

#### Auth Routes
- `/api/admin/auth/login` → `/api/v2/auth/login` ✅
- `/api/admin/auth/me` → `/api/v2/auth/me` ✅
- `/api/auth/login` → `/api/v2/auth/login` ✅

#### Property Management
- `/api/v1/properties` → `/api/v2/properties` ✅
- `/api/v1/units` → `/api/v2/units` (TODO)
- `/api/v1/landlords` → `/api/v2/landlords` ✅
- `/api/v1/tenants` → `/api/v2/tenants` (TODO)
- `/api/v1/leases` → `/api/v2/leases` (TODO)

#### Work Orders / Maintenance
- `/api/v1/maintenance` → `/api/v2/work-orders` ✅
- `/api/v1/maintenance/[id]/comments` → `/api/v2/work-orders/{id}/comments` ✅

#### Documents & Attachments
- `/api/v1/documents` → `/api/v2/attachments` ✅
- `/api/v1/documents/upload` → `/api/v2/attachments` (POST) ✅

#### Notifications
- `/api/v1/notifications` → `/api/v2/notifications` (TODO)

#### Admin Routes
- `/api/admin/users` → `/api/v2/users` (TODO)
- `/api/admin/organizations` → `/api/v2/organizations` ✅
- `/api/admin/audit-logs` → `/api/v2/audit-logs` (TODO)

## Phase 4: Frontend Migration

### API Client Updates
- [x] `lib/api/v2-client.ts` - FastAPI client created
- [ ] Update all frontend hooks to use v2-client
- [ ] Replace all `/api/v1/*` calls with `/api/v2/*`
- [ ] Replace all `/api/admin/*` calls with `/api/v2/*` where applicable

### Hooks to Update
- [ ] `useProperties` → use v2 API
- [ ] `useTenants` → use v2 API
- [ ] `useLandlords` → use v2 API
- [ ] `useLeases` → use v2 API
- [ ] `useWorkOrders` → use v2 API
- [ ] `useNotifications` → use v2 API

## Phase 5: Cleanup

- [ ] Remove Next.js API route files
- [ ] Update documentation
- [ ] Test all flows end-to-end

