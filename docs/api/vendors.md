# Vendors API

## Overview

The Vendors API provides endpoints for managing vendors (service providers).

**Base Path**: `/api/v2/vendors`

## Endpoints

### GET /vendors

List vendors with filters and pagination.

#### Summary

List vendors (scoped by organization and role) with pagination. Supports search and status filtering.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `READ` on `VENDOR` resource

#### Path

`GET /api/v2/vendors`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `organization_id` | `UUID` | No | - | Filter by organization (SUPER_ADMIN only) |
| `search` | `string` | No | - | Search by company name, contact name, or email |
| `status_filter` | `string` | No | - | Filter by status |
| `page` | `int` | No | 1 | Page number (min: 1) |
| `limit` | `int` | No | 50 | Items per page (min: 1, max: 100) |

#### Responses

##### 200 OK

Array of vendors.

**Schema**: `List[VendorResponse]`

---

### POST /vendors

Create a new vendor.

#### Summary

Create vendor. Organization ID is automatically set for non-super users.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `CREATE` on `VENDOR` resource

#### Path

`POST /api/v2/vendors`

#### Request Body

```json
{
  "organization_id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "company_name": "ABC Plumbing",
  "contact_name": "John Smith",
  "email": "contact@abcplumbing.com",
  "phone": "+1234567890",
  "service_categories": ["plumbing", "electrical"],
  "status": "active"
}
```

**Schema**: `VendorCreate`

#### Responses

##### 201 Created

Vendor created successfully.

**Schema**: `VendorResponse`

---

### GET /vendors/{vendor_id}

Get vendor by ID.

#### Summary

Retrieve a specific vendor's details.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `READ` on `VENDOR` resource

#### Path

`GET /api/v2/vendors/{vendor_id}`

#### Responses

##### 200 OK

Vendor details.

**Schema**: `VendorResponse`

##### 404 Not Found

Vendor not found (returns 404 for security, even if access denied).

---

### PATCH /vendors/{vendor_id}

Update vendor.

#### Summary

Update vendor information.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `CREATE` on `VENDOR` resource

#### Path

`PATCH /api/v2/vendors/{vendor_id}`

#### Request Body

All fields optional:

```json
{
  "company_name": "Updated Company Name",
  "status": "inactive"
}
```

**Schema**: `VendorUpdate`

#### Responses

##### 200 OK

Updated vendor.

**Schema**: `VendorResponse`

---

### DELETE /vendors/{vendor_id}

Delete vendor (soft delete).

#### Summary

Soft delete a vendor by setting status to 'inactive'.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `CREATE` on `VENDOR` resource

#### Path

`DELETE /api/v2/vendors/{vendor_id}`

#### Responses

##### 204 No Content

Vendor deleted (status set to inactive).

---

## Related Documentation

- [Work Orders API](./work_orders.md) - Work order management
- [Types](./types.md) - Schema definitions

