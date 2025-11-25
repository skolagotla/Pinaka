# Inspections API

## Overview

The Inspections API provides endpoints for managing property inspections (move-in, move-out, routine, damage, etc.).

**Base Path**: `/api/v2/inspections`

## Endpoints

### GET /inspections

List inspections with filters and pagination.

#### Summary

List inspections (scoped by organization) with pagination. Supports filtering by organization, property, and status.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, `LANDLORD`, or `TENANT`

#### Path

`GET /api/v2/inspections`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `organization_id` | `UUID` | No | - | Filter by organization (SUPER_ADMIN only) |
| `property_id` | `UUID` | No | - | Filter by property |
| `status_filter` | `string` | No | - | Filter by status |
| `page` | `int` | No | 1 | Page number (min: 1) |
| `limit` | `int` | No | 50 | Items per page (min: 1, max: 100) |

#### Responses

##### 200 OK

Array of inspections.

**Schema**: `List[Inspection]`

---

### POST /inspections

Create an inspection.

#### Summary

Schedule a property inspection. Status defaults to "scheduled".

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, or `LANDLORD`

#### Path

`POST /api/v2/inspections`

#### Request Body

```json
{
  "organization_id": "660e8400-e29b-41d4-a716-446655440001",
  "property_id": "550e8400-e29b-41d4-a716-446655440000",
  "unit_id": "880e8400-e29b-41d4-a716-446655440000",
  "lease_id": "990e8400-e29b-41d4-a716-446655440000",
  "inspection_type": "move_in",
  "scheduled_date": "2025-02-01",
  "notes": "Initial move-in inspection",
  "checklist_data": {
    "walls": "good",
    "floors": "good",
    "appliances": "needs repair"
  }
}
```

**Schema**: `InspectionCreate`

#### Responses

##### 201 Created

Inspection created successfully.

**Schema**: `Inspection`

##### 403 Forbidden

Cannot create inspection for different organization.

---

### PATCH /inspections/{inspection_id}

Update inspection.

#### Summary

Update inspection information, including completion status and checklist data.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, or `LANDLORD`

#### Path

`PATCH /api/v2/inspections/{inspection_id}`

#### Request Body

All fields optional:

```json
{
  "status": "completed",
  "completed_date": "2025-02-01",
  "checklist_data": {
    "walls": "excellent",
    "floors": "good",
    "appliances": "repaired"
  }
}
```

**Schema**: `InspectionUpdate`

#### Responses

##### 200 OK

Updated inspection.

**Schema**: `Inspection`

---

## Related Documentation

- [Properties API](./properties.md) - Property management
- [Leases API](./leases.md) - Lease-related inspections
- [Types](./types.md) - Schema definitions

