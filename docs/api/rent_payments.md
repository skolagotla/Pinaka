# Rent Payments API

## Overview

The Rent Payments API provides endpoints for tracking rent payments.

**Base Path**: `/api/v2/rent-payments`

## Endpoints

### GET /rent-payments

List rent payments with filters and pagination.

#### Summary

List rent payments (scoped by organization and role) with pagination. Supports filtering by organization, lease, tenant, and status.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, `LANDLORD`, or `TENANT`

**Special Rules**:
- Tenants see only their own payments

#### Path

`GET /api/v2/rent-payments`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `organization_id` | `UUID` | No | - | Filter by organization (SUPER_ADMIN only) |
| `lease_id` | `UUID` | No | - | Filter by lease |
| `tenant_id` | `UUID` | No | - | Filter by tenant |
| `status_filter` | `string` | No | - | Filter by status |
| `page` | `int` | No | 1 | Page number (min: 1) |
| `limit` | `int` | No | 50 | Items per page (min: 1, max: 100) |

#### Responses

##### 200 OK

Array of rent payments.

**Schema**: `List[RentPayment]`

---

### POST /rent-payments

Create a rent payment.

#### Summary

Record a rent payment for a lease and tenant.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, `LANDLORD`, or `TENANT`

#### Path

`POST /api/v2/rent-payments`

#### Request Body

```json
{
  "organization_id": "660e8400-e29b-41d4-a716-446655440001",
  "lease_id": "990e8400-e29b-41d4-a716-446655440000",
  "tenant_id": "aa0e8400-e29b-41d4-a716-446655440003",
  "amount": 1500.00,
  "payment_date": "2025-01-15",
  "payment_method": "bank_transfer",
  "reference_number": "TXN123456",
  "notes": "January rent payment"
}
```

**Schema**: `RentPaymentCreate`

#### Responses

##### 201 Created

Rent payment created successfully.

**Schema**: `RentPayment`

##### 403 Forbidden

Cannot create payment for different organization.

---

### PATCH /rent-payments/{payment_id}

Update rent payment.

#### Summary

Update rent payment information. Only SUPER_ADMIN, PMC_ADMIN, PM, and LANDLORD can update.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, or `LANDLORD`

#### Path

`PATCH /api/v2/rent-payments/{payment_id}`

#### Request Body

All fields optional:

```json
{
  "status": "completed",
  "amount": 1500.00,
  "notes": "Updated notes"
}
```

**Schema**: `RentPaymentUpdate`

#### Responses

##### 200 OK

Updated rent payment.

**Schema**: `RentPayment`

---

## Related Documentation

- [Leases API](./leases.md) - Lease management
- [Tenants API](./tenants.md) - Tenant management
- [Types](./types.md) - Schema definitions

