# RBAC API

## Overview

The RBAC API provides endpoints for checking permissions and managing role-based access control.

**Base Path**: `/api/v2/rbac`

## Endpoints

### POST /rbac/permissions/check

Check if current user has a specific permission.

#### Summary

Check if the current user has permission to perform an action on a resource. Returns permission status and reason.

#### Authentication

**Required** - JWT token

#### Path

`POST /api/v2/rbac/permissions/check`

#### Request Body

```json
{
  "resource": "property",
  "action": "CREATE",
  "category": null,
  "scope": null
}
```

**Schema**: `PermissionCheckRequest`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resource` | `string` | Yes | Resource type (property, tenant, lease, etc.) |
| `action` | `string` | Yes | Action (CREATE, READ, UPDATE, DELETE, MANAGE) |
| `category` | `string` | No | Optional category |
| `scope` | `object` | No | Optional scope information |

#### Responses

##### 200 OK

Permission check result.

```json
{
  "has_permission": true,
  "reason": "PMC Admin role"
}
```

**Schema**: `PermissionCheckResponse`

```json
{
  "has_permission": false,
  "reason": "User with roles ['tenant'] does not have CREATE permission for property"
}
```

---

### GET /rbac/scopes

Get all scopes for the current user.

#### Summary

Get all scopes (portfolios, properties, units) for the current user based on their roles.

#### Authentication

**Required** - JWT token

#### Path

`GET /api/v2/rbac/scopes`

#### Responses

##### 200 OK

User scopes and roles.

```json
{
  "scopes": [
    {
      "organization_id": "660e8400-e29b-41d4-a716-446655440001",
      "portfolio_id": null,
      "property_id": null,
      "unit_id": null
    }
  ],
  "roles": ["pmc_admin", "pm"]
}
```

**Schema**: `UserScopesResponse`

---

### GET /rbac/access/{resource_id}

Check if user can access a specific resource.

#### Summary

Check if the current user can access a specific resource by ID and type.

#### Authentication

**Required** - JWT token

#### Path

`GET /api/v2/rbac/access/{resource_id}`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `resource_type` | `string` | Yes | Type of resource: "property", "tenant", "lease", "work_order", etc. |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `resource_id` | `UUID` | Yes | Resource ID |

#### Responses

##### 200 OK

Access check result.

```json
{
  "has_access": true,
  "reason": "Same organization"
}
```

or

```json
{
  "has_access": false,
  "reason": "Different organization"
}
```

---

### GET /rbac/roles

List all available roles.

#### Summary

Get a list of all available roles in the system. Only SUPER_ADMIN and PMC_ADMIN can access.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN` or `PMC_ADMIN`

#### Path

`GET /api/v2/rbac/roles`

#### Responses

##### 200 OK

Array of roles.

```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "name": "super_admin",
    "description": "Super Administrator"
  },
  {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "name": "pmc_admin",
    "description": "PMC Administrator"
  }
]
```

---

### GET /rbac/users/{user_id}/roles

Get roles for a specific user.

#### Summary

Get all roles assigned to a specific user. Only SUPER_ADMIN, PMC_ADMIN, and PM can access.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN`, `PMC_ADMIN`, or `PM`

#### Path

`GET /api/v2/rbac/users/{user_id}/roles`

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | `UUID` | Yes | User ID |

#### Responses

##### 200 OK

Array of user roles.

```json
[
  {
    "id": "990e8400-e29b-41d4-a716-446655440004",
    "role_id": "880e8400-e29b-41d4-a716-446655440003",
    "role_name": "pmc_admin",
    "organization_id": "660e8400-e29b-41d4-a716-446655440001",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

---

## Related Documentation

- [Users API](./users.md) - User management
- [RBAC Documentation](../05_RBAC_Roles_and_Permissions.md) - Complete RBAC guide
- [Types](./types.md) - Schema definitions

