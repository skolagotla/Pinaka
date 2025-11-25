# Tenants API

## Overview

The Tenants API provides endpoints for managing tenants in the system.

**Base Path**: `/api/v2/tenants`

## Endpoints

### GET /tenants

List tenants with pagination and organization scoping.

#### Summary

List tenants (scoped by organization) with pagination. Returns tenants accessible to the current user based on their role and organization.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `READ` on `TENANT` resource

**Special Rules**:
- Tenants can only see themselves

#### Path

`GET /api/v2/tenants`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `organization_id` | `UUID` | No | - | Filter by organization (SUPER_ADMIN only) |
| `page` | `int` | No | 1 | Page number (min: 1) |
| `limit` | `int` | No | 50 | Items per page (min: 1, max: 100) |

#### Responses

##### 200 OK

Array of tenants.

**Schema**: `List[Tenant]`

---

### POST /tenants

Create a new tenant.

#### Summary

Create tenant with organization assignment.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `CREATE` on `TENANT` resource

#### Path

`POST /api/v2/tenants`

#### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "status": "active",
  "organization_id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Schema**: `TenantCreate`

#### Responses

##### 201 Created

Tenant created successfully.

**Schema**: `Tenant`

---

### GET /tenants/{tenant_id}

Get tenant by ID.

#### Summary

Retrieve a specific tenant's details.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `READ` on `TENANT` resource

**Special Rules**:
- Tenants can only see themselves

#### Path

`GET /api/v2/tenants/{tenant_id}`

#### Responses

##### 200 OK

Tenant details.

**Schema**: `Tenant`

##### 403 Forbidden

Tenants can only see themselves.

---

### PATCH /tenants/{tenant_id}

Update tenant.

#### Summary

Update tenant information.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `CREATE` on `TENANT` resource

#### Path

`PATCH /api/v2/tenants/{tenant_id}`

#### Request Body

All fields optional:

```json
{
  "name": "Updated Name",
  "status": "approved"
}
```

**Schema**: `TenantUpdate`

#### Responses

##### 200 OK

Updated tenant.

**Schema**: `Tenant`

---

### DELETE /tenants/{tenant_id}

Delete tenant.

#### Summary

Permanently delete a tenant.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `UPDATE` on `TENANT` resource

#### Path

`DELETE /api/v2/tenants/{tenant_id}`

#### Responses

##### 204 No Content

Tenant deleted successfully.

---

### POST /tenants/{tenant_id}/approve

Approve a tenant.

#### Summary

Approve a tenant application. Landlords can only approve tenants for their properties.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `READ` on `TENANT` resource

**Special Rules**:
- Landlords can only approve tenants for their properties

#### Path

`POST /api/v2/tenants/{tenant_id}/approve`

#### Request Body

```json
{}
```

**Schema**: `TenantApprovalRequest`

#### Responses

##### 200 OK

Approved tenant.

**Schema**: `Tenant`

---

### POST /tenants/{tenant_id}/reject

Reject a tenant.

#### Summary

Reject a tenant application.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `READ` on `TENANT` resource

#### Path

`POST /api/v2/tenants/{tenant_id}/reject`

#### Request Body

```json
{
  "reason": "Insufficient income"
}
```

**Schema**: `TenantRejectionRequest`

#### Responses

##### 200 OK

Rejected tenant.

**Schema**: `Tenant`

---

### GET /tenants/{tenant_id}/rent-data

Get tenant rent data.

#### Summary

Get tenant rent data including active lease, property, unit, and rent payments. Only landlords can access this.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `LANDLORD` or `SUPER_ADMIN`

#### Path

`GET /api/v2/tenants/{tenant_id}/rent-data`

#### Responses

##### 200 OK

Rent data including lease, property, unit, and payments.

```json
{
  "lease": {
    "id": "990e8400-e29b-41d4-a716-446655440000",
    "rent_amount": 1500.00,
    "start_date": "2025-01-01",
    "end_date": "2025-12-31"
  },
  "property": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "123 Main St",
    "address_line1": "123 Main St"
  },
  "unit": {
    "id": "880e8400-e29b-41d4-a716-446655440000",
    "name": "101"
  },
  "rent_payments": []
}
```

##### 404 Not Found

No active lease found for this tenant.

---

### GET /tenants/with-outstanding-balance

Get tenants with outstanding balance.

#### Summary

Get list of tenants with outstanding rent balance.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `READ` on `TENANT` resource

#### Path

`GET /api/v2/tenants/with-outstanding-balance`

#### Responses

##### 200 OK

List of tenants with outstanding balances.

```json
{
  "success": true,
  "tenants": []
}
```

---

## Related Documentation

- [Leases API](./leases.md) - Lease management
- [Rent Payments API](./rent_payments.md) - Rent payment tracking
- [Types](./types.md) - Schema definitions

