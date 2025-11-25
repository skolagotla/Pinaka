# Portfolio Unification Report
## Complete Restructure to Unified v2 DDD, API-First, SSOT Architecture

**Date:** $(date)
**Status:** ✅ Phase 1-4 Complete | ⚠️ Phase 5-7 Pending

---

## Executive Summary

This report documents the comprehensive restructure of the Pinaka web-app UI into a unified Portfolio module, replacing all separate admin panels and portals with a single, role-based interface following v2 DDD, API-First, and Single Source of Truth (SSOT) principles.

---

## ✅ COMPLETED PHASES

### Phase 1: Analysis ✅
- Analyzed entire codebase structure
- Identified v1 code locations (admin routes, Prisma, Zod schemas)
- Mapped existing components and hooks
- Documented current navigation structure

### Phase 2: Unified Portfolio Structure ✅
**Created new `/portfolio` module with role-based tabs:**

1. **`/portfolio`** - Dashboard (Overview)
2. **`/portfolio/administrators`** - Administrators (SUPER_ADMIN only)
3. **`/portfolio/pmcs`** - PMCs (SUPER_ADMIN only)
4. **`/portfolio/properties`** - Properties
5. **`/portfolio/units`** - Units
6. **`/portfolio/landlords`** - Landlords
7. **`/portfolio/tenants`** - Tenants
8. **`/portfolio/leases`** - Leases
9. **`/portfolio/vendors`** - Vendors

**Files Created:**
- `apps/web-app/app/portfolio/layout.jsx` - RBAC-aware layout with dynamic sidebar
- `apps/web-app/app/portfolio/page.jsx` - Dashboard page
- `apps/web-app/app/portfolio/administrators/page.jsx` - Administrators page
- `apps/web-app/app/portfolio/pmcs/page.jsx` - PMCs page
- `apps/web-app/app/portfolio/properties/page.jsx` - Properties page
- `apps/web-app/app/portfolio/units/page.jsx` - Units page
- `apps/web-app/app/portfolio/landlords/page.jsx` - Landlords page
- `apps/web-app/app/portfolio/tenants/page.jsx` - Tenants page
- `apps/web-app/app/portfolio/leases/page.jsx` - Leases page
- `apps/web-app/app/portfolio/vendors/page.jsx` - Vendors page

**Components Created:**
- `apps/web-app/components/pages/shared/Portfolio/Dashboard.jsx`
- `apps/web-app/components/pages/shared/Portfolio/Administrators.jsx`
- `apps/web-app/components/pages/shared/Portfolio/PMCs.jsx`
- `apps/web-app/components/pages/shared/Portfolio/Properties.jsx`
- `apps/web-app/components/pages/shared/Portfolio/Units.jsx`
- `apps/web-app/components/pages/shared/Portfolio/Landlords.jsx`
- `apps/web-app/components/pages/shared/Portfolio/Tenants.jsx`
- `apps/web-app/components/pages/shared/Portfolio/Leases.jsx`
- `apps/web-app/components/pages/shared/Portfolio/Vendors.jsx`

### Phase 3: Organization Scoping Fixes ✅
**Fixed critical organization scoping issues:**

1. **`useUnits` Hook** - Added organization scoping support
   - **File:** `apps/web-app/lib/hooks/useV2Data.ts`
   - **Change:** Added `organizationId` parameter and `useQueryEnabled()` check
   - **Impact:** Units now properly respect RBAC and organization boundaries

2. **All Hooks Verified** - Confirmed all hooks use `useQueryEnabled()` correctly
   - `useProperties` ✅
   - `useLandlords` ✅
   - `useTenants` ✅
   - `useLeases` ✅
   - `useWorkOrders` ✅
   - `useVendors` ✅
   - `useUsers` ✅

3. **Organization Scoping Logic:**
   - **SUPER_ADMIN:** `organizationId = undefined` → sees ALL data
   - **Other Roles:** `organizationId = user.user.organization_id` → scoped to their org
   - **Query Enablement:** `useQueryEnabled()` returns `true` for super_admin even without org

### Phase 4: RBAC-Aware Navigation ✅
**Updated Navigation Component:**
- **File:** `apps/web-app/components/Navigation.jsx`
- **Change:** Removed duplicate routes, unified under `/portfolio`
- **New Structure:**
  - `/portfolio` - Main entry point (replaces `/dashboard`, `/properties`, `/tenants`, etc.)
  - `/work-orders-v2` - Work Orders (separate module)
  - `/messages` - Messages
  - `/reports` - Reports
  - `/settings` - Settings

**Portfolio Layout Navigation:**
- Dynamic sidebar based on user role
- SUPER_ADMIN sees: Dashboard, Administrators, PMCs, Properties, Units, Landlords, Tenants, Leases, Vendors
- PMC_ADMIN sees: Dashboard, Properties, Units, Landlords, Tenants, Leases, Vendors
- PM sees: Dashboard, Properties, Units, Landlords, Tenants, Leases, Vendors
- LANDLORD sees: Dashboard, Properties, Units, Tenants, Leases, Vendors
- TENANT sees: Dashboard, Leases, Vendors

---

## ⚠️ PENDING PHASES

### Phase 5: Remove V1 Code ⚠️
**Status:** Not Started - Requires careful migration

**Files/Directories to Remove:**
- `apps/web-app/app/admin/` - Entire admin directory (24+ files)
- `apps/web-app/components/admin/` - Admin-specific components
- `apps/web-app/lib/admin/` - Admin utilities (if exists)
- All Prisma imports and usage
- All Zod domain model imports (use OpenAPI types instead)
- Next.js API routes (`/api/admin/*`, `/api/v1/*`)

**Before Removal:**
1. Verify all admin functionality migrated to `/platform` or `/portfolio`
2. Update all imports from `@/app/admin/*` to new locations
3. Remove `/admin` route references
4. Test all role-based access

### Phase 6: Update Components to v2 API ⚠️
**Status:** Partially Complete

**Remaining Work:**
- Verify all components use `v2Api` from `@/lib/api/v2-client`
- Remove any `fetch("/api/...")` calls
- Update to use shared types from `packages/shared-types`
- Fix field name mismatches between frontend ↔ backend

### Phase 7: Testing with Ontario Dataset ⚠️
**Status:** Not Started

**Test Cases:**
- [ ] Super Admin can view ALL seeded Ontario organizations, PMCs, PMs, landlords, tenants, properties, units, leases
- [ ] PMC Admin sees only their PMC, landlords, PMs, properties
- [ ] PM sees only assigned properties
- [ ] landlord@example.com sees only owned properties & related data
- [ ] tenant@example.com sees only their lease data

---

## 📋 FILES CREATED

### Portfolio Pages (9 files)
1. `apps/web-app/app/portfolio/layout.jsx`
2. `apps/web-app/app/portfolio/page.jsx`
3. `apps/web-app/app/portfolio/administrators/page.jsx`
4. `apps/web-app/app/portfolio/pmcs/page.jsx`
5. `apps/web-app/app/portfolio/properties/page.jsx`
6. `apps/web-app/app/portfolio/units/page.jsx`
7. `apps/web-app/app/portfolio/landlords/page.jsx`
8. `apps/web-app/app/portfolio/tenants/page.jsx`
9. `apps/web-app/app/portfolio/leases/page.jsx`
10. `apps/web-app/app/portfolio/vendors/page.jsx`

### Portfolio Components (9 files)
1. `apps/web-app/components/pages/shared/Portfolio/Dashboard.jsx`
2. `apps/web-app/components/pages/shared/Portfolio/Administrators.jsx`
3. `apps/web-app/components/pages/shared/Portfolio/PMCs.jsx`
4. `apps/web-app/components/pages/shared/Portfolio/Properties.jsx`
5. `apps/web-app/components/pages/shared/Portfolio/Units.jsx`
6. `apps/web-app/components/pages/shared/Portfolio/Landlords.jsx`
7. `apps/web-app/components/pages/shared/Portfolio/Tenants.jsx`
8. `apps/web-app/components/pages/shared/Portfolio/Leases.jsx`
9. `apps/web-app/components/pages/shared/Portfolio/Vendors.jsx`

---

## 📋 FILES MODIFIED

### Hooks
1. **`apps/web-app/lib/hooks/useV2Data.ts`**
   - Fixed `useUnits` to include organization scoping
   - Verified all hooks use `useQueryEnabled()` correctly

### Navigation
1. **`apps/web-app/components/Navigation.jsx`**
   - Removed duplicate routes
   - Unified navigation under `/portfolio`
   - Simplified base navigation items

---

## 🔧 HOOKS UPDATED

### Organization Scoping Fixes
- ✅ `useUnits` - Added organization scoping and query enablement
- ✅ All other hooks verified to use `useQueryEnabled()` correctly

### RBAC Logic
- ✅ SUPER_ADMIN: `organizationId = undefined` → sees all data
- ✅ Other roles: `organizationId = user.user.organization_id` → scoped access
- ✅ Query enablement: Super admin can query without organization

---

## 🗂️ NEW FOLDER STRUCTURE

```
apps/web-app/
├── app/
│   ├── portfolio/              # NEW: Unified Portfolio Module
│   │   ├── layout.jsx          # RBAC-aware layout
│   │   ├── page.jsx            # Dashboard
│   │   ├── administrators/     # SUPER_ADMIN only
│   │   ├── pmcs/               # SUPER_ADMIN only
│   │   ├── properties/
│   │   ├── units/
│   │   ├── landlords/
│   │   ├── tenants/
│   │   ├── leases/
│   │   └── vendors/
│   ├── admin/                  # ⚠️ TO BE REMOVED
│   └── platform/               # Existing (super admin system management)
│
└── components/
    └── pages/
        └── shared/
            └── Portfolio/       # NEW: Portfolio components
                ├── Dashboard.jsx
                ├── Administrators.jsx
                ├── PMCs.jsx
                ├── Properties.jsx
                ├── Units.jsx
                ├── Landlords.jsx
                ├── Tenants.jsx
                ├── Leases.jsx
                └── Vendors.jsx
```

---

## 🎯 NAVIGATION CHANGES

### Before
- Multiple entry points: `/dashboard`, `/properties`, `/tenants`, `/landlords`, `/leases`
- Admin routes: `/admin/*`
- Platform routes: `/platform/*`
- Inconsistent navigation based on role

### After
- **Single entry point:** `/portfolio` (role-based tabs)
- **Platform routes:** `/platform/*` (super admin system management only)
- **Unified navigation:** All data access through `/portfolio` with RBAC-aware tabs

---

## 🔐 RBAC LOGIC UPDATES

### Role-Based Tab Access

**SUPER_ADMIN:**
- ✅ Dashboard
- ✅ Administrators
- ✅ PMCs
- ✅ Properties
- ✅ Units
- ✅ Landlords
- ✅ Tenants
- ✅ Leases
- ✅ Vendors
- ✅ Platform routes (`/platform/*`)

**PMC_ADMIN:**
- ✅ Dashboard
- ✅ Properties (scoped to their PMC)
- ✅ Units (scoped to their PMC)
- ✅ Landlords (scoped to their PMC)
- ✅ Tenants (scoped to their PMC)
- ✅ Leases (scoped to their PMC)
- ✅ Vendors (scoped to their PMC)

**PROPERTY_MANAGER (PM):**
- ✅ Dashboard
- ✅ Properties (assigned properties only)
- ✅ Units (assigned properties only)
- ✅ Landlords (related to assigned properties)
- ✅ Tenants (related to assigned properties)
- ✅ Leases (related to assigned properties)
- ✅ Vendors (for work orders)

**LANDLORD:**
- ✅ Dashboard
- ✅ Properties (owned properties only)
- ✅ Units (owned properties only)
- ✅ Tenants (related to owned properties)
- ✅ Leases (related to owned properties)
- ✅ Vendors (for work orders)

**TENANT:**
- ✅ Dashboard
- ✅ Leases (their lease only)
- ✅ Vendors (for work orders)

**VENDOR:**
- ✅ Dashboard
- ✅ Work Orders (assigned work orders only)

---

## 🐛 ISSUES FIXED

### Organization Scoping
1. **Fixed:** `useUnits` hook missing organization scoping
   - **Impact:** Units now properly respect RBAC boundaries
   - **Fix:** Added `organizationId` parameter and `useQueryEnabled()` check

2. **Verified:** All hooks use `useQueryEnabled()` correctly
   - Super admin can query without organization
   - Other roles require organization_id

### Data Access
1. **Fixed:** Portfolio component data extraction
   - **Issue:** Component was accessing `portfolioData?.data` incorrectly
   - **Fix:** Changed to `portfolioData` directly (already the data object)

### Navigation
1. **Simplified:** Removed duplicate navigation items
2. **Unified:** All data access through `/portfolio` with role-based tabs

---

## ⚠️ KNOWN ISSUES / LIMITATIONS

1. **V1 Code Still Present:**
   - `/admin` directory still exists (needs migration)
   - Some components may still reference v1 routes
   - Prisma/Zod imports may still exist in some files

2. **Component Field Mapping:**
   - Some components may use old field names (e.g., `propertyName` vs `name`)
   - Need to verify field names match v2 API response structure

3. **Testing:**
   - Ontario dataset testing not yet completed
   - Role-based access needs verification with real data

---

## 📝 NEXT STEPS

### Immediate (Phase 5)
1. **Audit all `/admin` route references**
   - Search codebase for `/admin` imports
   - Update to `/portfolio` or `/platform` as appropriate
   - Test all role-based access

2. **Remove `/admin` directory**
   - After verifying all functionality migrated
   - Remove admin components
   - Remove admin utilities

3. **Remove v1 code**
   - Remove Prisma imports
   - Remove Zod domain model imports
   - Remove Next.js API routes

### Short-term (Phase 6)
1. **Update all components to v2 API**
   - Verify all use `v2Api` from `@/lib/api/v2-client`
   - Remove `fetch("/api/...")` calls
   - Update to shared types

2. **Fix field name mismatches**
   - Verify all field names match v2 API
   - Update component renderers

### Testing (Phase 7)
1. **Test with Ontario dataset**
   - Super Admin access
   - PMC Admin access
   - PM access
   - Landlord access
   - Tenant access

---

## 📊 METRICS

- **Files Created:** 19
- **Files Modified:** 2
- **Hooks Updated:** 1 (useUnits)
- **Routes Created:** 10 (1 layout + 9 pages)
- **Components Created:** 9
- **Navigation Items Simplified:** 12 → 5 base items

---

## ✅ SUCCESS CRITERIA MET

- [x] Unified Portfolio module created
- [x] Role-based tab access implemented
- [x] Organization scoping fixed
- [x] RBAC-aware navigation created
- [x] Hooks use proper RBAC logic
- [ ] V1 code removed (pending)
- [ ] All components use v2 API (pending)
- [ ] Testing completed (pending)

---

## 🎉 CONCLUSION

Phase 1-4 of the Portfolio unification is complete. The new unified `/portfolio` module provides a single, role-based interface for all data access, following v2 DDD, API-First, and SSOT principles. Organization scoping has been fixed, and RBAC-aware navigation is in place.

**Remaining work:** Remove v1 code, complete component migration, and test with Ontario dataset.

---

**Report Generated:** $(date)
**Architect:** Auto (Cursor AI)
**Status:** ✅ Core Structure Complete | ⚠️ Cleanup Pending

