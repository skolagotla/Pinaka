# Audit Logs API

## Overview

The Audit Logs API provides endpoints for viewing audit trail records. Only SUPER_ADMIN can access audit logs.

**Base Path**: `/api/v2/audit-logs`

## Endpoints

### GET /audit-logs

List audit logs with filters and pagination.

#### Summary

List audit logs (super_admin only) with pagination. Supports filtering by organization, actor, entity type, and action.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN` only

#### Path

`GET /api/v2/audit-logs`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `organization_id` | `UUID` | No | - | Filter by organization |
| `actor_user_id` | `UUID` | No | - | Filter by actor (user who performed action) |
| `entity_type` | `string` | No | - | Filter by entity type |
| `action` | `string` | No | - | Filter by action (ROLE_CHANGED, USER_IMPERSONATED, etc.) |
| `page` | `int` | No | 1 | Page number (min: 1) |
| `limit` | `int` | No | 50 | Items per page (min: 1, max: 100) |

#### Responses

##### 200 OK

Array of audit logs.

```json
[
  {
    "id": "ff0e8400-e29b-41d4-a716-446655440000",
    "action": "ROLE_CHANGED",
    "entity_type": "user",
    "entity_id": "550e8400-e29b-41d4-a716-446655440000",
    "extra_metadata": {
      "old_role": "tenant",
      "new_role": "landlord"
    },
    "organization_id": "660e8400-e29b-41d4-a716-446655440001",
    "actor_user_id": "550e8400-e29b-41d4-a716-446655440001",
    "created_at": "2025-01-15T10:30:00Z"
  }
]
```

**Schema**: `List[AuditLog]`

##### 403 Forbidden

Only super_admin can access audit logs.

---

### POST /audit-logs

Create an audit log entry.

#### Summary

Create an audit log entry (typically done by system, but API available). Uses current user as actor if not specified.

#### Authentication

**Required** - JWT token

#### Path

`POST /api/v2/audit-logs`

#### Request Body

```json
{
  "organization_id": "660e8400-e29b-41d4-a716-446655440001",
  "actor_user_id": "550e8400-e29b-41d4-a716-446655440001",
  "action": "LEASE_CREATED",
  "entity_type": "lease",
  "entity_id": "990e8400-e29b-41d4-a716-446655440000",
  "extra_metadata": {
    "lease_amount": 1500.00,
    "tenant_name": "John Doe"
  }
}
```

**Schema**: `AuditLogCreate`

#### Responses

##### 201 Created

Audit log created successfully.

**Schema**: `AuditLog`

---

### GET /audit-logs/{audit_log_id}

Get audit log by ID.

#### Summary

Retrieve a specific audit log entry. Only SUPER_ADMIN can access.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN` only

#### Path

`GET /api/v2/audit-logs/{audit_log_id}`

#### Responses

##### 200 OK

Audit log details.

**Schema**: `AuditLog`

##### 404 Not Found

Audit log not found.

---

## Related Documentation

- [RBAC API](./rbac.md) - Role and permission management
- [Types](./types.md) - Schema definitions

