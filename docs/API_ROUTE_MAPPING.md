# Next.js API Routes → FastAPI v2 Endpoints Mapping

This document tracks the migration of Next.js API routes to FastAPI v2 endpoints.

## Migration Status Legend
- ✅ **Migrated** - Fully implemented in FastAPI v2
- 🔄 **Partial** - Partially implemented, needs completion
- ❌ **Not Migrated** - Not yet implemented in FastAPI v2
- 🗑️ **Deprecated** - No longer needed or replaced by different functionality

---

## Authentication

| Next.js Route | FastAPI v2 Endpoint | Status | Notes |
|--------------|---------------------|--------|-------|
| `POST /api/v2/auth/login` | `POST /api/v2/auth/login` | ✅ | Already migrated |
| `GET /api/v2/auth/me` | `GET /api/v2/auth/me` | ✅ | Already migrated |
| `POST /api/admin/auth/login` | `POST /api/v2/auth/login` | ✅ | Use v2 endpoint |
| `GET /api/admin/auth/me` | `GET /api/v2/auth/me` | ✅ | Use v2 endpoint |

---

## Organizations

| Next.js Route | FastAPI v2 Endpoint | Status | Notes |
|--------------|---------------------|--------|-------|
| `GET /api/v2/organizations` | `GET /api/v2/organizations` | ✅ | Already migrated |
| `POST /api/v2/organizations` | `POST /api/v2/organizations` | ✅ | Already migrated |
| `GET /api/v2/organizations/{id}` | `GET /api/v2/organizations/{id}` | ✅ | Already migrated |
| `PATCH /api/v2/organizations/{id}` | `PATCH /api/v2/organizations/{id}` | ✅ | Already migrated |

---

## Properties

| Next.js Route | FastAPI v2 Endpoint | Status | Notes |
|--------------|---------------------|--------|-------|
| `GET /api/v1/properties` | `GET /api/v2/properties` | ✅ | Migrated |
| `POST /api/v1/properties` | `POST /api/v2/properties` | ✅ | Migrated |
| `GET /api/v1/properties/{id}` | `GET /api/v2/properties/{id}` | ✅ | Migrated |
| `PATCH /api/v1/properties/{id}` | `PATCH /api/v2/properties/{id}` | ✅ | Migrated |
| `GET /api/v1/properties/{id}/units` | `GET /api/v2/units?property_id={id}` | ✅ | Use units endpoint with filter |

---

## Units

| Next.js Route | FastAPI v2 Endpoint | Status | Notes |
|--------------|---------------------|--------|-------|
| `GET /api/v1/units` | `GET /api/v2/units` | ✅ | Migrated |
| `POST /api/v1/units` | `POST /api/v2/units` | ✅ | Migrated |
| `GET /api/v1/units/{id}` | `GET /api/v2/units/{id}` | ✅ | Migrated |
| `PATCH /api/v1/units/{id}` | `PATCH /api/v2/units/{id}` | ✅ | Migrated |

---

## Landlords

| Next.js Route | FastAPI v2 Endpoint | Status | Notes |
|--------------|---------------------|--------|-------|
| `GET /api/v1/landlords` | `GET /api/v2/landlords` | ✅ | Migrated |
| `POST /api/v1/landlords` | `POST /api/v2/landlords` | ✅ | Migrated |
| `GET /api/v1/landlords/{id}` | `GET /api/v2/landlords/{id}` | ✅ | Migrated |
| `PATCH /api/v1/landlords/{id}` | `PATCH /api/v2/landlords/{id}` | ✅ | Migrated |

---

## Tenants

| Next.js Route | FastAPI v2 Endpoint | Status | Notes |
|--------------|---------------------|--------|-------|
| `GET /api/v1/tenants` | `GET /api/v2/tenants` | ✅ | Migrated |
| `POST /api/v1/tenants` | `POST /api/v2/tenants` | ✅ | Migrated |
| `GET /api/v1/tenants/{id}` | `GET /api/v2/tenants/{id}` | ✅ | Migrated |
| `PATCH /api/v1/tenants/{id}` | `PATCH /api/v2/tenants/{id}` | ✅ | Migrated |
| `POST /api/v1/tenants/{id}/approve` | `POST /api/v2/tenants/{id}/approve` | ✅ | Migrated |
| `POST /api/v1/tenants/{id}/reject` | `POST /api/v2/tenants/{id}/reject` | ✅ | Migrated |
| `GET /api/v1/tenants/{id}/rent-data` | `GET /api/v2/tenants/{id}/rent-data` | ✅ | Migrated |
| `GET /api/v1/tenants/with-outstanding-balance` | `GET /api/v2/tenants/with-outstanding-balance` | ❌ | Needs implementation |

---

## Leases

| Next.js Route | FastAPI v2 Endpoint | Status | Notes |
|--------------|---------------------|--------|-------|
| `GET /api/v1/leases` | `GET /api/v2/leases` | ✅ | Migrated |
| `POST /api/v1/leases` | `POST /api/v2/leases` | ✅ | Migrated |
| `GET /api/v1/leases/{id}` | `GET /api/v2/leases/{id}` | ✅ | Migrated |
| `PATCH /api/v1/leases/{id}` | `PATCH /api/v2/leases/{id}` | ✅ | Migrated |
| `POST /api/v1/leases/{id}/renew` | `POST /api/v2/leases/{id}/renew` | ✅ | Migrated |
| `POST /api/v1/leases/{id}/terminate` | `POST /api/v2/leases/{id}/terminate` | ✅ | Migrated |

---

## Work Orders (Maintenance)

| Next.js Route | FastAPI v2 Endpoint | Status | Notes |
|--------------|---------------------|--------|-------|
| `GET /api/v1/maintenance` | `GET /api/v2/work-orders` | ✅ | Migrated |
| `POST /api/v1/maintenance` | `POST /api/v2/work-orders` | ✅ | Migrated |
| `GET /api/v1/maintenance/{id}` | `GET /api/v2/work-orders/{id}` | ✅ | Migrated |
| `PATCH /api/v1/maintenance/{id}` | `PATCH /api/v2/work-orders/{id}` | ✅ | Migrated |
| `POST /api/v1/maintenance/{id}/add-comment` | `POST /api/v2/work-orders/{id}/comments` | ✅ | Migrated |
| `GET /api/v1/maintenance/{id}/comments` | `GET /api/v2/work-orders/{id}` (includes comments) | ✅ | Migrated |
| `POST /api/v1/maintenance/{id}/approve` | `POST /api/v2/work-orders/{id}/approve` | ✅ | Migrated |
| `POST /api/v1/maintenance/{id}/mark-viewed` | ❌ | ❌ | Not needed in v2 |
| `GET /api/v1/maintenance/{id}/download-pdf` | ❌ | ❌ | Needs implementation if required |

---

## Vendors

| Next.js Route | FastAPI v2 Endpoint | Status | Notes |
|--------------|---------------------|--------|-------|
| `GET /api/v1/vendors` | `GET /api/v2/vendors` | ✅ | Migrated |
| `POST /api/v1/vendors` | `POST /api/v2/vendors` | ✅ | Migrated |
| `GET /api/v1/vendors/{id}` | `GET /api/v2/vendors/{id}` | ✅ | Migrated |
| `PATCH /api/v1/vendors/{id}` | `PATCH /api/v2/vendors/{id}` | ✅ | Migrated |
| `GET /api/v1/vendors/search` | `GET /api/v2/vendors?search={query}` | ✅ | Migrated |
| `POST /api/v1/vendors/{id}/add-to-landlord` | ❌ | ❌ | May not be needed in v2 |
| `POST /api/v1/vendors/{id}/remove-from-landlord` | ❌ | ❌ | May not be needed in v2 |
| `GET /api/v1/vendors/{id}/usage-stats` | ❌ | ❌ | Needs implementation if required |

---

## Attachments

| Next.js Route | FastAPI v2 Endpoint | Status | Notes |
|--------------|---------------------|--------|-------|
| `GET /api/v1/documents` | `GET /api/v2/attachments?entity_type={type}&entity_id={id}` | ✅ | Migrated |
| `POST /api/v1/documents/upload` | `POST /api/v2/attachments` (multipart) | ✅ | Migrated |
| `GET /api/v1/documents/{id}/view` | `GET /api/v2/attachments/{id}/download` | ✅ | Migrated |
| `GET /api/v1/documents/{id}` | `GET /api/v2/attachments/{id}` | ✅ | Migrated |

---

## Notifications

| Next.js Route | FastAPI v2 Endpoint | Status | Notes |
|--------------|---------------------|--------|-------|
| `GET /api/v1/notifications` | `GET /api/v2/notifications` | ✅ | Migrated |
| `PATCH /api/v1/notifications/{id}` | `PATCH /api/v2/notifications/{id}/read` | ✅ | Migrated |
| `POST /api/v1/notifications/read-all` | `POST /api/v2/notifications/mark-all-read` | ✅ | Migrated |

---

## Search

| Next.js Route | FastAPI v2 Endpoint | Status | Notes |
|--------------|---------------------|--------|-------|
| `GET /api/v1/search` | `GET /api/v2/search?q={query}&type={type}` | ✅ | Migrated |

---

## Users & Roles

| Next.js Route | FastAPI v2 Endpoint | Status | Notes |
|--------------|---------------------|--------|-------|
| `GET /api/v2/users` | `GET /api/v2/users` | ✅ | Already migrated |
| `POST /api/v2/users` | `POST /api/v2/users` | ✅ | Already migrated |
| `GET /api/v2/users/{id}` | `GET /api/v2/users/{id}` | ✅ | Already migrated |
| `POST /api/v2/users/{id}/roles` | `POST /api/v2/users/{id}/roles` | ✅ | Already migrated |

---

## Audit Logs

| Next.js Route | FastAPI v2 Endpoint | Status | Notes |
|--------------|---------------------|--------|-------|
| `GET /api/v2/audit-logs` | `GET /api/v2/audit-logs` | ✅ | Already migrated |
| `GET /api/v2/audit-logs/{id}` | `GET /api/v2/audit-logs/{id}` | ✅ | Already migrated |

---

## Not Yet Migrated (Lower Priority)

### Documents (Legacy Document System)
- `GET /api/v1/documents` - Use attachments instead
- `POST /api/v1/documents` - Use attachments instead
- `GET /api/v1/documents/{id}/messages` - May need conversation system
- `POST /api/v1/documents/{id}/mutual-approve` - May need approval workflow
- `POST /api/v1/documents/{id}/promote-version` - May need versioning system

### Conversations/Messages
- `GET /api/v1/conversations` - ❌ Needs implementation
- `POST /api/v1/conversations` - ❌ Needs implementation
- `GET /api/v1/conversations/{id}/messages` - ❌ Needs implementation

### Applications
- `GET /api/v1/applications` - ❌ Needs implementation
- `POST /api/v1/applications` - ❌ Needs implementation
- `POST /api/v1/applications/{id}/approve` - ❌ Needs implementation
- `POST /api/v1/applications/{id}/reject` - ❌ Needs implementation

### Rent Payments
- `GET /api/v1/rent-payments` - ❌ Needs implementation (RentPayment model)
- `POST /api/v1/rent-payments` - ❌ Needs implementation
- `GET /api/v1/rent-payments/{id}` - ❌ Needs implementation

### Expenses
- `GET /api/v1/expenses` - ❌ Needs implementation
- `POST /api/v1/expenses` - ❌ Needs implementation

### Tasks
- `GET /api/v1/tasks` - ❌ Needs implementation (may map to work_orders)
- `POST /api/v1/tasks` - ❌ Needs implementation

### Inspections
- `GET /api/v1/inspections` - ❌ Needs implementation
- `POST /api/v1/inspections` - ❌ Needs implementation

### Analytics/Reports
- `GET /api/v1/analytics/dashboard` - ❌ Needs implementation
- `GET /api/v1/analytics/portfolio-performance` - ❌ Needs implementation
- `GET /api/v1/analytics/cash-flow-forecast` - ❌ Needs implementation
- `GET /api/v1/portfolio/summary` - ❌ Needs implementation

### Forms
- `POST /api/v1/forms/generate` - ❌ Needs implementation
- `GET /api/v1/generated-forms` - ❌ Needs implementation

### LTB Documents
- `GET /api/v1/ltb-documents` - ❌ Needs implementation (specialized)
- `GET /api/v1/ltb-documents/{formNumber}/view` - ❌ Needs implementation

### Invitations
- `GET /api/v1/invitations` - ❌ Needs implementation
- `POST /api/v1/invitations` - ❌ Needs implementation
- `POST /api/v1/invitations/{id}/resend` - ❌ Needs implementation

### Activity Logs
- `GET /api/v1/activity-logs` - ❌ Needs implementation (may use audit_logs)

---

## Admin Routes (Platform Admin)

These routes are for super_admin platform management and may remain in Next.js API or be migrated later:

- `/api/admin/organizations/*` - Organization management
- `/api/admin/users/*` - User management
- `/api/admin/invitations/*` - Invitation management
- `/api/admin/audit-logs/*` - Audit log viewing
- `/api/admin/analytics/*` - Platform analytics
- `/api/admin/support-tickets/*` - Support ticket management
- `/api/admin/data-export/*` - Data export
- `/api/admin/user-activity/*` - User activity tracking

---

## Migration Priority

### High Priority (Core Functionality) ✅ COMPLETE
- ✅ Authentication
- ✅ Organizations
- ✅ Properties, Units
- ✅ Landlords, Tenants
- ✅ Leases
- ✅ Work Orders
- ✅ Attachments
- ✅ Notifications
- ✅ Search
- ✅ Vendors

### Medium Priority (Important Features)
- 🔄 Rent Payments (needs RentPayment model)
- 🔄 Applications (tenant applications)
- 🔄 Conversations/Messages

### Low Priority (Specialized Features)
- ❌ Analytics/Reports
- ❌ Forms generation
- ❌ LTB Documents
- ❌ Inspections
- ❌ Expenses
- ❌ Tasks (may map to work_orders)

---

## Next Steps

1. ✅ Complete v2 database schema - DONE
2. ✅ Implement core FastAPI routers - DONE
3. 🔄 Migrate remaining Next.js routes to FastAPI
4. ✅ Update frontend to use FastAPI only - IN PROGRESS
5. 🗑️ Remove Next.js API route files - PENDING

---

## Notes

- All v2 endpoints use UUID primary keys
- All v2 endpoints are scoped by organization_id for multi-tenancy
- Role-based access control is enforced via `require_role_v2` dependency
- Frontend should use `v2Api` client from `@/lib/api/v2-client`
- Frontend should use React Query hooks from `@/lib/hooks/useV2Data`
