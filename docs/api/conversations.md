# Conversations API

## Overview

The Conversations API provides endpoints for managing messaging conversations and messages.

**Base Path**: `/api/v2/conversations`

## Endpoints

### GET /conversations

List conversations for the current user.

#### Summary

List conversations where the user is a participant. Supports filtering by organization, entity type, and entity ID.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: All authenticated users with organization

#### Path

`GET /api/v2/conversations`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `organization_id` | `UUID` | No | - | Filter by organization (SUPER_ADMIN only) |
| `entity_type` | `string` | No | - | Filter by entity type |
| `entity_id` | `UUID` | No | - | Filter by entity ID |
| `page` | `int` | No | 1 | Page number (min: 1) |
| `limit` | `int` | No | 50 | Items per page (min: 1, max: 100) |

#### Responses

##### 200 OK

Array of conversations with messages.

**Schema**: `List[Conversation]`

**Note**: Users only see conversations they're participants in.

---

### GET /conversations/{conversation_id}

Get conversation by ID.

#### Summary

Retrieve a specific conversation with all messages. User must be a participant.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: All authenticated users with organization

#### Path

`GET /api/v2/conversations/{conversation_id}`

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `conversation_id` | `UUID` | Yes | Conversation ID |

#### Responses

##### 200 OK

Conversation details with messages.

**Schema**: `Conversation`

##### 404 Not Found

Conversation not found or user is not a participant.

---

### POST /conversations

Create a new conversation.

#### Summary

Create a conversation with participants. Creator is automatically added as a participant.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: All authenticated users with organization

#### Path

`POST /api/v2/conversations`

#### Request Body

```json
{
  "organization_id": "660e8400-e29b-41d4-a716-446655440001",
  "subject": "Work order discussion",
  "entity_type": "work_order",
  "entity_id": "bb0e8400-e29b-41d4-a716-446655440000",
  "participant_user_ids": ["550e8400-e29b-41d4-a716-446655440000"]
}
```

**Schema**: `ConversationCreate`

#### Responses

##### 201 Created

Conversation created successfully.

**Schema**: `Conversation`

##### 403 Forbidden

Cannot create conversation for different organization.

---

### PATCH /conversations/{conversation_id}

Update conversation.

#### Summary

Update conversation subject or status.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: All authenticated users with organization

#### Path

`PATCH /api/v2/conversations/{conversation_id}`

#### Request Body

```json
{
  "subject": "Updated subject",
  "status": "archived"
}
```

**Schema**: `ConversationUpdate`

#### Responses

##### 200 OK

Updated conversation.

**Schema**: `Conversation`

---

### POST /conversations/{conversation_id}/messages

Send a message in a conversation.

#### Summary

Add a message to a conversation. User must be a participant.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: All authenticated users with organization

#### Path

`POST /api/v2/conversations/{conversation_id}/messages`

#### Request Body

```json
{
  "body": "This is a message"
}
```

**Schema**: `MessageCreate`

#### Responses

##### 201 Created

Message created successfully.

**Schema**: `Message`

---

### GET /conversations/{conversation_id}/messages

List messages in a conversation.

#### Summary

Get all messages in a conversation. User must be a participant.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: All authenticated users with organization

#### Path

`GET /api/v2/conversations/{conversation_id}/messages`

#### Responses

##### 200 OK

Array of messages.

**Schema**: `List[Message]`

---

## Related Documentation

- [Notifications API](./notifications.md) - Message notifications
- [Types](./types.md) - Schema definitions

