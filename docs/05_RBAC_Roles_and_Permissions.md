# RBAC Roles and Permissions

## Overview

Pinaka v2 implements a comprehensive Role-Based Access Control (RBAC) system that ensures users can only access and modify data appropriate to their role and organization scope.

## RBAC Diagrams

- **[RBAC Permission Matrix](./diagrams/05-rbac-permission-matrix.md)** - Visual permission matrix showing all roles and resources
- **[Organization Scoping](./diagrams/06-organization-scoping.md)** - How organization scoping works for each role
- **[Cross-Cutting Dependencies](./diagrams/dependency-cross-cutting.md)** - How RBAC integrates with authentication, organization scoping, and API clients

## Roles

### SUPER_ADMIN
- **Description**: Platform administrator with full system access
- **Organization Scope**: Global (no organization filter)
- **Access**: All resources across all organizations
- **Use Case**: System administration, platform management, global oversight

### PMC_ADMIN
- **Description**: Property Management Company administrator
- **Organization Scope**: Single organization (their PMC)
- **Access**: Full read/write access within their organization
- **Use Case**: Managing properties, tenants, leases, vendors for their PMC

### PM (Property Manager)
- **Description**: Property manager assigned to specific properties
- **Organization Scope**: Single organization
- **Access**: Read/write on assigned properties, units, tenants, leases, work orders
- **Use Case**: Day-to-day property management operations

### LANDLORD
- **Description**: Property owner
- **Organization Scope**: Single organization
- **Access**: Read/write on their own properties, leases, tenants (limited)
- **Use Case**: Managing their property portfolio, viewing tenant information

### TENANT
- **Description**: Tenant/Resident
- **Organization Scope**: Single organization
- **Access**: Read on own lease, unit, property; create work orders, messages
- **Use Case**: Viewing lease information, submitting maintenance requests

### VENDOR
- **Description**: Service provider/vendor
- **Organization Scope**: Single organization
- **Access**: Read/update only assigned work orders
- **Use Case**: Managing assigned work orders, updating status

## Permission Matrix

### Resource Permissions by Role

| Resource | SUPER_ADMIN | PMC_ADMIN | PM | LANDLORD | TENANT | VENDOR |
|----------|-------------|-----------|----|----------|--------|--------|
| **Organization** | CREATE, READ, UPDATE, DELETE, MANAGE | READ, UPDATE | READ | READ | READ | READ |
| **User** | CREATE, READ, UPDATE, DELETE, MANAGE | CREATE, READ, UPDATE | READ | READ | READ, UPDATE | READ, UPDATE |
| **Property** | CREATE, READ, UPDATE, DELETE, MANAGE | CREATE, READ, UPDATE, DELETE | READ, UPDATE* | READ, UPDATE* | READ* | READ* |
| **Unit** | CREATE, READ, UPDATE, DELETE, MANAGE | CREATE, READ, UPDATE, DELETE | CREATE, READ, UPDATE | READ, UPDATE* | READ* | READ* |
| **Landlord** | CREATE, READ, UPDATE, DELETE, MANAGE | CREATE, READ, UPDATE, DELETE | READ | READ, UPDATE* | READ | READ |
| **Tenant** | CREATE, READ, UPDATE, DELETE, MANAGE | CREATE, READ, UPDATE, DELETE | CREATE, READ, UPDATE | READ | READ, UPDATE* | READ |
| **Lease** | CREATE, READ, UPDATE, DELETE, MANAGE | CREATE, READ, UPDATE, DELETE | CREATE, READ, UPDATE | READ, UPDATE* | READ* | - |
| **Vendor** | CREATE, READ, UPDATE, DELETE, MANAGE | CREATE, READ, UPDATE, DELETE | READ | READ | READ | READ, UPDATE* |
| **Work Order** | CREATE, READ, UPDATE, DELETE, MANAGE | CREATE, READ, UPDATE, DELETE | CREATE, READ, UPDATE | CREATE, READ, UPDATE* | CREATE, READ, UPDATE* | READ, UPDATE* |
| **Attachment** | CREATE, READ, UPDATE, DELETE, MANAGE | CREATE, READ, UPDATE, DELETE | CREATE, READ | CREATE, READ | CREATE, READ | CREATE, READ |
| **Message** | CREATE, READ, UPDATE, DELETE, MANAGE | CREATE, READ, UPDATE | CREATE, READ, UPDATE | CREATE, READ, UPDATE | CREATE, READ, UPDATE | CREATE, READ, UPDATE |
| **Notification** | READ, UPDATE | READ, UPDATE | READ, UPDATE | READ, UPDATE | READ, UPDATE | READ, UPDATE |
| **Audit Log** | READ | READ | READ | - | - | - |
| **Task** | CREATE, READ, UPDATE, DELETE, MANAGE | CREATE, READ, UPDATE, DELETE | CREATE, READ, UPDATE | READ | READ | READ, UPDATE |
| **Conversation** | CREATE, READ, UPDATE, DELETE, MANAGE | CREATE, READ, UPDATE | CREATE, READ, UPDATE | CREATE, READ, UPDATE | CREATE, READ, UPDATE | CREATE, READ, UPDATE |
| **Invitation** | CREATE, READ, UPDATE, DELETE, MANAGE | CREATE, READ, UPDATE, DELETE | READ | READ | - | - |
| **Form** | CREATE, READ, UPDATE, DELETE, MANAGE | CREATE, READ, UPDATE, DELETE | READ, UPDATE | READ | READ | READ |
| **Rent Payment** | CREATE, READ, UPDATE, DELETE, MANAGE | CREATE, READ, UPDATE | READ | READ | READ* | - |
| **Expense** | CREATE, READ, UPDATE, DELETE, MANAGE | CREATE, READ, UPDATE, DELETE | READ | CREATE, READ, UPDATE | - | - |
| **Inspection** | CREATE, READ, UPDATE, DELETE, MANAGE | CREATE, READ, UPDATE, DELETE | CREATE, READ, UPDATE | READ | READ | READ |

\* = Limited to own/assigned resources

## Screen Access Matrix

### Allowed Screens by Role

| Screen | SUPER_ADMIN | PMC_ADMIN | PM | LANDLORD | TENANT | VENDOR |
|--------|-------------|-----------|----|----------|--------|--------|
| `/portfolio` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/portfolio/dashboard` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/portfolio/overview` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/portfolio/administrators` | ✅ | - | - | - | - | - |
| `/portfolio/pmcs` | ✅ | - | - | - | - | - |
| `/portfolio/properties` | ✅ | ✅ | ✅ | ✅ | - | - |
| `/portfolio/units` | ✅ | ✅ | ✅ | ✅ | - | - |
| `/portfolio/landlords` | ✅ | ✅ | - | - | - | - |
| `/portfolio/tenants` | ✅ | ✅ | ✅ | ✅ | - | - |
| `/portfolio/leases` | ✅ | ✅ | ✅ | ✅ | - | - |
| `/portfolio/vendors` | ✅ | ✅ | - | - | - | - |
| `/platform` | ✅ | - | - | - | - | - |
| `/platform/organizations` | ✅ | - | - | - | - | - |
| `/platform/users` | ✅ | - | - | - | - | - |
| `/platform/rbac` | ✅ | - | - | - | - | - |
| `/platform/audit-logs` | ✅ | - | - | - | - | - |
| `/work-orders-v2` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/messages` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/reports` | ✅ | ✅ | ✅ | ✅ | - | - |
| `/settings` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Organization Scoping

### SUPER_ADMIN
- **Organization Filter**: None (sees all organizations)
- **Property Filter**: None (sees all properties)
- **Resource Filter**: None (sees all resources)

### PMC_ADMIN
- **Organization Filter**: `organization_id = user.organization_id`
- **Property Filter**: Properties in their organization
- **Resource Filter**: All resources in their organization

### PM
- **Organization Filter**: `organization_id = user.organization_id`
- **Property Filter**: Assigned properties only
- **Resource Filter**: Resources related to assigned properties

### LANDLORD
- **Organization Filter**: `organization_id = user.organization_id`
- **Property Filter**: Owned properties only
- **Resource Filter**: Resources related to owned properties

### TENANT
- **Organization Filter**: `organization_id = user.organization_id`
- **Property Filter**: Property they lease
- **Resource Filter**: Their lease, unit, work orders they created

### VENDOR
- **Organization Filter**: `organization_id = user.organization_id`
- **Property Filter**: Properties with assigned work orders
- **Resource Filter**: Assigned work orders only

## CRUD Capabilities

### Create Operations
- **SUPER_ADMIN**: Can create any resource
- **PMC_ADMIN**: Can create resources in their organization
- **PM**: Can create units, tenants, leases, work orders for assigned properties
- **LANDLORD**: Can create work orders, expenses for their properties
- **TENANT**: Can create work orders, messages
- **VENDOR**: Cannot create resources (read-only on work orders)

### Read Operations
- **SUPER_ADMIN**: Can read all resources
- **PMC_ADMIN**: Can read all resources in their organization
- **PM**: Can read assigned properties and related resources
- **LANDLORD**: Can read their properties and related resources
- **TENANT**: Can read their lease, unit, property, work orders
- **VENDOR**: Can read assigned work orders and related resources

### Update Operations
- **SUPER_ADMIN**: Can update any resource
- **PMC_ADMIN**: Can update resources in their organization
- **PM**: Can update assigned properties, units, tenants, leases, work orders
- **LANDLORD**: Can update their properties, leases, work orders
- **TENANT**: Can update their profile, work orders they created
- **VENDOR**: Can update assigned work orders

### Delete Operations
- **SUPER_ADMIN**: Can delete any resource
- **PMC_ADMIN**: Can delete resources in their organization
- **PM**: Cannot delete (read/update only)
- **LANDLORD**: Cannot delete (read/update only)
- **TENANT**: Cannot delete (read/update only)
- **VENDOR**: Cannot delete (read/update only)

## Implementation Details

### Backend (FastAPI)
- **Location**: `apps/backend-api/core/rbac.py`
- **Permission Evaluator**: `check_permission()` function
- **FastAPI Dependency**: `require_permission()` factory
- **Applied To**: All routers (properties, units, tenants, leases, vendors, work_orders, etc.)

### Frontend (Next.js)
- **Location**: `apps/web-app/lib/rbac/rbacConfig.ts`
- **Hook**: `useRolePermissions()`
- **Screen Access**: `ROLE_SCREENS` configuration
- **Applied To**: Sidebar navigation, action buttons, route guards

### Organization Scoping
- **Location**: `apps/web-app/lib/hooks/useOrganizationScoped.ts`
- **Hook**: `useScopedOrgFilter()`
- **Applied To**: All React Query hooks for automatic org-aware filtering

## Best Practices

1. **Always check permissions on the backend** - Frontend checks are for UX only
2. **Use `require_permission()` dependency** - Don't manually check permissions in route handlers
3. **Use `useRolePermissions()` hook** - Don't manually check roles in components
4. **Respect organization scoping** - Always filter by organization_id for non-super-admin roles
5. **Test with different roles** - Ensure each role sees only appropriate data

## Future Enhancements

- [ ] PM assigned properties tracking
- [ ] Landlord owned properties tracking
- [ ] Tenant lease scoping
- [ ] Vendor assigned work orders tracking
- [ ] Fine-grained permissions (beyond role-based)
- [ ] Permission inheritance
- [ ] Custom role creation

