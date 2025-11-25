# Organizations API

## Overview

The Organizations API provides endpoints for managing organizations (PMCs, Landlords, etc.).

**Base Path**: `/api/v2/organizations`

## Endpoints

### GET /organizations

List organizations accessible to the current user.

#### Summary

List organizations. SUPER_ADMIN sees all organizations, others see only their own.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `READ` on `ORGANIZATION` resource

**Allowed Roles**: All authenticated users

#### Path

`GET /api/v2/organizations`

#### Responses

##### 200 OK

Array of organizations.

```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "ABC Property Management",
    "type": "PMC",
    "timezone": "America/Toronto",
    "country": "Canada",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

**Schema**: `List[Organization]`

**Note**: Non-super users receive only their own organization (or empty array if none).

---

### POST /organizations

Create a new organization.

#### Summary

Create organization. Only SUPER_ADMIN can create organizations.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `CREATE` on `ORGANIZATION` resource

**Required Role**: `SUPER_ADMIN` only

#### Path

`POST /api/v2/organizations`

#### Request Body

```json
{
  "name": "New Property Management Company",
  "type": "PMC",
  "timezone": "America/Toronto",
  "country": "Canada"
}
```

**Schema**: `OrganizationCreate`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Organization name |
| `type` | `string` | Yes | Organization type: "PMC", "LANDLORD", "INTERNAL" |
| `timezone` | `string` | No | Timezone (e.g., "America/Toronto") |
| `country` | `string` | No | Country code |

#### Responses

##### 201 Created

Organization created successfully.

**Schema**: `Organization`

##### 403 Forbidden

Only super_admin can create organizations.

```json
{
  "detail": "Only super_admin can create organizations"
}
```

---

### GET /organizations/{org_id}

Get organization by ID.

#### Summary

Retrieve a specific organization's details.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `READ` on `ORGANIZATION` resource

#### Path

`GET /api/v2/organizations/{org_id}`

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `org_id` | `UUID` | Yes | Organization ID |

#### Responses

##### 200 OK

Organization details.

**Schema**: `Organization`

##### 403 Forbidden

Cannot access organization from different organization.

##### 404 Not Found

Organization not found.

---

## Related Documentation

- [Users API](./users.md) - User management
- [Types](./types.md) - Schema definitions

