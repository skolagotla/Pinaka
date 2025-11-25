# Pinaka v2 - Backend API

## Overview

The Pinaka v2 backend is built with FastAPI and provides a comprehensive REST API for property management. All endpoints use the `/api/v2` prefix and are protected by RBAC (Role-Based Access Control).

> **📚 Complete API Documentation**: For detailed, developer-friendly API documentation with request/response examples, see the [API Documentation](./api/overview.md) section.

> **📊 Sequence Diagrams**: For visual request flow diagrams showing how endpoints work, see [API Sequence Diagrams](./diagrams/api-sequences/README.md).

## Base URL

**Development**: `http://localhost:8000/api/v2`  
**Production**: `https://api.pinaka.com/api/v2`

## Authentication

All API endpoints (except `/auth/login`) require authentication via JWT token.

### Login

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

Include the token in the `Authorization` header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Get Current User

```http
GET /api/v2/auth/me
Authorization: Bearer <token>
```

**Response**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "organization_id": "uuid",
    "onboarding_completed": true
  },
  "roles": [
    {
      "id": "uuid",
      "name": "pmc_admin",
      "description": "PMC Administrator"
    }
  ],
  "organization_id": "uuid"
}
```

## API Routers

The backend includes 25+ routers organized by domain:

### Core Routers

1. **auth_v2** - Authentication (`/auth/login`, `/auth/me`)
2. **organizations** - Organization management
3. **users** - User management
4. **rbac** - Role and permission management
5. **onboarding** - Onboarding status management

### Property Management

6. **properties** - Property CRUD operations
7. **units** - Unit CRUD operations
8. **landlords** - Landlord management
9. **tenants** - Tenant management
10. **leases** - Lease management
11. **vendors_v2** - Vendor management

### Operations

12. **work_orders** - Work order management
13. **tasks** - Task management
14. **attachments** - File upload/download
15. **conversations** - Messaging
16. **notifications** - User notifications

### Financials

17. **rent_payments** - Rent payment tracking
18. **expenses** - Expense management

### Additional

19. **forms** - Form management
20. **invitations** - User invitations
21. **inspections** - Property inspections
22. **audit_logs** - Audit trail
23. **search** - Global search
24. **health** - Health check

## Common Patterns

### List Endpoints

All list endpoints support pagination:

```http
GET /api/v2/properties?page=1&limit=50&organization_id=<uuid>
```

**Query Parameters**:
- `page` (int, default: 1): Page number
- `limit` (int, default: 50, max: 100): Items per page
- `organization_id` (UUID, optional): Filter by organization (SUPER_ADMIN only)

**Response**:
```json
[
  {
    "id": "uuid",
    "name": "Property Name",
    "address_line1": "123 Main St",
    "organization_id": "uuid",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

### Create Endpoints

```http
POST /api/v2/properties
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "New Property",
  "address_line1": "123 Main St",
  "city": "Toronto",
  "state": "ON",
  "postal_code": "M5H 2N2",
  "country": "Canada",
  "organization_id": "uuid",
  "landlord_id": "uuid"
}
```

**Response**: `201 Created` with the created entity

### Get by ID

```http
GET /api/v2/properties/{property_id}
Authorization: Bearer <token>
```

**Response**: Single entity object

### Update Endpoints

```http
PATCH /api/v2/properties/{property_id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Updated Property Name",
  "status": "active"
}
```

**Response**: Updated entity object

### Delete Endpoints

```http
DELETE /api/v2/properties/{property_id}
Authorization: Bearer <token>
```

**Response**: `204 No Content`

## API Sequence Diagrams

Detailed sequence diagrams for all API endpoints are available in [`/docs/diagrams/api-sequences/`](./diagrams/api-sequences/README.md). These diagrams show the complete request flow from frontend to database, including:

- Authentication and authorization checks
- RBAC permission evaluation
- Organization scoping
- Database operations
- Response flow

### Available Sequence Diagrams

**Authentication**:
- [POST /auth/login](./diagrams/api-sequences/auth/login.md) - User login flow
- [GET /auth/me](./diagrams/api-sequences/auth/me.md) - Get current user

**Properties**:
- [GET /properties](./diagrams/api-sequences/properties/list.md) - List properties
- [POST /properties](./diagrams/api-sequences/properties/create.md) - Create property
- [GET /properties/{id}](./diagrams/api-sequences/properties/get.md) - Get property by ID

**Leases**:
- [GET /leases](./diagrams/api-sequences/leases/list.md) - List leases
- [POST /leases](./diagrams/api-sequences/leases/create.md) - Create lease

**Work Orders**:
- [GET /work-orders](./diagrams/api-sequences/work-orders/list.md) - List work orders
- [POST /work-orders](./diagrams/api-sequences/work-orders/create.md) - Create work order
- [POST /work-orders/{id}/approve](./diagrams/api-sequences/work-orders/approve.md) - Approve work order
- [POST /work-orders/{id}/assign-vendor](./diagrams/api-sequences/work-orders/assign-vendor.md) - Assign vendor

See the [API Sequences README](./diagrams/api-sequences/README.md) for the complete list of all available sequence diagrams.

## Major API Groups

### Properties API

**Endpoints**:
- `GET /properties` - List properties
- `POST /properties` - Create property
- `GET /properties/{id}` - Get property
- `PATCH /properties/{id}` - Update property
- `DELETE /properties/{id}` - Delete property

**Example Request**:
```typescript
import { v2Api } from '@/lib/api/v2-client';

// List properties
const properties = await v2Api.listProperties(organizationId);

// Create property
const newProperty = await v2Api.createProperty({
  name: "123 Main St",
  address_line1: "123 Main St",
  city: "Toronto",
  organization_id: organizationId,
});
```

### Tenants API

**Endpoints**:
- `GET /tenants` - List tenants
- `POST /tenants` - Create tenant
- `GET /tenants/{id}` - Get tenant
- `PATCH /tenants/{id}` - Update tenant
- `DELETE /tenants/{id}` - Delete tenant
- `POST /tenants/{id}/approve` - Approve tenant
- `POST /tenants/{id}/reject` - Reject tenant

**Example Request**:
```typescript
// List tenants
const tenants = await v2Api.listTenants(organizationId);

// Create tenant
const newTenant = await v2Api.createTenant({
  name: "John Doe",
  email: "john@example.com",
  organization_id: organizationId,
});
```

### Leases API

**Endpoints**:
- `GET /leases` - List leases
- `POST /leases` - Create lease
- `GET /leases/{id}` - Get lease with tenants
- `PATCH /leases/{id}` - Update lease
- `DELETE /leases/{id}` - Delete lease
- `POST /leases/{id}/renew` - Renew lease
- `POST /leases/{id}/terminate` - Terminate lease

**Example Request**:
```typescript
// List leases
const leases = await v2Api.listLeases({ organization_id: organizationId });

// Create lease
const newLease = await v2Api.createLease({
  unit_id: unitId,
  landlord_id: landlordId,
  organization_id: organizationId,
  start_date: "2025-01-01",
  end_date: "2025-12-31",
  rent_amount: 2000.00,
});
```

### Work Orders API

**Endpoints**:
- `GET /work-orders` - List work orders
- `POST /work-orders` - Create work order
- `GET /work-orders/{id}` - Get work order
- `PATCH /work-orders/{id}` - Update work order
- `DELETE /work-orders/{id}` - Delete work order
- `POST /work-orders/{id}/comments` - Add comment
- `POST /work-orders/{id}/approve` - Approve work order
- `POST /work-orders/{id}/assign-vendor` - Assign vendor

**Example Request**:
```typescript
// List work orders
const workOrders = await v2Api.listWorkOrders({
  organization_id: organizationId,
  status: "open"
});

// Create work order
const newWorkOrder = await v2Api.createWorkOrder({
  title: "Fix leaky faucet",
  description: "Kitchen sink faucet is leaking",
  property_id: propertyId,
  unit_id: unitId,
  organization_id: organizationId,
  priority: "medium",
});
```

### Attachments API

**Endpoints**:
- `GET /attachments?entity_type={type}&entity_id={id}` - List attachments
- `POST /attachments?entity_type={type}&entity_id={id}` - Upload file
- `GET /attachments/{id}/download` - Download file
- `DELETE /attachments/{id}` - Delete attachment

**Example Request**:
```typescript
// Upload file
const formData = new FormData();
formData.append('file', file);
const attachment = await v2Api.uploadAttachment(
  'property',
  propertyId,
  formData
);

// Download file
const fileUrl = await v2Api.downloadAttachment(attachmentId);
```

## Error Handling

### Standard Error Response

```json
{
  "detail": "Error message here"
}
```

### HTTP Status Codes

- `200 OK` - Successful GET, PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server error

### Validation Errors

Pydantic validation errors return detailed field-level errors:

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

## RBAC Enforcement

All endpoints use `require_permission` dependency:

```python
@router.get("/properties")
async def list_properties(
    current_user: User = Depends(require_permission(
        PermissionAction.READ,
        ResourceType.PROPERTY
    )),
    db: AsyncSession = Depends(get_db)
):
    # Permission already checked
    # Organization scoping handled automatically
    ...
```

**Permission Actions**:
- `CREATE` - Create new resource
- `READ` - View resource
- `UPDATE` - Modify resource
- `DELETE` - Remove resource
- `MANAGE` - Full CRUD access

**Resource Types**:
- `PROPERTY`, `UNIT`, `TENANT`, `LEASE`, `LANDLORD`, `VENDOR`
- `WORK_ORDER`, `ATTACHMENT`, `MESSAGE`, `NOTIFICATION`
- `ORGANIZATION`, `USER`, `AUDIT_LOG`, `TASK`, `CONVERSATION`

## Organization Scoping

All queries automatically filter by organization:

- **SUPER_ADMIN**: No filter (sees all organizations)
- **Other roles**: Filtered by `user.organization_id`

**Backend Implementation**:
```python
if RoleEnum.SUPER_ADMIN not in user_roles:
    query = query.where(Property.organization_id == current_user.organization_id)
```

## Pagination

All list endpoints support pagination:

**Query Parameters**:
- `page` (int, default: 1, min: 1)
- `limit` (int, default: 50, min: 1, max: 100)

**Response**: Array of entities (no pagination metadata in v2)

**Example**:
```http
GET /api/v2/properties?page=2&limit=25
```

## Using the Typed API Client

### Frontend Usage

```typescript
import { v2Api } from '@/lib/api/v2-client';

// List properties
const properties = await v2Api.listProperties(organizationId);

// Create property
const newProperty = await v2Api.createProperty({
  name: "Property Name",
  address_line1: "123 Main St",
  organization_id: organizationId,
});

// Update property
const updated = await v2Api.updateProperty(propertyId, {
  name: "Updated Name",
});

// Delete property
await v2Api.deleteProperty(propertyId);
```

### React Query Hooks

```typescript
import { useProperties, useCreateProperty } from '@/lib/hooks/useV2Data';

function PropertiesList() {
  const { data: properties, isLoading } = useProperties(organizationId);
  const createProperty = useCreateProperty();
  
  const handleCreate = async () => {
    await createProperty.mutateAsync({
      name: "New Property",
      organization_id: organizationId,
    });
  };
  
  // ...
}
```

## API Documentation

FastAPI automatically generates API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Type Generation

TypeScript types are generated from the OpenAPI spec:

```bash
# Generate types (requires FastAPI server running)
pnpm generate:types
```

Types are stored in `packages/shared-types/v2-api.d.ts`:

```typescript
import type { components } from '@pinaka/shared-types/v2-api';

type Property = components['schemas']['Property'];
type PropertyCreate = components['schemas']['PropertyCreate'];
```

## Best Practices

### 1. Use React Query Hooks

Prefer React Query hooks over direct API calls:

```typescript
// ✅ Good
const { data, isLoading } = useProperties(organizationId);

// ❌ Avoid
const [properties, setProperties] = useState([]);
useEffect(() => {
  v2Api.listProperties(organizationId).then(setProperties);
}, []);
```

### 2. Handle Errors

Always handle API errors:

```typescript
const { data, error, isLoading } = useProperties(organizationId);

if (error) {
  return <Alert color="failure">{error.detail}</Alert>;
}
```

### 3. Use Organization Scoping

Always pass organization ID for scoped queries:

```typescript
const orgId = useOrganizationId();
const { data } = useProperties(orgId);
```

### 4. Optimistic Updates

Use React Query's optimistic updates for better UX:

```typescript
const updateProperty = useUpdateProperty();

updateProperty.mutate(
  { id, data },
  {
    onMutate: async (newData) => {
      // Optimistically update cache
      await queryClient.cancelQueries(['v2', 'properties']);
      const previous = queryClient.getQueryData(['v2', 'properties']);
      queryClient.setQueryData(['v2', 'properties'], (old) => {
        return old.map(p => p.id === id ? { ...p, ...newData.data } : p);
      });
      return { previous };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(['v2', 'properties'], context.previous);
    },
  }
);
```

---

**Related Documentation**:
- [Architecture](01_Architecture.md) - System architecture
- [RBAC](05_RBAC_Roles_and_Permissions.md) - Access control
- [Development Guide](10_Development_Guide.md) - Adding new endpoints

