# API Sequence Diagrams

This directory contains sequence diagrams for all API endpoints in Pinaka v2, organized by domain.

## Directory Structure

```
api-sequences/
├── auth/              # Authentication endpoints
├── users/             # User management
├── organizations/     # Organization management
├── properties/        # Property CRUD
├── units/             # Unit CRUD
├── landlords/         # Landlord management
├── tenants/           # Tenant management
├── leases/            # Lease management
├── vendors/           # Vendor management
├── work-orders/       # Work order management
├── attachments/       # File upload/download
├── conversations/    # Messaging
├── notifications/     # User notifications
├── rent-payments/     # Rent payment tracking
├── expenses/          # Expense management
├── forms/             # Form management
├── invitations/       # User invitations
├── inspections/       # Property inspections
├── tasks/             # Task management
├── audit-logs/        # Audit trail
├── search/            # Global search
├── rbac/              # RBAC operations
└── onboarding/       # Onboarding status
```

## Diagram Format

Each sequence diagram follows this standard format:

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant ReactQuery
    participant APIClient
    participant FastAPI
    participant AuthMW
    participant RBACMW
    participant CRUDHelpers
    participant DB
    ...
```

## Common Patterns

### Standard CRUD Flow

1. **List**: `GET /api/v2/{resource}`
   - Auth → RBAC → Org Filter → Pagination → DB Query → Response

2. **Create**: `POST /api/v2/{resource}`
   - Auth → RBAC → Org Access Check → Validation → DB Insert → Response

3. **Get**: `GET /api/v2/{resource}/{id}`
   - Auth → RBAC → Fetch Entity → Org Access Check → Response

4. **Update**: `PATCH /api/v2/{resource}/{id}`
   - Auth → RBAC → Fetch Entity → Org Access Check → Update Fields → DB Commit → Response

5. **Delete**: `DELETE /api/v2/{resource}/{id}`
   - Auth → RBAC → Fetch Entity → Org Access Check → DB Delete → Response

### Special Operations

- **Approve/Reject**: `POST /api/v2/{resource}/{id}/approve`
- **Assign**: `POST /api/v2/{resource}/{id}/assign`
- **Renew/Terminate**: `POST /api/v2/{resource}/{id}/renew`
- **Comments**: `POST /api/v2/{resource}/{id}/comments`

## Endpoint Coverage

### Auth (2 endpoints)
- ✅ POST /auth/login
- ✅ GET /auth/me

### Properties (3 endpoints)
- ✅ GET /properties
- ✅ POST /properties
- ✅ GET /properties/{id}

### Units (5 endpoints)
- ✅ GET /units
- ✅ POST /units
- ✅ GET /units/{id}
- ⏳ PATCH /units/{id}
- ⏳ DELETE /units/{id}

### Landlords (5 endpoints)
- ⏳ GET /landlords
- ⏳ POST /landlords
- ⏳ GET /landlords/{id}
- ⏳ PATCH /landlords/{id}
- ⏳ DELETE /landlords/{id}

### Tenants (9 endpoints)
- ⏳ GET /tenants
- ⏳ POST /tenants
- ⏳ GET /tenants/{id}
- ⏳ PATCH /tenants/{id}
- ⏳ DELETE /tenants/{id}
- ⏳ POST /tenants/{id}/approve
- ⏳ POST /tenants/{id}/reject
- ⏳ GET /tenants/{id}/rent-data
- ⏳ GET /tenants/with-outstanding-balance

### Leases (7 endpoints)
- ⏳ GET /leases
- ✅ POST /leases
- ⏳ GET /leases/{id}
- ⏳ PATCH /leases/{id}
- ⏳ DELETE /leases/{id}
- ⏳ POST /leases/{id}/renew
- ⏳ POST /leases/{id}/terminate

### Work Orders (9 endpoints)
- ⏳ GET /work-orders
- ✅ POST /work-orders
- ⏳ GET /work-orders/{id}
- ⏳ PATCH /work-orders/{id}
- ⏳ POST /work-orders/{id}/comments
- ⏳ POST /work-orders/{id}/approve
- ⏳ POST /work-orders/{id}/assign-vendor
- ⏳ POST /work-orders/{id}/mark-viewed
- ⏳ GET /work-orders/{id}/download-pdf

### Vendors (5 endpoints)
- ⏳ GET /vendors
- ⏳ POST /vendors
- ⏳ GET /vendors/{id}
- ⏳ PATCH /vendors/{id}
- ⏳ DELETE /vendors/{id}

### Users (6 endpoints)
- ⏳ GET /users
- ⏳ POST /users
- ⏳ GET /users/{id}
- ⏳ PATCH /users/{id}
- ⏳ PATCH /users/me
- ⏳ DELETE /users/{id}

### Organizations (3 endpoints)
- ⏳ GET /organizations
- ⏳ POST /organizations
- ⏳ GET /organizations/{id}

### Attachments (4 endpoints)
- ⏳ GET /attachments
- ⏳ POST /attachments
- ⏳ GET /attachments/{id}/download
- ⏳ DELETE /attachments/{id}

### Conversations (6 endpoints)
- ⏳ GET /conversations
- ⏳ GET /conversations/{id}
- ⏳ POST /conversations
- ⏳ PATCH /conversations/{id}
- ⏳ POST /conversations/{id}/messages
- ⏳ GET /conversations/{id}/messages

### Notifications (5 endpoints)
- ⏳ GET /notifications
- ⏳ POST /notifications
- ⏳ GET /notifications/{id}
- ⏳ PATCH /notifications/{id}/read
- ⏳ POST /notifications/mark-all-read

### Other Domains
- Rent Payments, Expenses, Forms, Invitations, Inspections, Tasks, Audit Logs, Search, RBAC, Onboarding

**Legend:**
- ✅ Complete
- ⏳ Pending

## Usage

Each diagram file contains:
1. **Title**: Endpoint name and HTTP method
2. **Sequence Diagram**: Mermaid diagram showing the flow
3. **Endpoint Details**: Method, path, auth requirements, dependencies

## Generating PNG Files

To generate PNG files from markdown:

```bash
cd docs/diagrams/api-sequences
for file in **/*.md; do
    mmdc -i "$file" -o "${file%.md}.png"
done
```

## Related Documentation

- [Backend API Documentation](../../02_Backend_API.md)
- [Architecture Overview](../../01_Architecture.md)
- [RBAC Documentation](../../05_RBAC_Roles_and_Permissions.md)

