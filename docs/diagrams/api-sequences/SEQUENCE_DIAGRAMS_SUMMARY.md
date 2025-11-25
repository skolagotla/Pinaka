# API Sequence Diagrams - Generation Summary

## Overview

This document summarizes the generation of sequence diagrams for all Pinaka v2 API endpoints.

## Generation Status

### Completed Diagrams

#### Authentication (2/2)
- ✅ POST /auth/login
- ✅ GET /auth/me

#### Properties (3/3)
- ✅ GET /properties (list)
- ✅ POST /properties (create)
- ✅ GET /properties/{id} (get)

#### Leases (2/7)
- ✅ GET /leases (list)
- ✅ POST /leases (create)
- ⏳ GET /leases/{id}
- ⏳ PATCH /leases/{id}
- ⏳ DELETE /leases/{id}
- ⏳ POST /leases/{id}/renew
- ⏳ POST /leases/{id}/terminate

#### Work Orders (4/9)
- ✅ GET /work-orders (list)
- ✅ POST /work-orders (create)
- ⏳ GET /work-orders/{id}
- ⏳ PATCH /work-orders/{id}
- ⏳ POST /work-orders/{id}/comments
- ✅ POST /work-orders/{id}/approve
- ✅ POST /work-orders/{id}/assign-vendor
- ⏳ POST /work-orders/{id}/mark-viewed
- ⏳ GET /work-orders/{id}/download-pdf

### Pending Diagrams

The following domains and endpoints still need sequence diagrams:

#### Units (0/5)
- ⏳ GET /units
- ⏳ POST /units
- ⏳ GET /units/{id}
- ⏳ PATCH /units/{id}
- ⏳ DELETE /units/{id}

#### Landlords (0/5)
- ⏳ GET /landlords
- ⏳ POST /landlords
- ⏳ GET /landlords/{id}
- ⏳ PATCH /landlords/{id}
- ⏳ DELETE /landlords/{id}

#### Tenants (0/9)
- ⏳ GET /tenants
- ⏳ POST /tenants
- ⏳ GET /tenants/{id}
- ⏳ PATCH /tenants/{id}
- ⏳ DELETE /tenants/{id}
- ⏳ POST /tenants/{id}/approve
- ⏳ POST /tenants/{id}/reject
- ⏳ GET /tenants/{id}/rent-data
- ⏳ GET /tenants/with-outstanding-balance

#### Vendors (0/5)
- ⏳ GET /vendors
- ⏳ POST /vendors
- ⏳ GET /vendors/{id}
- ⏳ PATCH /vendors/{id}
- ⏳ DELETE /vendors/{id}

#### Users (0/6)
- ⏳ GET /users
- ⏳ POST /users
- ⏳ GET /users/{id}
- ⏳ PATCH /users/{id}
- ⏳ PATCH /users/me
- ⏳ DELETE /users/{id}

#### Organizations (0/3)
- ⏳ GET /organizations
- ⏳ POST /organizations
- ⏳ GET /organizations/{id}

#### Attachments (0/4)
- ⏳ GET /attachments
- ⏳ POST /attachments
- ⏳ GET /attachments/{id}/download
- ⏳ DELETE /attachments/{id}

#### Conversations (0/6)
- ⏳ GET /conversations
- ⏳ GET /conversations/{id}
- ⏳ POST /conversations
- ⏳ PATCH /conversations/{id}
- ⏳ POST /conversations/{id}/messages
- ⏳ GET /conversations/{id}/messages

#### Notifications (0/5)
- ⏳ GET /notifications
- ⏳ POST /notifications
- ⏳ GET /notifications/{id}
- ⏳ PATCH /notifications/{id}/read
- ⏳ POST /notifications/mark-all-read

#### Other Domains
- Rent Payments (3 endpoints)
- Expenses (3 endpoints)
- Forms (4 endpoints)
- Invitations (5 endpoints)
- Inspections (3 endpoints)
- Tasks (2 endpoints)
- Audit Logs (3 endpoints)
- Search (1 endpoint)
- RBAC (5 endpoints)
- Onboarding (3 endpoints)

## Statistics

- **Total Endpoints**: ~106
- **Completed Diagrams**: 11
- **Pending Diagrams**: ~95
- **Completion**: ~10%

## Diagram Structure

Each sequence diagram includes:

1. **Title**: Endpoint name and HTTP method
2. **Mermaid Sequence Diagram**: Visual flow showing:
   - User interaction
   - Frontend → React Query → API Client
   - FastAPI → Auth → RBAC → CRUD Helpers → DB
   - Response flow back to user
3. **Endpoint Details**: 
   - HTTP method and path
   - Query parameters
   - Auth requirements
   - RBAC permissions
   - Response types
   - Dependencies

## Common Patterns

### Standard CRUD Pattern

Most endpoints follow this pattern:

```
User → Frontend → ReactQuery → APIClient → FastAPI
  → AuthMW (get_current_user_v2)
  → RBACMW (require_permission)
  → CRUDHelpers (apply_organization_filter, apply_pagination)
  → DB (SELECT/INSERT/UPDATE/DELETE)
  → Response → Frontend → User
```

### Special Operations

Some endpoints have additional steps:
- **Approve/Reject**: Status update + notifications
- **Assign**: Create assignment record + update status
- **Renew/Terminate**: Date calculations + status updates
- **File Upload**: File system operations + attachment record

## Next Steps

1. Continue generating sequence diagrams for remaining endpoints
2. Focus on high-priority domains (Users, Tenants, Leases, Work Orders)
3. Generate PNG files for all diagrams
4. Update documentation with cross-links
5. Create domain-specific index pages

## Files Generated

### Markdown Files
- `/docs/diagrams/api-sequences/README.md` - Main index
- `/docs/diagrams/api-sequences/SEQUENCE_DIAGRAMS_SUMMARY.md` - This file
- Domain-specific directories with `.md` files

### PNG Files
- Generated for all completed diagrams
- Located alongside `.md` files
- Generated using `@mermaid-js/mermaid-cli`

## Documentation Updates

Updated documentation files with links to sequence diagrams:

- ✅ `docs/02_Backend_API.md` - Added sequence diagrams section
- ✅ `docs/01_Architecture.md` - Added link to API sequences
- ✅ `docs/06_Domain_Models.md` - Added link to API sequences

## Usage

To view sequence diagrams:

1. Navigate to `/docs/diagrams/api-sequences/`
2. Browse by domain folder
3. Open `.md` files to view Mermaid diagrams
4. View `.png` files for rendered images

To generate PNG files:

```bash
cd docs/diagrams/api-sequences
for file in **/*.md; do
    mmdc -i "$file" -o "${file%.md}.png"
done
```

