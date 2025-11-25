# Landlords API

## Overview

The Landlords API provides endpoints for managing landlords (property owners).

**Base Path**: `/api/v2/landlords`

## Endpoints

### GET /landlords

List landlords with pagination and organization scoping.

#### Summary

List landlords (scoped by organization) with pagination.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `READ` on `LANDLORD` resource

#### Path

`GET /api/v2/landlords`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `organization_id` | `UUID` | No | - | Filter by organization (SUPER_ADMIN only) |
| `page` | `int` | No | 1 | Page number (min: 1) |
| `limit` | `int` | No | 50 | Items per page (min: 1, max: 100) |

#### Responses

##### 200 OK

Array of landlords.

**Schema**: `List[Landlord]`

---

### POST /landlords

Create a new landlord.

#### Summary

Create landlord with organization assignment.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `CREATE` on `LANDLORD` resource

#### Path

`POST /api/v2/landlords`

#### Request Body

```json
{
  "name": "ABC Properties",
  "email": "contact@abcproperties.com",
  "phone": "+1234567890",
  "status": "active",
  "organization_id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Schema**: `LandlordCreate`

#### Responses

##### 201 Created

Landlord created successfully.

**Schema**: `Landlord`

---

### GET /landlords/{landlord_id}

Get landlord by ID.

#### Summary

Retrieve a specific landlord's details.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `READ` on `LANDLORD` resource

#### Path

`GET /api/v2/landlords/{landlord_id}`

#### Responses

##### 200 OK

Landlord details.

**Schema**: `Landlord`

---

### PATCH /landlords/{landlord_id}

Update landlord.

#### Summary

Update landlord information.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `CREATE` on `LANDLORD` resource

#### Path

`PATCH /api/v2/landlords/{landlord_id}`

#### Request Body

All fields optional:

```json
{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

**Schema**: `LandlordUpdate`

#### Responses

##### 200 OK

Updated landlord.

**Schema**: `Landlord`

---

### DELETE /landlords/{landlord_id}

Delete landlord.

#### Summary

Permanently delete a landlord.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `DELETE` on `LANDLORD` resource

#### Path

`DELETE /api/v2/landlords/{landlord_id}`

#### Responses

##### 204 No Content

Landlord deleted successfully.

---

## Related Documentation

- [Properties API](./properties.md) - Property management
- [Leases API](./leases.md) - Lease management
- [Types](./types.md) - Schema definitions

