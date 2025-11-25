# Invitations API

## Overview

The Invitations API provides endpoints for managing user invitations.

**Base Path**: `/api/v2/invitations`

## Endpoints

### GET /invitations

List invitations with filters and pagination.

#### Summary

List invitations (scoped by organization) with pagination. Supports filtering by status.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, or `LANDLORD`

#### Path

`GET /api/v2/invitations`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `organization_id` | `UUID` | No | - | Filter by organization (SUPER_ADMIN only) |
| `status_filter` | `string` | No | - | Filter by status (pending, accepted, expired, cancelled) |
| `page` | `int` | No | 1 | Page number (min: 1) |
| `limit` | `int` | No | 50 | Items per page (min: 1, max: 100) |

#### Responses

##### 200 OK

Array of invitations.

**Schema**: `List[Invitation]`

---

### POST /invitations

Create an invitation.

#### Summary

Create an invitation for a user to join the system. Generates a unique token and expiration date.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, or `LANDLORD`

#### Path

`POST /api/v2/invitations`

#### Request Body

```json
{
  "organization_id": "660e8400-e29b-41d4-a716-446655440001",
  "email": "newuser@example.com",
  "role_name": "tenant",
  "expires_in_days": 7
}
```

**Schema**: `InvitationCreate`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `organization_id` | `UUID` | Yes | Organization ID |
| `email` | `string` | Yes | Invitee email |
| `role_name` | `string` | Yes | Role to assign (landlord, tenant, pmc, vendor, etc.) |
| `expires_in_days` | `int` | No | Default: 7 (min: 1, max: 30) |

#### Responses

##### 201 Created

Invitation created successfully.

**Schema**: `Invitation`

**Note**: The response includes a `token` field that should be sent to the invitee.

---

### GET /invitations/{invitation_id}

Get invitation by ID.

#### Summary

Retrieve a specific invitation's details.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, or `LANDLORD`

#### Path

`GET /api/v2/invitations/{invitation_id}`

#### Responses

##### 200 OK

Invitation details.

**Schema**: `Invitation`

##### 404 Not Found

Invitation not found.

---

### PATCH /invitations/{invitation_id}

Update invitation.

#### Summary

Update invitation status (e.g., cancel an invitation).

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, or `LANDLORD`

#### Path

`PATCH /api/v2/invitations/{invitation_id}`

#### Request Body

```json
{
  "status": "cancelled"
}
```

**Schema**: `InvitationUpdate`

#### Responses

##### 200 OK

Updated invitation.

**Schema**: `Invitation`

---

### POST /invitations/accept/{token}

Accept an invitation by token.

#### Summary

Accept an invitation using the invitation token. This is a public endpoint (no authentication required).

#### Authentication

**Not Required** - Public endpoint

#### Path

`POST /api/v2/invitations/accept/{token}`

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | `string` | Yes | Invitation token |

#### Responses

##### 200 OK

Invitation accepted successfully.

**Schema**: `Invitation`

##### 400 Bad Request

Invitation has expired.

```json
{
  "detail": "Invitation has expired"
}
```

##### 404 Not Found

Invitation not found or already used.

```json
{
  "detail": "Invitation not found or already used"
}
```

---

## Related Documentation

- [Users API](./users.md) - User management
- [Types](./types.md) - Schema definitions

