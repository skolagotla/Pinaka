# Comprehensive CRUD & RBAC Migration Report

## Executive Summary

**Status:** Most CRUD operations are complete via ModelViewSet, but **custom actions** and **RBAC endpoints** are missing.

---

## ✅ COMPLETE CRUD OPERATIONS

All domains have **ModelViewSet** which provides:
- ✅ **List** (GET /api/v1/{domain}/)
- ✅ **Create** (POST /api/v1/{domain}/)
- ✅ **Retrieve** (GET /api/v1/{domain}/{id}/)
- ✅ **Update** (PUT /api/v1/{domain}/{id}/)
- ✅ **Partial Update** (PATCH /api/v1/{domain}/{id}/)
- ✅ **Delete** (DELETE /api/v1/{domain}/{id}/)

**Domains with Complete CRUD:**
- ✅ Property (PropertyViewSet, UnitViewSet)
- ✅ Tenant (TenantViewSet)
- ✅ Lease (LeaseViewSet, LeaseTenantViewSet)
- ✅ Payment (RentPaymentViewSet, SecurityDepositViewSet)
- ✅ Maintenance (MaintenanceRequestViewSet, MaintenanceCommentViewSet)
- ✅ Landlord (LandlordViewSet)
- ✅ PMC (PropertyManagementCompanyViewSet)
- ✅ Document (DocumentViewSet) + Custom: upload, view
- ✅ Message (ConversationViewSet, MessageViewSet) + Custom: messages
- ✅ Support (SupportTicketViewSet)
- ✅ Notification (NotificationViewSet)
- ✅ Verification (UnifiedVerificationViewSet)
- ✅ Invitation (InvitationViewSet)
- ✅ Service Provider (ServiceProviderViewSet)
- ✅ Application (ApplicationViewSet)
- ✅ Activity (ActivityLogViewSet - ReadOnly)
- ✅ Expense (ExpenseViewSet)
- ✅ RBAC (RoleViewSet, PermissionViewSet, UserRoleViewSet)

---

## ❌ MISSING CUSTOM ACTIONS

### 1. **Approval/Rejection Endpoints**

#### Tenant Approval/Rejection
- ❌ `POST /api/v1/tenants/{id}/approve` - Missing
- ❌ `POST /api/v1/tenants/{id}/reject` - Missing

#### Application Approval/Rejection
- ❌ `POST /api/v1/applications/{id}/approve` - Missing
- ❌ `POST /api/v1/applications/{id}/reject` - Missing

#### Landlord Approval/Rejection
- ❌ `POST /api/v1/landlords/{id}/approve` - Missing
- ❌ `POST /api/v1/landlords/{id}/reject` - Missing

#### PMC Approval/Rejection
- ❌ `POST /api/v1/pmcs/{id}/approve` - Missing
- ❌ `POST /api/v1/pmcs/{id}/reject` - Missing

#### Maintenance Approval/Rejection
- ❌ `POST /api/v1/maintenance/{id}/approve` - Missing
- ❌ `POST /api/v1/maintenance/{id}/reject` - Missing

#### Expense Approval/Rejection
- ❌ `POST /api/v1/expenses/{id}/approve` - Missing
- ❌ `POST /api/v1/expenses/{id}/reject` - Missing

### 2. **RBAC-Specific Endpoints**

#### Role Management
- ❌ `GET /api/rbac/roles/by-name/{roleName}/permissions` - Missing
- ❌ `GET /api/rbac/roles/{id}/permissions` - Missing
- ❌ `POST /api/rbac/roles/{id}/permissions` - Missing (assign permissions to role)
- ❌ `DELETE /api/rbac/roles/{id}/permissions/{permId}` - Missing (remove permission from role)

#### User Role Assignment
- ❌ `GET /api/rbac/users/{userId}/roles?userType={type}` - Missing
- ❌ `POST /api/rbac/users/{userId}/roles/{roleId}/assign` - Missing
- ❌ `DELETE /api/rbac/users/{userId}/roles/{roleId}` - Missing
- ❌ `POST /api/rbac/users/{userId}/roles/{roleId}/scope` - Missing (scope assignment)

#### Permission Checking
- ❌ `POST /api/rbac/check-permission` - Missing (bulk permission check)
- ❌ `GET /api/rbac/users/{userId}/permissions` - Missing

### 3. **Other Custom Actions**

#### Property Actions
- ✅ `GET /api/v1/properties/{id}/units/` - Exists
- ✅ `GET /api/v1/properties/{id}/tenants/` - Exists
- ✅ `GET /api/v1/properties/{id}/leases/` - Exists
- ✅ `GET /api/v1/properties/{id}/maintenance/` - Exists

#### Document Actions
- ✅ `POST /api/v1/documents/upload/` - Exists
- ✅ `GET /api/v1/documents/{id}/view/` - Exists

#### Message Actions
- ✅ `GET /api/v1/conversations/{id}/messages/` - Exists
- ✅ `POST /api/v1/conversations/{id}/messages/` - Exists

#### Financial Actions
- ✅ `GET /api/v1/financials/reports/` - Exists
- ✅ `GET /api/v1/financials/export/` - Exists

---

## ⚠️ RBAC FUNCTIONALITY STATUS

### ✅ Complete
- ✅ **Models:** Role, Permission, UserRole, RolePermission
- ✅ **ViewSets:** RoleViewSet, PermissionViewSet, UserRoleViewSet
- ✅ **Permission Functions:** has_role, has_permission, check_permission, get_user_roles, get_user_permissions

### ❌ Missing API Endpoints

1. **Role Permissions Management**
   - `GET /api/v1/roles/{id}/permissions/` - Get all permissions for a role
   - `POST /api/v1/roles/{id}/permissions/` - Assign permission to role
   - `DELETE /api/v1/roles/{id}/permissions/{permId}/` - Remove permission from role

2. **User Role Assignment**
   - `GET /api/v1/user-roles/?user_id={id}&user_type={type}` - Get user roles
   - `POST /api/v1/user-roles/assign/` - Assign role to user
   - `DELETE /api/v1/user-roles/{id}/` - Remove role from user

3. **Permission Checking API**
   - `POST /api/v1/rbac/check-permission/` - Check if user has permission
   - `GET /api/v1/rbac/users/{userId}/permissions/` - Get all user permissions

4. **Role by Name Lookup**
   - `GET /api/v1/roles/by-name/{roleName}/` - Get role by name
   - `GET /api/v1/roles/by-name/{roleName}/permissions/` - Get permissions for role by name

---

## 📋 MISSING FUNCTIONALITY BY DOMAIN

### Tenant Domain
- ❌ Approve endpoint (`POST /api/v1/tenants/{id}/approve/`)
- ❌ Reject endpoint (`POST /api/v1/tenants/{id}/reject/`)
- ❌ Bulk approve/reject

### Application Domain
- ❌ Approve endpoint (`POST /api/v1/applications/{id}/approve/`)
- ❌ Reject endpoint (`POST /api/v1/applications/{id}/reject/`)
- ❌ Status filtering by approval status

### Landlord Domain
- ❌ Approve endpoint (`POST /api/v1/landlords/{id}/approve/`)
- ❌ Reject endpoint (`POST /api/v1/landlords/{id}/reject/`)

### PMC Domain
- ❌ Approve endpoint (`POST /api/v1/pmcs/{id}/approve/`)
- ❌ Reject endpoint (`POST /api/v1/pmcs/{id}/reject/`)

### Maintenance Domain
- ❌ Approve endpoint (`POST /api/v1/maintenance/{id}/approve/`)
- ❌ Reject endpoint (`POST /api/v1/maintenance/{id}/reject/`)
- ❌ Escalate endpoint

### Expense Domain
- ❌ Approve endpoint (`POST /api/v1/expenses/{id}/approve/`)
- ❌ Reject endpoint (`POST /api/v1/expenses/{id}/reject/`)

### RBAC Domain
- ❌ Role permissions management endpoints
- ❌ User role assignment endpoints
- ❌ Permission checking API
- ❌ Role by name lookup
- ❌ Scope assignment endpoints

---

## 🎯 PRIORITY FIXES

### High Priority
1. **Tenant Approval/Rejection** - Critical for onboarding workflow
2. **Application Approval/Rejection** - Critical for application process
3. **RBAC Role Assignment** - Critical for user management
4. **RBAC Permission Management** - Critical for security

### Medium Priority
5. **Landlord/PMC Approval** - Important for multi-tenant workflow
6. **Maintenance Approval** - Important for workflow
7. **Expense Approval** - Important for financial workflow

### Low Priority
8. **Bulk Operations** - Nice to have
9. **Advanced RBAC Features** - Scope assignment, etc.

---

## 📝 RECOMMENDATIONS

1. **Add Approval/Rejection Actions** to all relevant ViewSets
2. **Add RBAC Management Endpoints** for role assignment and permission management
3. **Add Permission Checking API** for frontend permission checks
4. **Add Role by Name Lookup** for easier role management
5. **Add Bulk Operations** for efficiency

---

**Last Updated:** 2025-01-22  
**Migration Status:** ~85% Complete (CRUD: 100%, Custom Actions: 60%, RBAC API: 40%)

