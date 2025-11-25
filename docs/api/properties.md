# Properties API

## Overview

The Properties API provides endpoints for managing properties in the system.

**Base Path**: `/api/v2/properties`

## Endpoints

### GET /properties

List properties with pagination and organization scoping.

#### Summary

List properties (scoped by organization) with pagination. Returns properties accessible to the current user based on their role and organization.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `READ` on `PROPERTY` resource

**Allowed Roles**: 
- SUPER_ADMIN (all organizations)
- PMC_ADMIN (own organization)
- PM (assigned properties)
- LANDLORD (owned properties)

#### Path

`GET /api/v2/properties`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `organization_id` | `UUID` | No | - | Filter by organization (SUPER_ADMIN only) |
| `page` | `int` | No | 1 | Page number (min: 1) |
| `limit` | `int` | No | 50 | Items per page (min: 1, max: 100) |

#### Responses

##### 200 OK

Array of properties.

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "123 Main Street",
    "address_line1": "123 Main St",
    "address_line2": "Suite 100",
    "city": "Toronto",
    "state": "ON",
    "postal_code": "M5H 2N2",
    "country": "Canada",
    "status": "active",
    "organization_id": "660e8400-e29b-41d4-a716-446655440001",
    "landlord_id": "770e8400-e29b-41d4-a716-446655440002",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

**Schema**: `List[Property]`

##### 401 Unauthorized

Missing or invalid token.

##### 403 Forbidden

Insufficient permissions.

#### Notes

- Properties are automatically filtered by organization for non-super users
- Landlords see only their own properties
- PMs see only assigned properties
- Relationships (landlord, organization) are eagerly loaded

---

### POST /properties

Create a new property.

#### Summary

Create property with organization and landlord assignment.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `CREATE` on `PROPERTY` resource

**Allowed Roles**: 
- SUPER_ADMIN
- PMC_ADMIN
- PM

#### Path

`POST /api/v2/properties`

#### Request Body

```json
{
  "name": "123 Main Street",
  "address_line1": "123 Main St",
  "address_line2": "Suite 100",
  "city": "Toronto",
  "state": "ON",
  "postal_code": "M5H 2N2",
  "country": "Canada",
  "status": "active",
  "organization_id": "660e8400-e29b-41d4-a716-446655440001",
  "landlord_id": "770e8400-e29b-41d4-a716-446655440002"
}
```

**Schema**: `PropertyCreate`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | No | Property name |
| `address_line1` | `string` | Yes | Primary address line |
| `address_line2` | `string` | No | Secondary address line |
| `city` | `string` | No | City |
| `state` | `string` | No | State/Province |
| `postal_code` | `string` | No | Postal/ZIP code |
| `country` | `string` | No | Country |
| `status` | `string` | No | Default: "active" |
| `organization_id` | `UUID` | Yes | Organization ID |
| `landlord_id` | `UUID` | No | Landlord ID |

#### Responses

##### 201 Created

Property created successfully.

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "123 Main Street",
  "address_line1": "123 Main St",
  "address_line2": "Suite 100",
  "city": "Toronto",
  "state": "ON",
  "postal_code": "M5H 2N2",
  "country": "Canada",
  "status": "active",
  "organization_id": "660e8400-e29b-41d4-a716-446655440001",
  "landlord_id": "770e8400-e29b-41d4-a716-446655440002",
  "created_at": "2025-01-15T10:30:00Z"
}
```

**Schema**: `Property`

##### 400 Bad Request

Invalid request data.

##### 401 Unauthorized

Missing or invalid token.

##### 403 Forbidden

- Insufficient permissions
- Cannot create property in different organization

##### 422 Unprocessable Entity

Validation error.

#### Notes

- Organization access is verified before creation
- Non-super users can only create properties in their organization
- Landlord must belong to the same organization

---

### GET /properties/{property_id}

Get a property by ID.

#### Summary

Get property by ID with all relationships loaded.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `READ` on `PROPERTY` resource

**Allowed Roles**: 
- SUPER_ADMIN (all organizations)
- PMC_ADMIN (own organization)
- PM (assigned properties)
- LANDLORD (owned properties)

#### Path

`GET /api/v2/properties/{property_id}`

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `property_id` | `UUID` | Yes | Property ID |

#### Responses

##### 200 OK

Property details.

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "123 Main Street",
  "address_line1": "123 Main St",
  "address_line2": "Suite 100",
  "city": "Toronto",
  "state": "ON",
  "postal_code": "M5H 2N2",
  "country": "Canada",
  "status": "active",
  "organization_id": "660e8400-e29b-41d4-a716-446655440001",
  "landlord_id": "770e8400-e29b-41d4-a716-446655440002",
  "created_at": "2025-01-01T00:00:00Z"
}
```

**Schema**: `Property`

##### 401 Unauthorized

Missing or invalid token.

##### 403 Forbidden

- Insufficient permissions
- Property belongs to different organization

##### 404 Not Found

Property not found.

```json
{
  "detail": "Property not found"
}
```

#### Notes

- Relationships (landlord, organization, units) are eagerly loaded
- Organization access is checked before returning
- Returns 404 if property doesn't exist or user lacks access

---

## Related Documentation

- [Units API](./units.md) - Property units
- [Landlords API](./landlords.md) - Property owners
- [Types](./types.md) - Schema definitions

