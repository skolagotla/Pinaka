# Pinaka V2 Unified Structure Migration Summary

## ✅ COMPLETED PHASES

### Phase 3: Organization Scoping Fixed ✅
- **Created**: `apps/web-app/lib/hooks/useOrganizationScoped.ts`
  - `useOrganizationId()` - Returns undefined for super_admin (sees all), org_id for others
  - `useQueryEnabled()` - Enables queries for super_admin without org, requires org for others
  
- **Updated ALL hooks in `useV2Data.ts`**:
  - `useProperties()` - Now works for super_admin (no org required)
  - `useLandlords()` - Now works for super_admin (no org required)
  - `useTenants()` - Now works for super_admin (no org required)
  - `useLeases()` - Now works for super_admin (no org required)
  - `useWorkOrders()` - Now works for super_admin (no org required)
  - `useUsers()` - Now works for super_admin (no org required)
  - `useVendors()` - Now works for super_admin (no org required)
  - `useTasks()` - Now works for super_admin (no org required)
  - `useConversations()` - Now works for super_admin (no org required)
  - `useInvitations()` - Now works for super_admin (no org required)
  - `useForms()` - Now works for super_admin (no org required)
  - `useRentPayments()` - Now works for super_admin (no org required)
  - `useExpenses()` - Now works for super_admin (no org required)
  - `useInspections()` - Now works for super_admin (no org required)

**Key Change**: Removed `enabled: organizationId !== undefined` and replaced with `useQueryEnabled()` hook that:
- Returns `true` for super_admin (can query without org)
- Returns `true` for other roles only if they have `organization_id`

### Phase 5: Route Guards ✅
- **Created**: `apps/web-app/lib/utils/withRoleGuard.tsx`
  - HOC for protecting routes with role-based access
  - Supports `allowedRoles`, `redirectTo`, `requireOrganization`
  - Shows loading state and access denied messages

### Phase 6: Super Admin Query Fixes ✅
- All hooks now properly handle `organizationId = undefined` for super_admin
- Super admin can see ALL data across all organizations
- Other roles are properly scoped to their organization

### Phase 2: Platform Pages Structure (IN PROGRESS)
- **Created**: `apps/web-app/app/platform/page.jsx` - Platform dashboard
- **Created**: `apps/web-app/app/platform/users/page.jsx` - Wraps admin users page
- **Created**: `apps/web-app/app/platform/organizations/page.jsx` - Organizations management
- **Created**: `apps/web-app/app/platform/rbac/page.jsx` - Wraps admin RBAC page
- **Created**: `apps/web-app/app/platform/audit-logs/page.jsx` - Wraps admin audit logs page
- **Created**: `apps/web-app/app/platform/settings/page.jsx` - Wraps admin settings page

### Navigation Updates (IN PROGRESS)
- **Updated**: `apps/web-app/components/Navigation.jsx`
  - Added platform menu items for super_admin
  - Added `/platform`, `/platform/organizations`, `/platform/users`, etc.

### Redirect Updates ✅
- **Updated**: `apps/web-app/app/login/page.jsx` - Redirects super_admin to `/platform`
- **Updated**: `apps/web-app/app/admin/login/page.jsx` - Redirects super_admin to `/platform`
- **Updated**: `apps/web-app/app/admin/page.jsx` - Redirects super_admin to `/platform`
- **Updated**: `apps/web-app/app/page.jsx` - Redirects super_admin to `/platform`
- **Updated**: `apps/web-app/app/payments/page.jsx` - Updated redirect

## 🔄 REMAINING WORK

### Phase 2: Complete Platform Pages Migration
**Status**: Platform pages created but still reference `/admin` pages

**Remaining migrations needed**:
1. Migrate `/admin/verifications` → `/platform/verifications`
2. Migrate `/admin/analytics` → `/platform/analytics` (or remove if not needed)
3. Migrate `/admin/system` → `/platform/system`
4. Migrate `/admin/security` → `/platform/security`
5. Migrate `/admin/data-export` → `/platform/data-export`
6. Migrate `/admin/notifications` → `/platform/notifications`
7. Migrate `/admin/user-activity` → `/platform/user-activity`
8. Migrate `/admin/content` → `/platform/content`
9. Migrate `/admin/api-keys` → `/platform/api-keys`
10. Migrate `/admin/library` → `/platform/library` (or merge with main library)
11. Migrate `/admin/applications` → `/platform/applications` (if still needed)
12. Migrate `/admin/support-tickets` → `/platform/support-tickets` (or remove if not needed)
13. Migrate `/admin/database` → `/platform/database` (or remove if not needed)

### Phase 4: Complete Navigation Updates
**Status**: Platform items added, but need to:
1. Remove `/admin/*` menu items
2. Ensure all role-based visibility is correct
3. Update sidebar to show platform section for super_admin only

### Phase 7: Remove /admin Directory
**Status**: Cannot remove yet - pages still referenced

**Before removal, need to**:
1. Migrate all admin pages to platform pages
2. Update all imports from `@/app/admin/*` to `@/app/platform/*`
3. Remove `/admin` route references
4. Delete `apps/web-app/app/admin/` directory
5. Remove `apps/web-app/components/admin/` components (or migrate to shared)
6. Remove `apps/web-app/lib/admin/` utilities (or migrate to shared)

### Additional Cleanup Needed
1. **Update all `/api/admin/*` API calls** to use v2 API client
2. **Remove Prisma references** from any remaining files
3. **Remove Zod schema imports** (use OpenAPI types instead)
4. **Update `apps/web-app/app/rbac/page.jsx`** - Currently re-exports admin RBAC page
5. **Fix audit logs page** - Still uses `/api/admin/audit-logs` (Next.js API route)
6. **Fix data export page** - Still uses `/api/admin/data-export` (Next.js API route)

## 📋 FILES CREATED

1. `apps/web-app/lib/hooks/useOrganizationScoped.ts` - Organization scoping utilities
2. `apps/web-app/lib/utils/withRoleGuard.tsx` - Route guard HOC
3. `apps/web-app/app/platform/page.jsx` - Platform dashboard
4. `apps/web-app/app/platform/users/page.jsx` - Platform users (wraps admin)
5. `apps/web-app/app/platform/organizations/page.jsx` - Organizations management
6. `apps/web-app/app/platform/rbac/page.jsx` - Platform RBAC (wraps admin)
7. `apps/web-app/app/platform/audit-logs/page.jsx` - Platform audit logs (wraps admin)
8. `apps/web-app/app/platform/settings/page.jsx` - Platform settings (wraps admin)

## 📋 FILES MODIFIED

1. `apps/web-app/lib/hooks/useV2Data.ts` - All hooks updated for organization scoping
2. `apps/web-app/lib/hooks/useDataQueries.ts` - Portfolio hook updated
3. `apps/web-app/components/Navigation.jsx` - Added platform menu items
4. `apps/web-app/app/login/page.jsx` - Updated redirects
5. `apps/web-app/app/admin/login/page.jsx` - Updated redirects
6. `apps/web-app/app/admin/page.jsx` - Updated redirects
7. `apps/web-app/app/page.jsx` - Updated redirects
8. `apps/web-app/app/payments/page.jsx` - Updated redirects
9. `apps/web-app/app/admin/auth/callback/route.ts` - Updated redirects

## 🎯 NEXT STEPS

1. **Complete platform page migrations** - Migrate remaining admin pages
2. **Update all API calls** - Replace `/api/admin/*` with v2 API client calls
3. **Remove /admin directory** - After all migrations complete
4. **Update navigation** - Remove admin menu items, ensure platform items show correctly
5. **Test all routes** - Verify super_admin, pmc_admin, pm, landlord, tenant, vendor can all access their routes
6. **Final cleanup** - Remove unused components, utilities, and v1 code

## ⚠️ CRITICAL NOTES

- **DO NOT DELETE `/admin` directory yet** - Pages are still being referenced
- **Platform pages currently wrap admin pages** - This is temporary until full migration
- **Some admin pages still use Next.js API routes** - Need to migrate to v2 API client
- **Navigation needs final cleanup** - Remove admin menu items after migration

