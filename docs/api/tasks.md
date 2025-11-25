# Tasks API

## Overview

The Tasks API provides endpoints for managing tasks and calendar items.

**Base Path**: `/api/v2/tasks`

## Endpoints

### GET /tasks

List tasks with filters and pagination.

#### Summary

List tasks (scoped by organization and role) with pagination. Supports filtering by organization, property, and status.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, `LANDLORD`, or `TENANT`

#### Path

`GET /api/v2/tasks`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `organization_id` | `UUID` | No | - | Filter by organization (SUPER_ADMIN only) |
| `property_id` | `UUID` | No | - | Filter by property |
| `status_filter` | `string` | No | - | Filter by status: "completed" or "pending" |
| `page` | `int` | No | 1 | Page number (min: 1) |
| `limit` | `int` | No | 50 | Items per page (min: 1, max: 100) |

#### Responses

##### 200 OK

Array of tasks.

**Schema**: `List[Task]`

---

### GET /tasks/{task_id}

Get task by ID.

#### Summary

Retrieve a specific task's details.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, `LANDLORD`, or `TENANT`

#### Path

`GET /api/v2/tasks/{task_id}`

#### Responses

##### 200 OK

Task details.

**Schema**: `Task`

##### 404 Not Found

Task not found.

---

### POST /tasks

Create a task.

#### Summary

Create a new task with due date and priority.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, `LANDLORD`, or `TENANT`

#### Path

`POST /api/v2/tasks`

#### Request Body

```json
{
  "organization_id": "660e8400-e29b-41d4-a716-446655440001",
  "title": "Review lease renewal",
  "description": "Review and approve lease renewal for unit 101",
  "category": "lease",
  "due_date": "2025-02-01T10:00:00Z",
  "priority": "high",
  "property_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Schema**: `TaskCreate`

#### Responses

##### 201 Created

Task created successfully.

**Schema**: `Task`

##### 403 Forbidden

Cannot create task for different organization.

---

### PATCH /tasks/{task_id}

Update task.

#### Summary

Update task information. Setting `is_completed` to true automatically sets `completed_at`.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, `LANDLORD`, or `TENANT`

#### Path

`PATCH /api/v2/tasks/{task_id}`

#### Request Body

All fields optional:

```json
{
  "is_completed": true,
  "priority": "urgent",
  "due_date": "2025-02-05T10:00:00Z"
}
```

**Schema**: `TaskUpdate`

#### Responses

##### 200 OK

Updated task.

**Schema**: `Task`

---

### DELETE /tasks/{task_id}

Delete task.

#### Summary

Permanently delete a task. Only SUPER_ADMIN, PMC_ADMIN, PM, and LANDLORD can delete.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, or `LANDLORD`

#### Path

`DELETE /api/v2/tasks/{task_id}`

#### Responses

##### 204 No Content

Task deleted successfully.

##### 404 Not Found

Task not found.

---

## Related Documentation

- [Properties API](./properties.md) - Property-related tasks
- [Types](./types.md) - Schema definitions

