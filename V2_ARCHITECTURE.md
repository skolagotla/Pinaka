# V2 Architecture Implementation

## Overview

This document describes the v2 architecture implementation for the Pinaka Property Management Platform. The v2 architecture introduces a clean, additive database schema and a FastAPI backend while maintaining backward compatibility with the existing Next.js API and Prisma schema.

## Key Principles

1. **Additive Only**: No modifications to existing tables or columns
2. **Backward Compatible**: Existing Next.js API routes continue to work
3. **Gradual Migration**: Features can be migrated incrementally
4. **S3-Ready Attachments**: Local storage now, easy S3 migration later

## Database Schema (v2)

### New Tables

All v2 tables use:
- UUID primary keys
- snake_case naming
- Proper foreign keys and indexes
- Timestamps with timezone

**Core Tables:**
- `organizations` - Multi-tenant organization support
- `users` - Unified user model
- `roles` - Role definitions
- `user_roles` - User-role assignments with organization scoping

**Entity Tables:**
- `landlords` - Property owners
- `tenants` - Renters
- `vendors` - Service providers
- `properties` - Real estate properties
- `units` - Individual units within properties
- `leases` - Rental agreements
- `lease_tenants` - Many-to-many lease-tenant relationship

**Work Order Tables:**
- `work_orders` - Maintenance requests
- `work_order_assignments` - Vendor assignments
- `work_order_comments` - Discussion threads

**Supporting Tables:**
- `attachments` - Generic file attachments (S3-ready)
- `notifications` - User notifications
- `audit_logs` - Action audit trail

### Migration

Migrations are managed via Alembic:

```bash
cd apps/backend-api
alembic upgrade head
```

Migration file: `apps/backend-api/alembic/versions/001_create_v2_schema.py`

## FastAPI Backend

### Structure

```
apps/backend-api/
├── main.py                 # FastAPI app entry point
├── core/                   # Core configuration
│   ├── config.py          # Settings
│   ├── database.py        # Async SQLAlchemy setup
│   ├── auth.py            # Legacy auth (v1)
│   └── auth_v2.py          # V2 auth with role checking
├── db/                     # Database models
│   ├── models.py          # Legacy models
│   └── models_v2.py       # V2 models
├── schemas/                # Pydantic schemas
│   ├── organization.py
│   ├── user.py
│   ├── role.py
│   ├── property.py
│   ├── work_order.py
│   └── attachment.py
├── routers/                # API routes
│   ├── auth_v2.py         # V2 authentication
│   ├── organizations.py   # Organization management
│   ├── properties.py      # Property CRUD
│   ├── work_orders.py     # Work order management
│   └── attachments.py     # File upload/download
└── scripts/
    └── seed_v2.py         # Test data seeding
```

### API Endpoints

**Base URL:** `http://localhost:8000/api/v2`

**Authentication:**
- `POST /auth/login` - Login with email/password
- `GET /auth/me` - Get current user with roles

**Organizations:**
- `GET /organizations` - List organizations (super_admin sees all)
- `POST /organizations` - Create organization (super_admin only)
- `GET /organizations/{id}` - Get organization details

**Properties:**
- `GET /properties` - List properties (scoped by organization)
- `POST /properties` - Create property
- `GET /properties/{id}` - Get property details

**Work Orders:**
- `GET /work-orders` - List work orders (with filters)
- `POST /work-orders` - Create work order
- `GET /work-orders/{id}` - Get work order with comments
- `PATCH /work-orders/{id}` - Update work order
- `POST /work-orders/{id}/comments` - Add comment

**Attachments:**
- `GET /attachments?entity_type={type}&entity_id={id}` - List attachments
- `POST /attachments?entity_type={type}&entity_id={id}` - Upload file
- `GET /attachments/{id}/download` - Download file
- `DELETE /attachments/{id}` - Delete attachment

### Authentication & Authorization

**JWT Tokens:**
- Tokens include: `sub` (user_id), `email`, `roles[]`, `organization_id`
- Stored in localStorage (frontend) or httpOnly cookies (production)

**Role-Based Access Control:**
- `super_admin` - Platform-wide access, can see all organizations
- `pmc_admin` - PMC-level access
- `pm` - Property manager access
- `landlord` - Property owner access
- `tenant` - Tenant access (scoped to their data)
- `vendor` - Vendor access (scoped to assigned work orders)

**Organization Scoping:**
- Non-super_admin users are scoped to their `organization_id`
- All queries automatically filter by organization
- Super admins can optionally filter by organization_id

### File Storage

**Current Implementation:**
- Files stored locally: `uploads/{organization_id}/{entity_type}/{entity_id}/{filename}`
- Storage key stored in database: relative path from `uploads/`

**S3 Migration Path:**
- Change storage backend to use S3
- Storage key format remains the same
- No database schema changes needed

## Frontend Integration

### API Client

Location: `lib/api/v2-client.ts`

```typescript
import { v2Api } from '@/lib/api/v2-client';

// Login
await v2Api.login(email, password);

// Get current user
const user = await v2Api.getCurrentUser();

// List work orders
const workOrders = await v2Api.listWorkOrders({ organization_id: orgId });
```

### React Hooks

**Authentication:**
- `useV2Auth()` - Login, logout, current user, role checking

**Data Fetching:**
- `useWorkOrders(filters)` - List work orders
- `useWorkOrder(id)` - Get single work order
- `useCreateWorkOrder()` - Create mutation
- `useAddWorkOrderComment()` - Add comment mutation
- `useAttachments(entityType, entityId)` - List attachments
- `useUploadAttachment()` - Upload mutation

Location: `apps/web-app/lib/hooks/useV2Auth.ts` and `useV2Data.ts`

### Sample Page

Location: `apps/web-app/app/work-orders-v2/page.jsx`

Demonstrates:
- Authentication check
- Data fetching with React Query
- Work order listing
- Comment creation
- Error handling

## Environment Variables

**Backend (.env):**
```bash
DATABASE_URL=postgresql+asyncpg://user@localhost:5432/PT?schema=public
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_API_V2_BASE_URL=http://localhost:8000/api/v2
```

## Development Workflow

### 1. Start Backend

```bash
cd apps/backend-api
source venv/bin/activate  # or activate your virtual environment
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Run Migrations

```bash
cd apps/backend-api
alembic upgrade head
```

### 3. Seed Test Data

```bash
cd apps/backend-api
python scripts/seed_v2.py
```

### 4. Start Frontend

```bash
pnpm dev
```

### 5. Access

- FastAPI Docs: http://localhost:8000/docs
- Work Orders Page: http://localhost:3000/work-orders-v2

## Testing

### Backend

```bash
cd apps/backend-api
pytest
```

### Frontend

The sample page (`/work-orders-v2`) can be used for manual testing.

## Migration Strategy

1. **Phase 1 (Current)**: V2 schema and FastAPI backend exist alongside legacy system
2. **Phase 2**: Migrate specific features to v2 (e.g., work orders)
3. **Phase 3**: Gradually migrate all features
4. **Phase 4**: Deprecate legacy API routes

## Next Steps

1. Add more CRUD endpoints (units, leases, landlords, tenants, vendors)
2. Implement notifications system
3. Add audit logging for all mutations
4. Migrate S3 storage for attachments
5. Add comprehensive test coverage
6. Create migration scripts for existing data

## Notes

- All v2 tables are additive - no existing tables are modified
- Legacy Next.js API routes continue to work unchanged
- Both systems can coexist during migration period
- V2 uses UUIDs, legacy uses string IDs (CUIDs)
- Role system is unified across both systems

