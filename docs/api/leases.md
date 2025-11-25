# Leases API

## Overview

The Leases API provides endpoints for managing property leases.

**Base Path**: `/api/v2/leases`

## Endpoints

### GET /leases

List leases with filters and pagination.

#### Summary

List leases (scoped by organization and filters) with pagination. Supports filtering by organization, unit, tenant, or landlord.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `READ` on `LEASE` resource

**Special Rules**:
- Tenants see only their own leases
- Non-super users see only their organization's leases

#### Path

`GET /api/v2/leases`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `organization_id` | `UUID` | No | - | Filter by organization (SUPER_ADMIN only) |
| `unit_id` | `UUID` | No | - | Filter by unit |
| `tenant_id` | `UUID` | No | - | Filter by tenant |
| `landlord_id` | `UUID` | No | - | Filter by landlord |
| `page` | `int` | No | 1 | Page number (min: 1) |
| `limit` | `int` | No | 50 | Items per page (min: 1, max: 100) |

#### Responses

##### 200 OK

Array of leases with relationships loaded.

```json
[
  {
    "id": "990e8400-e29b-41d4-a716-446655440000",
    "start_date": "2025-01-01",
    "end_date": "2025-12-31",
    "rent_amount": 1500.00,
    "rent_due_day": 1,
    "security_deposit": 1500.00,
    "status": "active",
    "organization_id": "660e8400-e29b-41d4-a716-446655440001",
    "unit_id": "880e8400-e29b-41d4-a716-446655440000",
    "landlord_id": "770e8400-e29b-41d4-a716-446655440002",
    "tenant_id": "aa0e8400-e29b-41d4-a716-446655440003",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": null
  }
]
```

**Schema**: `List[Lease]`

---

### POST /leases

Create a new lease.

#### Summary

Create lease with tenant relationships. Verifies unit availability (no overlapping active leases).

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `CREATE` on `LEASE` resource

#### Path

`POST /api/v2/leases`

#### Request Body

```json
{
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "rent_amount": 1500.00,
  "rent_due_day": 1,
  "security_deposit": 1500.00,
  "status": "pending",
  "organization_id": "660e8400-e29b-41d4-a716-446655440001",
  "unit_id": "880e8400-e29b-41d4-a716-446655440000",
  "landlord_id": "770e8400-e29b-41d4-a716-446655440002",
  "tenant_id": "aa0e8400-e29b-41d4-a716-446655440003"
}
```

**Schema**: `LeaseCreate`

**Note**: The endpoint also accepts `tenant_ids` array for multiple tenants (creates `lease_tenants` records).

#### Responses

##### 201 Created

Lease created successfully.

**Schema**: `Lease`

##### 400 Bad Request

Unit is not available (has active lease).

```json
{
  "detail": "Unit is not available (has active lease)"
}
```

##### 403 Forbidden

Cannot create lease in different organization.

##### 404 Not Found

Unit not found.

---

### GET /leases/{lease_id}

Get lease by ID.

#### Summary

Retrieve a specific lease with all relationships loaded.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `READ` on `LEASE` resource

**Special Rules**:
- Tenants can only see their own leases

#### Path

`GET /api/v2/leases/{lease_id}`

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lease_id` | `UUID` | Yes | Lease ID |

#### Responses

##### 200 OK

Lease details with relationships.

**Schema**: `Lease`

##### 403 Forbidden

Cannot access lease from different organization or not tenant's lease.

##### 404 Not Found

Lease not found.

---

### PATCH /leases/{lease_id}

Update lease.

#### Summary

Update lease information. Only specified fields are updated.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `CREATE` on `LEASE` resource

#### Path

`PATCH /api/v2/leases/{lease_id}`

#### Request Body

All fields optional:

```json
{
  "rent_amount": 1600.00,
  "status": "active",
  "end_date": "2026-12-31"
}
```

**Schema**: `LeaseUpdate`

#### Responses

##### 200 OK

Updated lease.

**Schema**: `Lease`

---

### DELETE /leases/{lease_id}

Delete lease.

#### Summary

Permanently delete a lease. Only SUPER_ADMIN and PMC_ADMIN can delete leases.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN` or `PMC_ADMIN`

#### Path

`DELETE /api/v2/leases/{lease_id}`

#### Responses

##### 204 No Content

Lease deleted successfully.

##### 403 Forbidden

Insufficient permissions.

##### 404 Not Found

Lease not found.

---

### POST /leases/{lease_id}/renew

Renew a lease.

#### Summary

Renew or convert a lease to month-to-month. Landlords and tenants can renew their own leases.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `READ` on `LEASE` resource

**Special Rules**:
- Landlords can only renew leases for their properties
- Tenants can only renew their own leases

#### Path

`POST /api/v2/leases/{lease_id}/renew`

#### Request Body

```json
{
  "decision": "renew",
  "new_lease_end": "2026-12-31",
  "new_rent_amount": 1600.00
}
```

**Schema**: `LeaseRenewalRequest`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `decision` | `string` | Yes | "renew", "month-to-month", or "terminate" |
| `new_lease_end` | `Date` | No | New end date (for "renew") |
| `new_rent_amount` | `number` | No | New rent amount |

#### Responses

##### 200 OK

Updated lease.

**Schema**: `Lease`

##### 403 Forbidden

Cannot renew lease (ownership/access denied).

---

### POST /leases/{lease_id}/terminate

Terminate a lease.

#### Summary

Terminate a lease with termination date and reason.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `READ` on `LEASE` resource

#### Path

`POST /api/v2/leases/{lease_id}/terminate`

#### Request Body

```json
{
  "termination_date": "2025-06-30",
  "reason": "Tenant request",
  "actual_loss": 500.00
}
```

**Schema**: `LeaseTerminationRequest`

#### Responses

##### 200 OK

Terminated lease.

**Schema**: `Lease`

---

## Related Documentation

- [Properties API](./properties.md) - Property management
- [Units API](./units.md) - Unit management
- [Tenants API](./tenants.md) - Tenant management
- [Types](./types.md) - Schema definitions

