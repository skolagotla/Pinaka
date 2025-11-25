# Expenses API

## Overview

The Expenses API provides endpoints for managing property expenses.

**Base Path**: `/api/v2/expenses`

## Endpoints

### GET /expenses

List expenses with filters and pagination.

#### Summary

List expenses (scoped by organization) with pagination. Supports filtering by organization, property, category, and status.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, or `LANDLORD`

#### Path

`GET /api/v2/expenses`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `organization_id` | `UUID` | No | - | Filter by organization (SUPER_ADMIN only) |
| `property_id` | `UUID` | No | - | Filter by property |
| `category` | `string` | No | - | Filter by category |
| `status_filter` | `string` | No | - | Filter by status |
| `page` | `int` | No | 1 | Page number (min: 1) |
| `limit` | `int` | No | 50 | Items per page (min: 1, max: 100) |

#### Responses

##### 200 OK

Array of expenses.

**Schema**: `List[Expense]`

---

### POST /expenses

Create an expense.

#### Summary

Record an expense for a property, work order, or vendor.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, or `LANDLORD`

#### Path

`POST /api/v2/expenses`

#### Request Body

```json
{
  "organization_id": "660e8400-e29b-41d4-a716-446655440001",
  "property_id": "550e8400-e29b-41d4-a716-446655440000",
  "work_order_id": "bb0e8400-e29b-41d4-a716-446655440000",
  "vendor_id": "cc0e8400-e29b-41d4-a716-446655440004",
  "category": "maintenance",
  "amount": 250.00,
  "expense_date": "2025-01-15",
  "description": "Plumbing repair",
  "receipt_attachment_id": "ee0e8400-e29b-41d4-a716-446655440005"
}
```

**Schema**: `ExpenseCreate`

#### Responses

##### 201 Created

Expense created successfully.

**Schema**: `Expense`

##### 403 Forbidden

Cannot create expense for different organization.

---

### PATCH /expenses/{expense_id}

Update expense.

#### Summary

Update expense information.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, or `LANDLORD`

#### Path

`PATCH /api/v2/expenses/{expense_id}`

#### Request Body

All fields optional:

```json
{
  "status": "approved",
  "amount": 275.00,
  "description": "Updated description"
}
```

**Schema**: `ExpenseUpdate`

#### Responses

##### 200 OK

Updated expense.

**Schema**: `Expense`

---

## Related Documentation

- [Work Orders API](./work_orders.md) - Work order expenses
- [Attachments API](./attachments.md) - Receipt attachments
- [Types](./types.md) - Schema definitions

