# Pinaka v2 Cleanup Summary

## Overview
Comprehensive cleanup of obsolete code, dead components, and unused files after v2 RBAC + Organization + Portfolio redesign.

## Files Deleted

### Frontend Routes (Obsolete)
- `apps/web-app/app/admin/page.jsx` - Redirects to /portfolio
- `apps/web-app/app/admin/login/page.jsx` - Old admin login
- `apps/web-app/app/dashboard/page.jsx` - Redirects to /portfolio
- `apps/web-app/app/dashboard/page-client.jsx` - Duplicate dashboard
- `apps/web-app/app/properties/page.jsx` - Replaced by /portfolio/properties
- `apps/web-app/app/properties/[id]/page.jsx` - Replaced by Portfolio
- `apps/web-app/app/tenants/page.jsx` - Replaced by /portfolio/tenants
- `apps/web-app/app/tenants/[id]/page.jsx` - Replaced by Portfolio
- `apps/web-app/app/landlords/page.jsx` - Replaced by /portfolio/landlords
- `apps/web-app/app/landlords/[id]/page.jsx` - Replaced by Portfolio
- `apps/web-app/app/leases/page.jsx` - Replaced by /portfolio/leases
- `apps/web-app/app/leases/[id]/page.jsx` - Replaced by Portfolio
- `apps/web-app/app/units/page.jsx` - Replaced by /portfolio/units
- `apps/web-app/app/units/[id]/page.jsx` - Replaced by Portfolio
- `apps/web-app/app/(protected)/portfolio/[role]/page.jsx` - Unused dynamic route
- `apps/web-app/app/contractor/dashboard/page.jsx` - Placeholder page
- `apps/web-app/app/documents/page.jsx` - Redirects to /library
- `apps/web-app/app/financials/page.jsx` - Should be in Portfolio
- `apps/web-app/app/financials/ui.jsx` - Financials UI
- `apps/web-app/app/financials/tax-reporting/page.jsx` - Tax reporting
- `apps/web-app/app/financials/year-end/page.jsx` - Year-end
- `apps/web-app/app/homepage/page.jsx` - Redirects to /properties
- `apps/web-app/app/homepage/ui.jsx` - Homepage UI
- `apps/web-app/app/homepage/rent/page.jsx` - Rent page
- `apps/web-app/app/invitations/page.jsx` - Should be in Portfolio
- `apps/web-app/app/legal/page.jsx` - Should be in /library
- `apps/web-app/app/legal/ui.jsx` - Legal UI
- `apps/web-app/app/operations/page.jsx` - Redirects to kanban
- `apps/web-app/app/operations/ui.jsx` - Operations UI
- `apps/web-app/app/operations/kanban/page.jsx` - Kanban board
- `apps/web-app/app/partners/page.jsx` - Should be /portfolio/vendors
- `apps/web-app/app/partners/contractors-ui.jsx` - Partners UI
- `apps/web-app/app/partners/ui.jsx` - Partners UI
- `apps/web-app/app/payments/page.jsx` - Should be in Portfolio
- `apps/web-app/app/rbac/page.jsx` - Redirects to /platform/rbac
- `apps/web-app/app/verifications/page.jsx` - Should be in /platform/verifications
- `apps/web-app/app/verifications/ui.jsx` - Verifications UI
- `apps/web-app/app/v2-test/page.jsx` - Test page
- `apps/web-app/app/vendor/dashboard/page.jsx` - Placeholder page

### Frontend Components (Obsolete)
- `apps/web-app/components/Navigation.jsx` - Replaced by UnifiedSidebar
- `apps/web-app/components/admin/AdminRouteGuard.tsx` - Old admin guard
- `apps/web-app/components/admin/ImpersonationBanner.tsx` - Old impersonation
- `apps/web-app/components/admin/ImpersonationSelector.tsx` - Old impersonation
- `apps/web-app/components/admin/LoginIllustration.jsx` - Old admin login
- `apps/web-app/components/admin/users/UsersFilters.tsx` - Old admin users
- `apps/web-app/components/admin/users/UsersTable.tsx` - Old admin users

### Frontend Libraries (Obsolete)
- `apps/web-app/lib/admin/session.js` - Old admin session (Prisma-based)
- `apps/web-app/lib/admin/google-oauth.js` - Old Google OAuth (disabled)
- `apps/web-app/lib/rbac/permissionMatrix.ts` - Old Prisma-based RBAC
- `apps/web-app/lib/rbac/permissions.ts` - Old Prisma-based permissions
- `apps/web-app/lib/rbac/combinedMiddleware.ts` - Old RBAC middleware
- `apps/web-app/lib/rbac/dataIsolation.ts` - Old data isolation
- `apps/web-app/lib/rbac/queryBuilders.ts` - Old query builders
- `apps/web-app/lib/rbac/scopeManagement.ts` - Old scope management
- `apps/web-app/lib/rbac/approvalWorkflows.ts` - Old approval workflows
- `apps/web-app/lib/rbac/auditLogging.ts` - Old audit logging
- `apps/web-app/lib/rbac/apiIntegration.ts` - Old API integration
- `apps/web-app/lib/rbac/apiIntegrationHelper.ts` - Old API helper
- `apps/web-app/lib/rbac/edgeCases.ts` - Old edge cases
- `apps/web-app/lib/rbac/testing.ts` - Old testing utilities
- `apps/web-app/lib/rbac/examples.ts` - Old examples
- `apps/web-app/lib/rbac/middleware.ts` - Old middleware
- `apps/web-app/lib/rbac/autoInitialize.ts` - Old auto-init
- `apps/web-app/lib/rbac/v2-client.ts` - Old v2 client
- `apps/web-app/lib/rbac/resourceLabels.ts` - Old resource labels

## Files Refactored

### Frontend
- `apps/web-app/app/LayoutClient.jsx` - Removed Navigation import, uses UnifiedSidebar
- `apps/web-app/components/ProLayoutWrapper.jsx` - Updated to use UnifiedSidebar
- `apps/web-app/lib/rbac/index.ts` - Simplified to export only rbacConfig and permissions_v2

## Valid Routes (After Cleanup)

### Authentication & Onboarding
- `/auth/login` - Login page
- `/onboarding/*` - Onboarding flows

### Portfolio (Main Application)
- `/portfolio` - Portfolio dashboard
- `/portfolio/dashboard` - Dashboard tab
- `/portfolio/properties` - Properties tab
- `/portfolio/units` - Units tab
- `/portfolio/landlords` - Landlords tab
- `/portfolio/tenants` - Tenants tab
- `/portfolio/leases` - Leases tab
- `/portfolio/vendors` - Vendors tab
- `/portfolio/administrators` - Administrators (super_admin only)
- `/portfolio/pmcs` - PMCs (super_admin only)

### Platform (Super Admin Only)
- `/platform` - Platform dashboard
- `/platform/organizations` - Organizations management
- `/platform/users` - Users management
- `/platform/rbac` - RBAC settings
- `/platform/audit-logs` - Audit logs
- `/platform/settings` - Platform settings
- `/platform/*` - Other platform pages

### Other Valid Routes
- `/work-orders-v2` - Work orders (v2)
- `/messages` - Messages
- `/reports` - Reports
- `/calendar` - Calendar
- `/checklist` - Checklist (tenant only)
- `/library` - Library/Documents
- `/settings` - User settings
- `/help` - Help pages
- `/help/*` - Help sub-pages

## Remaining Work

### Backend
- Some routers still use `require_role_v2` instead of `require_permission`:
  - `apps/backend-api/routers/attachments.py`
  - `apps/backend-api/routers/notifications.py`
  - `apps/backend-api/routers/audit_logs.py`
  - `apps/backend-api/routers/rent_payments.py`
  - `apps/backend-api/routers/invitations.py`
  - `apps/backend-api/routers/inspections.py`
  - `apps/backend-api/routers/tasks.py`
  - `apps/backend-api/routers/conversations.py`
  - `apps/backend-api/routers/expenses.py`
  - `apps/backend-api/routers/forms.py`
  - `apps/backend-api/routers/search.py`

### Frontend Hooks
- `usePinakaCRUD`, `useV2CRUD`, `useCRUD` are deprecated but still used in some components
- These should be migrated to `useUnifiedCRUD` or `useV2Data` hooks

### Services
- Many services in `apps/web-app/lib/services/` still reference Prisma
- These should be migrated to use FastAPI v2 endpoints

## Summary Statistics

- **Routes Deleted**: 35+
- **Components Deleted**: 6
- **Library Files Deleted**: 20+
- **Total Files Removed**: 60+

## Next Steps

1. Migrate remaining backend routers to use `require_permission`
2. Update frontend components to use `useV2Data` hooks instead of deprecated CRUD hooks
3. Migrate services from Prisma to FastAPI v2
4. Remove any remaining Prisma dependencies
5. Consolidate duplicate components (e.g., role-specific dashboard components)

