# Units API

## Overview

The Units API provides endpoints for managing property units.

**Base Path**: `/api/v2/units`

## Endpoints

### GET /units

List units with pagination and optional property filter.

#### Summary

List units (optionally filtered by property) with pagination. Units are scoped by organization through their parent property.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `READ` on `UNIT` resource

#### Path

`GET /api/v2/units`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `property_id` | `UUID` | No | - | Filter by property |
| `page` | `int` | No | 1 | Page number (min: 1) |
| `limit` | `int` | No | 50 | Items per page (min: 1, max: 100) |

#### Responses

##### 200 OK

Array of units.

```json
[
  {
    "id": "880e8400-e29b-41d4-a716-446655440000",
    "unit_number": "101",
    "floor": "1",
    "bedrooms": 2,
    "bathrooms": 1,
    "size_sqft": 850,
    "status": "vacant",
    "property_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

**Schema**: `List[Unit]`

---

### POST /units

Create a new unit.

#### Summary

Create unit in a property. Property must exist and belong to user's organization.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `CREATE` on `UNIT` resource

#### Path

`POST /api/v2/units`

#### Request Body

```json
{
  "unit_number": "101",
  "floor": "1",
  "bedrooms": 2,
  "bathrooms": 1,
  "size_sqft": 850,
  "status": "vacant",
  "property_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Schema**: `UnitCreate`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `unit_number` | `string` | Yes | Unit number/identifier |
| `floor` | `string` | No | Floor number |
| `bedrooms` | `int` | No | Number of bedrooms |
| `bathrooms` | `int` | No | Number of bathrooms |
| `size_sqft` | `int` | No | Size in square feet |
| `status` | `string` | No | Default: "vacant" |
| `property_id` | `UUID` | Yes | Parent property ID |

#### Responses

##### 201 Created

Unit created successfully.

**Schema**: `Unit`

##### 403 Forbidden

Cannot create unit in different organization.

##### 404 Not Found

Property not found.

---

### GET /units/{unit_id}

Get unit by ID.

#### Summary

Retrieve a specific unit's details.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `READ` on `UNIT` resource

#### Path

`GET /api/v2/units/{unit_id}`

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `unit_id` | `UUID` | Yes | Unit ID |

#### Responses

##### 200 OK

Unit details.

**Schema**: `Unit`

##### 403 Forbidden

Cannot access unit from different organization.

##### 404 Not Found

Unit not found.

---

### PATCH /units/{unit_id}

Update unit.

#### Summary

Update unit information. Only specified fields are updated.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `UPDATE` on `UNIT` resource

#### Path

`PATCH /api/v2/units/{unit_id}`

#### Request Body

All fields optional:

```json
{
  "unit_number": "102",
  "status": "occupied",
  "bedrooms": 3
}
```

**Schema**: `UnitUpdate`

#### Responses

##### 200 OK

Updated unit.

**Schema**: `Unit`

---

### DELETE /units/{unit_id}

Delete unit.

#### Summary

Permanently delete a unit.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `DELETE` on `UNIT` resource

#### Path

`DELETE /api/v2/units/{unit_id}`

#### Responses

##### 204 No Content

Unit deleted successfully.

##### 403 Forbidden

Cannot delete unit from different organization.

##### 404 Not Found

Unit not found.

---

## Related Documentation

- [Properties API](./properties.md) - Property management
- [Leases API](./leases.md) - Lease management
- [Types](./types.md) - Schema definitions

