# Work Orders API

## Overview

The Work Orders API provides endpoints for managing maintenance work orders.

**Base Path**: `/api/v2/work-orders`

## Endpoints

### GET /work-orders

List work orders with filters and pagination.

#### Summary

List work orders (scoped by organization and role) with pagination. Supports filtering by organization, property, and status.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `READ` on `WORK_ORDER` resource

**Special Rules**:
- Tenants see only their own work orders
- Vendors see only assigned work orders (via work_order_assignments)

#### Path

`GET /api/v2/work-orders`

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

Array of work orders.

```json
[
  {
    "id": "bb0e8400-e29b-41d4-a716-446655440000",
    "title": "Leaky faucet in unit 101",
    "description": "Kitchen faucet is leaking",
    "status": "new",
    "priority": "medium",
    "organization_id": "660e8400-e29b-41d4-a716-446655440001",
    "property_id": "550e8400-e29b-41d4-a716-446655440000",
    "unit_id": "880e8400-e29b-41d4-a716-446655440000",
    "tenant_id": "aa0e8400-e29b-41d4-a716-446655440003",
    "created_by_user_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": null,
    "completed_at": null,
    "comments": []
  }
]
```

**Schema**: `List[WorkOrder]`

---

### POST /work-orders

Create a new work order.

#### Summary

Create work order. Status defaults to "new", priority defaults to "medium".

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `CREATE` on `WORK_ORDER` resource

#### Path

`POST /api/v2/work-orders`

#### Request Body

```json
{
  "title": "Leaky faucet in unit 101",
  "description": "Kitchen faucet is leaking",
  "status": "new",
  "priority": "medium",
  "organization_id": "660e8400-e29b-41d4-a716-446655440001",
  "property_id": "550e8400-e29b-41d4-a716-446655440000",
  "unit_id": "880e8400-e29b-41d4-a716-446655440000",
  "tenant_id": "aa0e8400-e29b-41d4-a716-446655440003"
}
```

**Schema**: `WorkOrderCreate`

#### Responses

##### 201 Created

Work order created successfully.

**Schema**: `WorkOrder`

##### 403 Forbidden

Cannot create work order in different organization.

##### 404 Not Found

Property not found.

---

### GET /work-orders/{work_order_id}

Get work order by ID.

#### Summary

Retrieve a specific work order with comments loaded.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `READ` on `WORK_ORDER` resource

**Special Rules**:
- Tenants can only see their own work orders

#### Path

`GET /api/v2/work-orders/{work_order_id}`

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `work_order_id` | `UUID` | Yes | Work order ID |

#### Responses

##### 200 OK

Work order details with comments.

**Schema**: `WorkOrder`

##### 403 Forbidden

Cannot access work order from different organization or not tenant's work order.

##### 404 Not Found

Work order not found.

---

### PATCH /work-orders/{work_order_id}

Update work order.

#### Summary

Update work order information. Only SUPER_ADMIN, PMC_ADMIN, PM, and LANDLORD can update.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, or `LANDLORD`

#### Path

`PATCH /api/v2/work-orders/{work_order_id}`

#### Request Body

All fields optional:

```json
{
  "title": "Updated title",
  "status": "in_progress",
  "priority": "high"
}
```

**Schema**: `WorkOrderUpdate`

#### Responses

##### 200 OK

Updated work order.

**Schema**: `WorkOrder`

---

### POST /work-orders/{work_order_id}/comments

Add comment to work order.

#### Summary

Add a comment to a work order. Any user with READ permission on the work order can comment.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `READ` on `WORK_ORDER` resource

#### Path

`POST /api/v2/work-orders/{work_order_id}/comments`

#### Request Body

```json
{
  "body": "Vendor has been contacted and will arrive tomorrow."
}
```

**Schema**: `WorkOrderCommentCreate`

#### Responses

##### 201 Created

Comment created successfully.

**Schema**: `WorkOrderComment`

---

### POST /work-orders/{work_order_id}/approve

Approve a work order.

#### Summary

Approve a work order. Only SUPER_ADMIN, PMC_ADMIN, PM, and LANDLORD can approve. Landlords can only approve work orders for their properties.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, or `LANDLORD`

#### Path

`POST /api/v2/work-orders/{work_order_id}/approve`

#### Request Body

```json
{
  "approved_amount": 250.00,
  "notes": "Approved for repair"
}
```

**Schema**: `WorkOrderApprovalRequest`

#### Responses

##### 200 OK

Approved work order.

**Schema**: `WorkOrder`

---

### POST /work-orders/{work_order_id}/assign-vendor

Assign a vendor to a work order.

#### Summary

Assign a vendor to a work order. Creates a work_order_assignment record. If work order status is "new", updates to "waiting_on_vendor".

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, or `LANDLORD`

#### Path

`POST /api/v2/work-orders/{work_order_id}/assign-vendor`

#### Request Body

```json
{
  "vendor_id": "cc0e8400-e29b-41d4-a716-446655440004"
}
```

**Schema**: `WorkOrderAssignVendorRequest`

#### Responses

##### 200 OK

Work order with vendor assigned.

**Schema**: `WorkOrder`

##### 404 Not Found

Vendor not found.

---

### POST /work-orders/{work_order_id}/mark-viewed

Mark work order as viewed.

#### Summary

Mark work order as viewed by landlord or tenant. Used for tracking who has seen the work order.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `CREATE` on `WORK_ORDER` resource

**Special Rules**:
- Tenants can only mark their own work orders
- Landlords can mark work orders for their properties

#### Path

`POST /api/v2/work-orders/{work_order_id}/mark-viewed`

#### Request Body

```json
{
  "role": "landlord"
}
```

**Schema**: `WorkOrderMarkViewedRequest`

#### Responses

##### 200 OK

Success response.

```json
{
  "success": true,
  "message": "Work order marked as viewed"
}
```

---

### GET /work-orders/{work_order_id}/download-pdf

Download work order as PDF.

#### Summary

Generate and download a PDF version of the work order.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Permission**: `CREATE` on `WORK_ORDER` resource

#### Path

`GET /api/v2/work-orders/{work_order_id}/download-pdf`

#### Responses

##### 200 OK

PDF file download.

**Content-Type**: `application/pdf`

---

## Related Documentation

- [Properties API](./properties.md) - Property management
- [Vendors API](./vendors.md) - Vendor management
- [Attachments API](./attachments.md) - File attachments
- [Types](./types.md) - Schema definitions

