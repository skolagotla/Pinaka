# Users API

## Overview

The Users API provides endpoints for managing users, their profiles, and roles.

**Base Path**: `/api/v2/users`

## Endpoints

### GET /users

List users with pagination and organization scoping.

#### Summary

List users with optional organization filter. Returns users accessible to the current user based on their role and organization.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `READ` on `USER` resource

**Allowed Roles**: 
- SUPER_ADMIN (all organizations)
- PMC_ADMIN (own organization)
- PM (own organization)

#### Path

`GET /api/v2/users`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `organization_id` | `UUID` | No | - | Filter by organization (SUPER_ADMIN only) |
| `page` | `int` | No | 1 | Page number (min: 1) |
| `limit` | `int` | No | 50 | Items per page (min: 1, max: 100) |

#### Responses

##### 200 OK

Array of users with roles.

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "organization_id": "660e8400-e29b-41d4-a716-446655440001",
    "status": "active",
    "onboarding_completed": true,
    "onboarding_step": 5,
    "onboarding_data": null,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-15T10:30:00Z",
    "roles": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "name": "pmc_admin",
        "description": "PMC Administrator"
      }
    ]
  }
]
```

**Schema**: `List[UserWithRoles]`

---

### POST /users

Create a new user.

#### Summary

Create a new user in the system. Password is hashed before storage.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `READ` on `USER` resource (note: uses READ for create endpoint)

**Allowed Roles**: 
- SUPER_ADMIN
- PMC_ADMIN

#### Path

`POST /api/v2/users`

#### Request Body

```json
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "full_name": "Jane Doe",
  "phone": "+1234567890",
  "organization_id": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Schema**: `UserCreate`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `EmailStr` | Yes | User's email address |
| `password` | `string` | Yes | Password (min 8 characters) |
| `full_name` | `string` | No | User's full name |
| `phone` | `string` | No | Phone number |
| `organization_id` | `UUID` | No | Organization ID (auto-set for non-super users) |

#### Responses

##### 201 Created

User created successfully.

**Schema**: `UserWithRoles`

##### 400 Bad Request

User with email already exists.

```json
{
  "detail": "User with this email already exists"
}
```

---

### GET /users/{user_id}

Get user by ID with roles.

#### Summary

Retrieve a specific user's profile and roles.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `READ` on `USER` resource

#### Path

`GET /api/v2/users/{user_id}`

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | `UUID` | Yes | User ID |

#### Responses

##### 200 OK

User details with roles.

**Schema**: `UserWithRoles`

##### 403 Forbidden

Cannot access user from different organization.

##### 404 Not Found

User not found.

---

### PATCH /users/{user_id}

Update user profile.

#### Summary

Update user information. Only specified fields are updated.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `READ` on `USER` resource

#### Path

`PATCH /api/v2/users/{user_id}`

#### Request Body

All fields optional:

```json
{
  "email": "updated@example.com",
  "full_name": "Updated Name",
  "phone": "+9876543210",
  "status": "active",
  "onboarding_completed": true
}
```

**Schema**: `UserUpdate`

#### Responses

##### 200 OK

Updated user with roles.

**Schema**: `UserWithRoles`

---

### PATCH /users/me

Update current user's own profile.

#### Summary

Users can update their own profile. Status and organization_id cannot be changed.

#### Authentication

**Required** - JWT token

#### Path

`PATCH /api/v2/users/me`

#### Request Body

Same as `UserUpdate`, but `status` and `organization_id` are ignored.

#### Responses

##### 200 OK

Updated user profile.

**Schema**: `UserWithRoles`

---

### DELETE /users/{user_id}

Delete (soft delete) a user.

#### Summary

Soft delete a user by setting status to 'suspended'. Only SUPER_ADMIN and PMC_ADMIN can delete users.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN` or `PMC_ADMIN`

#### Path

`DELETE /api/v2/users/{user_id}`

#### Responses

##### 200 OK

User deleted successfully.

```json
{
  "message": "User deleted successfully"
}
```

##### 403 Forbidden

Insufficient permissions.

##### 404 Not Found

User not found.

---

## Related Documentation

- [Authentication API](./auth.md) - Login and session management
- [Organizations API](./organizations.md) - Organization management
- [Types](./types.md) - Schema definitions

