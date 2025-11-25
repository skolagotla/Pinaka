# Authentication API

## Overview

The Authentication API provides endpoints for user login and session management.

**Base Path**: `/api/v2/auth`

## Endpoints

### POST /auth/login

Authenticate a user and receive a JWT access token.

#### Summary

Login endpoint for v2 schema. Validates user credentials and returns a JWT token for subsequent API requests.

#### Authentication

**Not Required** - This is a public endpoint.

#### Path

`POST /api/v2/auth/login`

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Schema**: `UserLogin`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `EmailStr` | Yes | User's email address |
| `password` | `string` | Yes | User's password (min 8 characters) |

#### Responses

##### 200 OK

Successfully authenticated. Returns JWT token.

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlcyI6WyJwbWMtYWRtaW4iXSwiZXhwIjoxNzA1MzI0ODAwfQ...",
  "token_type": "bearer"
}
```

**Schema**: `Token`

| Field | Type | Description |
|-------|------|-------------|
| `access_token` | `string` | JWT access token |
| `token_type` | `string` | Always "bearer" |

##### 401 Unauthorized

Invalid credentials.

```json
{
  "detail": "Incorrect email or password"
}
```

##### 403 Forbidden

User account is not active.

```json
{
  "detail": "User account is not active"
}
```

#### Notes

- Tokens include user ID, email, roles, and organization ID
- Token expiration is configurable (default: 30 minutes)
- Store the token securely and include it in subsequent requests
- Passwords are validated against stored hashes (bcrypt)

---

### GET /auth/me

Get current authenticated user information.

#### Summary

Retrieves the current user's profile, roles, and organization information based on the JWT token.

#### Authentication

**Required** - JWT token in Authorization header.

#### Path

`GET /api/v2/auth/me`

#### Parameters

None (user is identified from JWT token)

#### Responses

##### 200 OK

Current user information.

```json
{
  "user": {
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
    "updated_at": "2025-01-15T10:30:00Z"
  },
  "roles": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "pmc_admin",
      "description": "PMC Administrator"
    }
  ],
  "organization_id": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Schema**: `CurrentUser`

| Field | Type | Description |
|-------|------|-------------|
| `user` | `User` | User profile object |
| `roles` | `List[Role]` | Array of user roles |
| `organization_id` | `UUID \| null` | User's organization ID |

##### 401 Unauthorized

Invalid or expired token.

```json
{
  "detail": "Could not validate credentials"
}
```

#### Notes

- Use this endpoint to verify token validity
- Returns complete user profile with all roles
- Organization ID is included for convenience
- Roles are eagerly loaded with role details

---

## Related Documentation

- [Users API](./users.md) - User management endpoints
- [RBAC Documentation](../05_RBAC_Roles_and_Permissions.md) - Role-based access control
- [Types](./types.md) - Schema definitions

