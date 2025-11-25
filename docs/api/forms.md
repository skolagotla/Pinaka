# Forms API

## Overview

The Forms API provides endpoints for managing legal forms (N4, N5, L1, T1, etc.) and digital signatures.

**Base Path**: `/api/v2/forms`

## Endpoints

### GET /forms

List forms with filters and pagination.

#### Summary

List forms (scoped by organization) with pagination. Supports filtering by form type, entity type, and entity ID.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, `LANDLORD`, or `TENANT`

#### Path

`GET /api/v2/forms`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `organization_id` | `UUID` | No | - | Filter by organization (SUPER_ADMIN only) |
| `form_type` | `string` | No | - | Filter by form type (N4, N5, L1, T1, etc.) |
| `entity_type` | `string` | No | - | Filter by entity type |
| `entity_id` | `UUID` | No | - | Filter by entity ID |
| `page` | `int` | No | 1 | Page number (min: 1) |
| `limit` | `int` | No | 50 | Items per page (min: 1, max: 100) |

#### Responses

##### 200 OK

Array of forms with signatures.

**Schema**: `List[Form]`

---

### GET /forms/{form_id}

Get form by ID.

#### Summary

Retrieve a specific form with all signatures.

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, `LANDLORD`, or `TENANT`

#### Path

`GET /api/v2/forms/{form_id}`

#### Responses

##### 200 OK

Form details with signatures.

**Schema**: `Form`

##### 404 Not Found

Form not found.

---

### POST /forms

Create a new form.

#### Summary

Create a form (legal document). Form status defaults to "draft".

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, `LANDLORD`, or `TENANT`

#### Path

`POST /api/v2/forms`

#### Request Body

```json
{
  "organization_id": "660e8400-e29b-41d4-a716-446655440001",
  "form_type": "N4",
  "entity_type": "lease",
  "entity_id": "990e8400-e29b-41d4-a716-446655440000",
  "template_data": {
    "tenant_name": "John Doe",
    "property_address": "123 Main St",
    "amount_owed": 1500.00
  }
}
```

**Schema**: `FormCreate`

#### Responses

##### 201 Created

Form created successfully.

**Schema**: `Form`

##### 403 Forbidden

Cannot create form for different organization.

---

### POST /forms/{form_id}/signatures

Add signature to form.

#### Summary

Add a digital signature to a form. If form status is "pending_signature", it's updated to "signed".

#### Authentication

**Required** - JWT token

#### RBAC

**Required Role**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, `LANDLORD`, or `TENANT`

#### Path

`POST /api/v2/forms/{form_id}/signatures`

#### Request Body

```json
{
  "signature_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Schema**: `FormSignatureCreate`

**Note**: `signature_data` is a Base64-encoded signature image.

#### Responses

##### 201 Created

Signature added successfully.

**Schema**: `FormSignature`

##### 404 Not Found

Form not found.

---

## Related Documentation

- [Leases API](./leases.md) - Lease-related forms
- [Types](./types.md) - Schema definitions

