# Notifications API

## Overview

The Notifications API provides endpoints for managing user notifications.

**Base Path**: `/api/v2/notifications`

## Endpoints

### GET /notifications

List notifications for the current user.

#### Summary

List notifications for the current user with pagination. Supports filtering by read status.

#### Authentication

**Required** - JWT token

#### Path

`GET /api/v2/notifications`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `is_read` | `boolean` | No | - | Filter by read status |
| `page` | `int` | No | 1 | Page number (min: 1) |
| `limit` | `int` | No | 50 | Items per page (min: 1, max: 100) |

#### Responses

##### 200 OK

Array of notifications.

```json
[
  {
    "id": "dd0e8400-e29b-41d4-a716-446655440000",
    "entity_type": "work_order",
    "entity_id": "bb0e8400-e29b-41d4-a716-446655440000",
    "type": "WORK_ORDER_UPDATED",
    "is_read": false,
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "organization_id": "660e8400-e29b-41d4-a716-446655440001",
    "created_at": "2025-01-15T10:30:00Z",
    "read_at": null
  }
]
```

**Schema**: `List[Notification]`

---

### POST /notifications

Create a notification.

#### Summary

Create a notification (typically done by system). Only SUPER_ADMIN, PMC_ADMIN, or PM can create notifications.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN`, `PMC_ADMIN`, or `PM`

#### Path

`POST /api/v2/notifications`

#### Request Body

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "organization_id": "660e8400-e29b-41d4-a716-446655440001",
  "entity_type": "work_order",
  "entity_id": "bb0e8400-e29b-41d4-a716-446655440000",
  "type": "WORK_ORDER_UPDATED",
  "is_read": false
}
```

**Schema**: `NotificationCreate`

#### Responses

##### 201 Created

Notification created successfully.

**Schema**: `Notification`

##### 403 Forbidden

Only admins and PMs can create notifications.

---

### GET /notifications/{notification_id}

Get notification by ID.

#### Summary

Retrieve a specific notification. Users can only access their own notifications.

#### Authentication

**Required** - JWT token

#### Path

`GET /api/v2/notifications/{notification_id}`

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notification_id` | `UUID` | Yes | Notification ID |

#### Responses

##### 200 OK

Notification details.

**Schema**: `Notification`

##### 404 Not Found

Notification not found or not owned by user.

---

### PATCH /notifications/{notification_id}/read

Mark notification as read.

#### Summary

Mark a specific notification as read. Users can only mark their own notifications.

#### Authentication

**Required** - JWT token

#### Path

`PATCH /api/v2/notifications/{notification_id}/read`

#### Responses

##### 200 OK

Notification marked as read.

**Schema**: `Notification`

---

### POST /notifications/mark-all-read

Mark all notifications as read.

#### Summary

Mark all unread notifications for the current user as read.

#### Authentication

**Required** - JWT token

#### Path

`POST /api/v2/notifications/mark-all-read`

#### Responses

##### 204 No Content

All notifications marked as read.

---

## Related Documentation

- [Conversations API](./conversations.md) - Messaging
- [Types](./types.md) - Schema definitions

