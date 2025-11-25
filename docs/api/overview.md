# Pinaka v2 API - Overview

## Introduction

The Pinaka v2 API is a RESTful API built with FastAPI that provides comprehensive property management functionality. All endpoints use the `/api/v2` prefix and are protected by Role-Based Access Control (RBAC).

## Base URL

**Development**: `http://localhost:8000/api/v2`  
**Production**: `https://api.pinaka.com/api/v2`

## API Version

Current version: **v2**  
API versioning is handled via URL prefix (`/api/v2`)

## Authentication

All API endpoints (except `/auth/login`) require authentication via JWT (JSON Web Token).

### Getting a Token

```http
POST /api/v2/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Using the Token

Include the token in the `Authorization` header for all authenticated requests:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration

Tokens expire after a configurable period (default: 30 minutes). When a token expires, you'll receive a `401 Unauthorized` response. Re-authenticate to get a new token.

## Role-Based Access Control (RBAC)

Pinaka uses a comprehensive RBAC system with the following roles:

- **SUPER_ADMIN**: Full access to all resources across all organizations
- **PMC_ADMIN**: Full access within their organization (Property Management Company)
- **PM**: Property Manager - manages assigned properties
- **LANDLORD**: Property owner - manages their own properties
- **TENANT**: Tenant - access to their own lease and work orders
- **VENDOR**: Service provider - access to assigned work orders
- **CONTRACTOR**: Similar to vendor with specific permissions

Each endpoint specifies which roles can access it. See individual endpoint documentation for role requirements.

## Organization Scoping

Most resources are scoped to organizations:

- **SUPER_ADMIN**: Can access all organizations (can filter by `organization_id`)
- **Other roles**: Automatically scoped to their organization
- Resources created by non-super users are automatically assigned to their organization

## Common Patterns

### Pagination

All list endpoints support pagination via query parameters:

```http
GET /api/v2/properties?page=1&limit=50
```

**Parameters**:
- `page` (int, default: 1, min: 1): Page number
- `limit` (int, default: 50, min: 1, max: 100): Items per page

**Response**: Array of items (no pagination metadata in v2)

### Filtering

Many endpoints support filtering via query parameters:

```http
GET /api/v2/work-orders?status_filter=new&property_id=uuid
```

Common filters:
- `organization_id` (UUID, optional): Filter by organization (SUPER_ADMIN only)
- `status_filter` (string, optional): Filter by status
- `property_id` (UUID, optional): Filter by property
- `search` (string, optional): Text search

### Sorting

Most list endpoints sort by `created_at` descending (newest first). Some endpoints support custom sorting via query parameters.

## Request/Response Format

### Request Bodies

All request bodies use JSON format with `Content-Type: application/json`.

### Response Format

**Success Responses**:
- `200 OK`: Successful GET, PATCH, or POST (non-create)
- `201 Created`: Successful POST (create)
- `204 No Content`: Successful DELETE

**Response Body**: JSON object or array matching the endpoint's response model.

### Error Responses

All errors follow a consistent format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

**HTTP Status Codes**:
- `400 Bad Request`: Invalid request data or validation error
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Authenticated but insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error (Pydantic)

**Example Error Response**:
```json
{
  "detail": "Property not found"
}
```

## Data Types

### UUIDs

All IDs are UUIDs (Universally Unique Identifiers) in the format:
```
550e8400-e29b-41d4-a716-446655440000
```

### Dates

Dates are represented as ISO 8601 strings:
- Date: `"2025-01-15"`
- DateTime: `"2025-01-15T10:30:00Z"`

### Enums

Many fields use string enums. See [Types Documentation](./types.md) for complete enum definitions.

## Rate Limiting

Rate limiting is not currently implemented but may be added in the future.

## CORS

CORS is enabled for configured origins. See backend configuration for allowed origins.

## API Documentation

### Interactive Documentation

FastAPI provides interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

### Markdown Documentation

This documentation is organized by domain:

**Core APIs:**
- [Authentication](./auth.md) - Login and user session management
- [Users](./users.md) - User management and profiles
- [Organizations](./organizations.md) - Organization management
- [RBAC](./rbac.md) - Role and permission management
- [Onboarding](./onboarding.md) - Onboarding status

**Property Management:**
- [Properties](./properties.md) - Property CRUD operations
- [Units](./units.md) - Unit management
- [Landlords](./landlords.md) - Landlord management
- [Tenants](./tenants.md) - Tenant management
- [Leases](./leases.md) - Lease management

**Operations:**
- [Vendors](./vendors.md) - Vendor management
- [Work Orders](./work_orders.md) - Work order management
- [Attachments](./attachments.md) - File upload/download
- [Conversations](./conversations.md) - Messaging
- [Notifications](./notifications.md) - User notifications
- [Tasks](./tasks.md) - Task management

**Financial:**
- [Rent Payments](./rent_payments.md) - Rent payment tracking
- [Expenses](./expenses.md) - Expense management

**Additional:**
- [Forms](./forms.md) - Form management
- [Invitations](./invitations.md) - User invitations
- [Inspections](./inspections.md) - Property inspections
- [Audit Logs](./audit_logs.md) - Audit trail
- [Search](./search.md) - Global search

### Schema Documentation

- [Types](./types.md) - Complete schema definitions and enums
- [Errors](./errors.md) - Error response formats

## Best Practices

1. **Always include the Authorization header** for authenticated endpoints
2. **Handle errors gracefully** - Check status codes and error messages
3. **Use pagination** for list endpoints to avoid large responses
4. **Validate data** before sending requests
5. **Cache tokens** and refresh when expired
6. **Respect rate limits** (when implemented)

## Support

For API support, see the main [Pinaka Documentation](../README.md) or contact the development team.

