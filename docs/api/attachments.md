# Attachments API

## Overview

The Attachments API provides endpoints for uploading, downloading, and managing file attachments.

**Base Path**: `/api/v2/attachments`

## Endpoints

### GET /attachments

List attachments for an entity.

#### Summary

List attachments for a specific entity (work order, message, lease, property, etc.).

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: All authenticated users with organization

#### Path

`GET /api/v2/attachments`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entity_type` | `string` | Yes | Entity type: "work_order", "message", "lease", "property", etc. |
| `entity_id` | `UUID` | Yes | Entity ID |

#### Responses

##### 200 OK

Array of attachments.

**Schema**: `List[Attachment]`

---

### POST /attachments

Upload an attachment.

#### Summary

Upload a file attachment for an entity. Files are stored locally in `uploads/{organization_id}/{entity_type}/{entity_id}/`.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: All authenticated users with organization

#### Path

`POST /api/v2/attachments`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entity_type` | `string` | Yes | Entity type |
| `entity_id` | `UUID` | Yes | Entity ID |

#### Request Body

**Content-Type**: `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | `File` | Yes | File to upload |

#### Responses

##### 201 Created

Attachment created successfully.

**Schema**: `Attachment`

##### 403 Forbidden

Organization required.

---

### GET /attachments/{attachment_id}/download

Download an attachment file.

#### Summary

Download the file associated with an attachment.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: All authenticated users with organization

#### Path

`GET /api/v2/attachments/{attachment_id}/download`

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `attachment_id` | `UUID` | Yes | Attachment ID |

#### Responses

##### 200 OK

File download.

**Content-Type**: Based on attachment's `mime_type`

**Headers**:
- `Content-Disposition: attachment; filename="{file_name}"`

##### 404 Not Found

Attachment or file not found.

---

### DELETE /attachments/{attachment_id}

Delete an attachment.

#### Summary

Delete an attachment and its associated file. Only SUPER_ADMIN, PMC_ADMIN, PM, and LANDLORD can delete.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, or `LANDLORD`

#### Path

`DELETE /api/v2/attachments/{attachment_id}`

#### Responses

##### 204 No Content

Attachment deleted successfully.

##### 404 Not Found

Attachment not found.

---

## Related Documentation

- [Work Orders API](./work_orders.md) - Work order attachments
- [Types](./types.md) - Schema definitions

