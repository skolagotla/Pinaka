# Search API

## Overview

The Search API provides a global search endpoint that searches across multiple entity types.

**Base Path**: `/api/v2/search`

## Endpoints

### GET /search

Global search across entities.

#### Summary

Search across properties, tenants, landlords, leases, and work orders. Results are scoped by organization and role.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: All authenticated users with organization

**Special Rules**:
- Tenants see only their own work orders in results
- Results are filtered by organization for non-super users

#### Path

`GET /api/v2/search`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | `string` | Yes | - | Search query |
| `type` | `string` | No | - | Filter by entity type: "properties", "tenants", "landlords", "leases", "work_orders" |
| `limit` | `int` | No | 10 | Max results per entity type (min: 1, max: 50) |

#### Responses

##### 200 OK

Search results grouped by entity type.

```json
{
  "success": true,
  "query": "main street",
  "results": {
    "properties": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "123 Main Street",
        "address": "123 Main St"
      }
    ],
    "tenants": [
      {
        "id": "aa0e8400-e29b-41d4-a716-446655440003",
        "name": "John Doe",
        "email": "john@example.com"
      }
    ],
    "landlords": [],
    "leases": [],
    "work_orders": [
      {
        "id": "bb0e8400-e29b-41d4-a716-446655440000",
        "title": "Main Street property repair",
        "status": "new"
      }
    ]
  }
}
```

**Search Fields**:
- **Properties**: name, address_line1, city
- **Tenants**: name, email
- **Landlords**: name, email
- **Leases**: ID (partial match)
- **Work Orders**: title, description

---

## Related Documentation

- [Properties API](./properties.md) - Property search
- [Tenants API](./tenants.md) - Tenant search
- [Work Orders API](./work_orders.md) - Work order search

