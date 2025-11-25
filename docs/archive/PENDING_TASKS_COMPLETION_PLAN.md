# Pending Tasks Completion Plan

## Task 1: Implement Consistent Folder Structure ✅

### Issues Found:
1. **Duplicate RBAC files**: `lib/rbac/` and `apps/web-app/lib/rbac/`
2. **Duplicate domain files**: `domains/` (root) and `packages/domains/`
3. **Legacy API server**: `apps/api-server/` (171 files, should be removed)
4. **Nested duplicate**: `apps/web-app/apps/web-app/` (if exists)

### Actions:
1. Consolidate RBAC files to `apps/web-app/lib/rbac/`
2. Verify domain usage and remove duplicates
3. Document legacy `apps/api-server/` for removal
4. Clean up any nested duplicates

## Task 2: Finish RBAC Wiring ✅

### Current State:
- RBAC system exists with permissions, roles, scopes
- Permission matrix defined
- Components exist: `RoleAssignmentModal`, `ScopeAssignment`, `PermissionSettings`
- Hook exists: `usePermissions` (simple) and `useRBAC` (advanced)

### Actions:
1. Migrate RBAC permissions from Prisma to FastAPI v2
2. Wire up `useRBAC` hook to FastAPI endpoints
3. Ensure all components use RBAC checks
4. Test permission enforcement

## Task 3: Refactor Duplicate CRUD Logic ✅

### Current State:
- Multiple CRUD hooks: `usePinakaCRUD`, `useCRUD`, `useCrudHooks`, `usePinakaCRUDV1`
- Backend has `crud_helpers.py` (good)
- Frontend needs consolidation

### Actions:
1. Create unified `useV2CRUD` hook using v2Api
2. Deprecate old CRUD hooks
3. Migrate components to use unified hook
4. Remove duplicate code

## Task 4: Ensure Application Runs End-to-End ✅

### Actions:
1. Test frontend build
2. Test backend startup
3. Test API connectivity
4. Fix any runtime errors
5. Verify critical user flows

## Task 5: Add Final Polish ✅

### Actions:
1. Fix any remaining TypeScript errors
2. Improve error messages
3. Add loading states where missing
4. Optimize bundle size
5. Add final UI/UX improvements

