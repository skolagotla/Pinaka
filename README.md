# Pinaka - Property Management Platform

A modern, full-stack property management platform built with Next.js, Flowbite UI, FastAPI, and PostgreSQL.

**Status**: ✅ **100% V2 Compliant** - All active runtime code uses v2 architecture.

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [V2 Migration](#v2-migration)
5. [Backend Documentation](#backend-documentation)
6. [Frontend Documentation](#frontend-documentation)
7. [Development Guides](#development-guides)
8. [Troubleshooting](#troubleshooting)
9. [Known Issues](#known-issues)
10. [Testing](#testing)
11. [License](#license)

---

## Overview

Pinaka is a comprehensive property management system designed for Property Management Companies (PMCs), landlords, tenants, and vendors. It provides end-to-end functionality for managing properties, leases, maintenance, financials, and more.

### Tech Stack

- **Frontend**: Next.js 16 + React + Flowbite UI
- **Backend**: FastAPI + SQLAlchemy (async)
- **Database**: PostgreSQL v2
- **Authentication**: JWT-based with role-based access control (RBAC)
- **Monorepo**: pnpm workspaces
- **Types**: OpenAPI-generated TypeScript types
- **State Management**: React Query

### Key Features

- **Property Management**: Properties, units, leases
- **Tenant Management**: Applications, approvals, rent payments
- **Maintenance**: Work orders, vendor assignments, tracking
- **Financials**: Rent collection, expenses, reporting
- **Documents**: Document storage, forms, signatures
- **Communications**: Messaging, notifications
- **Analytics**: Dashboards, reports, insights

---

## Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Python** >= 3.9
- **PostgreSQL** >= 14

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and API keys
```

### Database Setup

```bash
# Run migrations
cd apps/backend-api
alembic upgrade head

# Seed initial data (optional)
python scripts/seed_v2.py
```

### Development

```bash
# Start backend (FastAPI) - http://localhost:8000
cd apps/backend-api
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Start frontend (Next.js) - http://localhost:3000
pnpm dev
```

### Test Credentials

- **Super Admin**: superadmin@pinaka.com / SuperAdmin123!
- **PMC Admin**: pmcadmin@pinaka.com / PmcAdmin123!
- **Landlord**: landlord@pinaka.com / Landlord123!
- **Tenant**: tenant@pinaka.com / Tenant123!

### Generate TypeScript Types

```bash
# Make sure FastAPI server is running
# Then generate types from OpenAPI spec
pnpm run generate:types
```

This fetches the OpenAPI spec from `http://localhost:8000/openapi.json` and generates TypeScript types to `packages/shared-types/v2-api.d.ts`.

---

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   Next.js App   │  (apps/web-app)
│   Flowbite UI   │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│   FastAPI API   │  (apps/backend-api)
│   SQLAlchemy    │
└────────┬────────┘
         │
┌────────▼────────┐
│   PostgreSQL   │  (v2 Database)
└─────────────────┘
```

### Monorepo Structure

```
Pinaka/
├── apps/
│   ├── web-app/              # Next.js frontend application
│   │   ├── app/              # Next.js App Router pages
│   │   ├── components/       # React components
│   │   └── lib/              # Frontend utilities, hooks, API clients
│   │
│   └── backend-api/          # FastAPI backend application
│       ├── routers/          # API route handlers (22 routers)
│       ├── schemas/          # Pydantic schemas
│       ├── db/               # SQLAlchemy models
│       ├── core/             # Core utilities (auth, database, CRUD helpers)
│       └── services/         # Business logic services
│
├── packages/                 # Shared packages
│   ├── api-client/           # Generated API client
│   ├── shared-types/         # OpenAPI-generated TypeScript types
│   ├── shared-utils/         # Shared utilities
│   └── ui/                   # Shared UI components
│
├── infra/                    # Infrastructure
│   ├── db/                   # Database migrations (Alembic)
│   └── backups/              # Database backups
│
├── scripts/                  # Utility scripts
└── ci/                      # CI/CD configuration
```

### Design Principles

#### 1. Domain-Driven Design (DDD)
- Business logic organized by domain (properties, tenants, leases, etc.)
- Domain services encapsulate business rules
- Clear separation between domain, application, and infrastructure layers

#### 2. API-First
- FastAPI backend with OpenAPI/Swagger documentation
- Consistent RESTful API patterns
- Type-safe API clients generated from schemas
- All endpoints use `/api/v2` prefix

#### 3. Shared Schema (Single Source of Truth)
- All API schemas defined in FastAPI (Pydantic)
- TypeScript types generated from OpenAPI spec
- Runtime validation on both frontend and backend
- No duplicate schema definitions

### Database Schema (v2)

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

### Role-Based Access Control (RBAC)

Pinaka supports multiple user roles:

- **SUPER_ADMIN**: Full system access, can see all organizations
- **PMC_ADMIN**: PMC organization management
- **PM**: Property Manager (manages properties and tenants)
- **LANDLORD**: Property owner
- **TENANT**: Lease holder
- **VENDOR**: Service provider
- **CONTRACTOR**: Maintenance contractor

**Access Control:**
- **Organization-scoped**: Users only see data from their organization
- **Role-based filtering**: Backend filters data based on user role
- **Resource-level permissions**: Fine-grained permissions for specific actions

---

## V2 Migration

### Status: ✅ 100% Complete

The Pinaka monorepo has been fully migrated to a **100% v2-compliant architecture**. All v1 code, Prisma runtime usage, and legacy Next.js API routes have been removed from active runtime code paths.

### V2 Stack

```
✅ Frontend: Next.js 16 + React + Flowbite UI
✅ Backend: FastAPI + SQLAlchemy (async) + PostgreSQL v2
✅ Types: OpenAPI-generated TypeScript types
✅ API Client: Typed client using openapi-fetch
✅ RBAC: Fully implemented on backend and frontend
✅ State Management: React Query for all data fetching
✅ No Legacy Code: All V1 code removed
```

### Migration History

#### Phase 1: Database Schema ✅ COMPLETE
- ✅ All v2 tables created (17+ tables)
- ✅ Migrations completed via Alembic
- ✅ Indexes added for performance
- ✅ Foreign keys and constraints defined

#### Phase 2: FastAPI Backend ✅ COMPLETE
- ✅ Created SQLAlchemy models (`db/models_v2.py`)
- ✅ Created Pydantic schemas for validation
- ✅ Implemented JWT authentication with RBAC
- ✅ Created 22 API routers with full CRUD operations
- ✅ Added pagination to all list endpoints
- ✅ Implemented N+1 query optimization
- ✅ Added database indexes

#### Phase 3: OpenAPI Type Generation ✅ COMPLETE
- ✅ FastAPI generates `/openapi.json`
- ✅ TypeScript types generated from OpenAPI spec
- ✅ Types stored in `packages/shared-types/v2-api.d.ts`
- ✅ All frontend components use generated types
- ✅ Removed legacy Zod schemas for domain models

#### Phase 4: Frontend Migration ✅ COMPLETE
- ✅ Created typed API client (`v2-client.ts`)
- ✅ Created React hooks (`useV2Auth`, `useV2Data`, `useUnifiedCRUD`)
- ✅ Migrated all components to Flowbite UI
- ✅ Replaced all `/api/v1/*` calls with `/api/v2/*`
- ✅ Removed all Prisma runtime usage
- ✅ Removed all Next.js API routes

#### Phase 5: Cleanup ✅ COMPLETE
- ✅ Removed `apps/api-server/` (legacy Next.js API server)
- ✅ Removed `@pinaka/schemas` package
- ✅ Removed Prisma runtime usage
- ✅ Removed v1 API client usage
- ✅ Updated all backend routes to `/api/v2`
- ✅ Consolidated documentation

### Backend Routers (22 Total)

All routers use v2 models, RBAC, and `/api/v2` prefix:

1. ✅ `auth_v2` - Authentication
2. ✅ `organizations` - Organization management
3. ✅ `properties` - Property CRUD
4. ✅ `units` - Unit CRUD
5. ✅ `tenants` - Tenant CRUD
6. ✅ `landlords` - Landlord CRUD
7. ✅ `vendors_v2` - Vendor CRUD
8. ✅ `leases` - Lease CRUD
9. ✅ `lease_tenants` - Lease-tenant relationships
10. ✅ `work_orders` - Work order management
11. ✅ `attachments` - File upload/download
12. ✅ `notifications` - User notifications
13. ✅ `conversations` - Messaging
14. ✅ `tasks` - Task management
15. ✅ `invitations` - User invitations
16. ✅ `forms` - Form management
17. ✅ `rent_payments` - Rent payment tracking
18. ✅ `expenses` - Expense management
19. ✅ `inspections` - Property inspections
20. ✅ `audit_logs` - Audit trail
21. ✅ `rbac` - Role and permission management
22. ✅ `search` - Search functionality

### Compliance Status

✅ **100% V2 Compliant for Active Runtime Code**

- **Backend**: ✅ 100% FastAPI v2 (22 routers, all use v2 models)
- **Frontend**: ✅ 100% V2 (Flowbite UI, React Query, v2 API client)
- **Database**: ✅ 100% v2 Schema (PostgreSQL v2)
- **Types**: ✅ 100% OpenAPI Generated (no Zod domain schemas)
- **RBAC**: ✅ 100% Enforced (backend and frontend)

### Files Removed

- ✅ `apps/api-server/` (entire directory) - Legacy Next.js API server
- ✅ `@pinaka/schemas` package - Legacy Zod schemas
- ✅ All Prisma runtime usage removed

### Remaining Technical Debt (Non-Blocking)

1. **Services Migration** (Low Priority)
   - Location: `apps/web-app/lib/services/*`
   - Status: Services still reference Prisma
   - Impact: Server-side only, not used in frontend
   - Action: Migrate to `serverV2Api` (see `lib/services/README.md`)

2. **Legacy Files** (No Impact)
   - `lib/api/v1-client*.ts` - Not imported, can be removed
   - `apps/backend-api/routers/auth.py` - Not registered, can be removed
   - `apps/backend-api/routers/vendors.py` - Not registered, can be removed

---

## Backend Documentation

### FastAPI Backend Structure

```
apps/backend-api/
├── main.py              # FastAPI app entry point
├── routers/             # API route handlers (22 routers)
│   ├── auth_v2.py
│   ├── organizations.py
│   ├── properties.py
│   ├── work_orders.py
│   └── ...
├── schemas/             # Pydantic schemas
├── db/                  # SQLAlchemy models
│   └── models_v2.py
├── core/                # Core utilities
│   ├── database.py      # Database connection
│   ├── auth_v2.py       # Authentication
│   └── crud_helpers.py  # Shared CRUD utilities
└── services/            # Business logic services
```

### Running the Backend

```bash
# Development
cd apps/backend-api
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or from root
pnpm dev:backend
```

### API Endpoints

All v2 API endpoints are prefixed with `/api/v2/`:

**Base URL:** `http://localhost:8000/api/v2`

**Authentication:**
- `POST /auth/login` - Login with email/password
- `GET /auth/me` - Get current user with roles

**Properties:**
- `GET /properties` - List properties (scoped by organization)
- `POST /properties` - Create property
- `GET /properties/{id}` - Get property details
- `PATCH /properties/{id}` - Update property
- `DELETE /properties/{id}` - Delete property

**Work Orders:**
- `GET /work-orders` - List work orders (with filters)
- `POST /work-orders` - Create work order
- `GET /work-orders/{id}` - Get work order with comments
- `PATCH /work-orders/{id}` - Update work order
- `DELETE /work-orders/{id}` - Delete work order
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
- All protected routes use `require_role_v2` or `get_current_user_v2`
- Organization-scoped data access enforced
- Role-based filtering on all queries

**Example:**
```python
from core.auth_v2 import require_role_v2, RoleEnum

@router.get("/example")
async def example_endpoint(
    current_user: User = Depends(require_role_v2([RoleEnum.PM, RoleEnum.LANDLORD]))
):
    # current_user is available here
    pass
```

### Database

**Models:**
All models are in `db/models_v2.py` using SQLAlchemy async:

```python
from db.models_v2 import Property, Tenant, Lease

# Query example
result = await db.execute(select(Property))
properties = result.scalars().all()
```

**Migrations:**
Alembic is used for database migrations:

```bash
# Create migration
cd apps/backend-api
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Environment Variables

**Backend** (`apps/backend-api/.env`):
```bash
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/pinaka
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### API Documentation

FastAPI automatically generates OpenAPI/Swagger docs:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

---

## Frontend Documentation

### Next.js Frontend Structure

```
apps/web-app/
├── app/                  # Next.js App Router pages
│   ├── portfolio/        # Portfolio dashboard
│   ├── properties/       # Properties pages
│   ├── tenants/          # Tenants pages
│   ├── leases/           # Leases pages
│   └── ...
├── components/           # React components
│   ├── shared/           # Shared components
│   ├── pages/            # Page-specific components
│   └── ...
└── lib/                  # Frontend utilities
    ├── api/              # API clients
    │   ├── v2-client.ts  # Typed API client
    │   └── v2-server-client.ts  # Server-side client
    ├── hooks/            # React hooks
    │   ├── useV2Auth.ts  # Authentication hook
    │   ├── useV2Data.ts  # Data fetching hooks
    │   └── useUnifiedCRUD.ts  # Unified CRUD hook
    └── rbac/             # RBAC utilities
        └── v2-client.ts  # RBAC client
```

### Running the Frontend

```bash
# Development
cd apps/web-app
pnpm dev

# Or from root
pnpm dev
```

Frontend runs on http://localhost:3000

### UI Components

**Flowbite Components:**
All UI uses Flowbite React components:

```jsx
import { Button, Card, Table, Modal } from 'flowbite-react';

<Button color="blue">Click me</Button>
<Card>Content</Card>
```

**Shared Components:**
Reusable components in `components/shared/`:
- `PageHeader` - Consistent page headers
- `StatCard` - Metric cards
- `LoadingSkeleton` - Loading states
- `EmptyState` - Empty state displays
- `StandardModal` - Modal wrapper
- `FlowbiteTable` - Table component

### Data Fetching

**React Query Hooks:**
All data fetching uses React Query hooks from `lib/hooks/useV2Data.ts`:

```jsx
import { useProperties, useCreateProperty } from '@/lib/hooks/useV2Data';

function MyComponent() {
  const { data: properties, isLoading } = useProperties(organizationId);
  const createProperty = useCreateProperty();
  
  // ...
}
```

**API Client:**
Type-safe API client in `lib/api/v2-client.ts`:

```jsx
import { v2Api } from '@/lib/api/v2-client';

const properties = await v2Api.listProperties(organizationId);
```

**Unified CRUD Hook:**
```jsx
import { useUnifiedCRUD } from '@/lib/hooks/useUnifiedCRUD';

function PropertiesList() {
  const { data, create, update, remove, isLoading } = useUnifiedCRUD({
    entityName: 'properties',
    apiEndpoint: '/api/v2/properties',
  });
  
  // Use data, create, update, remove...
}
```

### Authentication

Use the `useV2Auth` hook:

```jsx
import { useV2Auth } from '@/lib/hooks/useV2Auth';

function MyComponent() {
  const { user, loading, login, logout } = useV2Auth();
  
  if (loading) return <Spinner />;
  if (!user) return <LoginForm />;
  
  return <div>Welcome, {user.email}</div>;
}
```

### RBAC

```jsx
import { usePermission } from '@/lib/rbac/v2-client';

function CreatePropertyButton() {
  const { has_permission } = usePermission({
    resource: 'properties',
    action: 'CREATE',
  });
  
  if (!has_permission) return null;
  return <button>Create Property</button>;
}
```

### TypeScript Types

```typescript
import type { components } from '@pinaka/shared-types/v2-api';

type Property = components['schemas']['Property'];
type PropertyCreate = components['schemas']['PropertyCreate'];
type WorkOrder = components['schemas']['WorkOrder'];
```

### Environment Variables

**Frontend** (`apps/web-app/.env.local`):
```bash
NEXT_PUBLIC_API_V2_BASE_URL=http://localhost:8000/api/v2
```

### Build & Deploy

```bash
# Build
cd apps/web-app
pnpm build

# Start production server
pnpm start
```

---

## Development Guides

### Adding a New Feature

1. **Define Schema**: Add Pydantic schemas in `apps/backend-api/schemas/`
2. **Backend**: Create router in `apps/backend-api/routers/`
3. **Frontend**: Create components in `apps/web-app/components/`
4. **Types**: Regenerate types with `pnpm generate:types`
5. **API Client**: Use `v2Api` or React Query hooks

### Code Style

- **Frontend**: TypeScript/JavaScript with Flowbite UI components
- **Backend**: Python with type hints, FastAPI conventions
- **Formatting**: Prettier (frontend), Black (backend)

### OpenAPI Type Generation

The OpenAPI type generation pipeline:

1. **FastAPI generates OpenAPI spec** at `/openapi.json`
2. **TypeScript types generated** using `openapi-typescript`
3. **Types stored** in `packages/shared-types/v2-api.d.ts`
4. **Typed API client** uses `openapi-fetch`

**Generate Types:**
```bash
# 1. Start FastAPI
cd apps/backend-api
uvicorn main:app --reload

# 2. Generate types (in another terminal)
pnpm generate:types
```

**Use Types:**
```typescript
import type { components } from "@pinaka/shared-types/v2-api";
type Property = components["schemas"]["Property"];
```

### File Storage

**Current Implementation:**
- Files stored locally: `uploads/{organization_id}/{entity_type}/{entity_id}/{filename}`
- Storage key stored in database: relative path from `uploads/`

**S3 Migration Path:**
- Change storage backend to use S3
- Storage key format remains the same
- No database schema changes needed

### Performance Optimizations

**Backend:**
- Eager loading with `selectinload` for related entities
- Pagination on all list endpoints
- Database indexes for common queries
- Query optimization to reduce N+1 queries

**Frontend:**
- React Query caching with `staleTime` and `gcTime`
- Code splitting with dynamic imports
- Optimistic updates for immediate UI feedback
- Request deduplication to prevent duplicate API calls

---

## Troubleshooting

### Build Issues

**TypeScript Syntax in .jsx Files:**
- Remove TypeScript type annotations (`: any`, `: string`, `as Type`) from `.jsx` files
- Use optional chaining (`?.`) for safe property access

**Module Resolution:**
- Ensure all imports use correct paths
- Check `tsconfig.json` and `jsconfig.json` for path mappings
- Verify package dependencies are installed

**FastAPI Types Generation Fails:**
- Make sure FastAPI server is running: `uvicorn main:app --reload`
- Check that `/openapi.json` endpoint is accessible
- Verify `openapi-typescript` is installed

### Dependency Issues

**Version Conflicts:**
- Use `pnpm` for consistent dependency resolution
- Check `package.json` and `pnpm-lock.yaml` for conflicts
- Clear cache: `pnpm store prune`

**Python Dependencies:**
- Use virtual environment: `python -m venv venv`
- Activate: `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows)
- Install: `pip install -r requirements.txt`

### Database Issues

**Migration Errors:**
- Check database connection string in `.env`
- Verify PostgreSQL is running
- Review migration files in `alembic/versions/`

**Connection Issues:**
- Verify `DATABASE_URL` format: `postgresql+asyncpg://user:password@host:port/dbname`
- Check PostgreSQL is accessible
- Verify user permissions

---

## Known Issues

### Next.js 14.2.18 ErrorBoundary SSR Bug

**Issue**: `TypeError: Cannot read properties of null (reading 'useContext')`

**Location**: Next.js internal ErrorBoundary component during SSR

**Cause**: Next.js 14.2.18's ErrorBoundary tries to use `usePathname` hook during server-side rendering, but the React context is null during SSR.

**Impact**:
- **Development Mode**: Shows error overlay, but app functionality is not affected
- **Production Mode**: Does NOT occur (production builds don't have this issue)

**Workaround**: The error is caught by our custom error handler (`app/error.jsx`) which shows a friendly message and allows the user to continue. The app will function normally after clicking "Try again".

**Why We're Using Next.js 14.2.18**:
- Next.js 14.2.25+ requires `React.cache` (React 19 feature)
- We're on React 18.3.1 (stable, compatible with all dependencies)
- Next.js 14.2.18 is the last stable version that works with React 18.3.1

**Status**: ✅ **Workaround in place** - Error is handled gracefully

**Future Resolution**: This bug is fixed in Next.js 14.2.25+, but that version requires React 19. When we're ready to upgrade to React 19, we can upgrade Next.js as well.

---

## Testing

### Backend Tests

```bash
# Run tests
cd apps/backend-api
pytest

# With coverage
pytest --cov=.
```

### Frontend Tests

```bash
# Run tests (when available)
cd apps/web-app
pnpm test
```

### Manual Testing

**Test Credentials:**
- **Super Admin**: superadmin@pinaka.com / SuperAdmin123!
- **PMC Admin**: pmcadmin@pinaka.com / PmcAdmin123!
- **Landlord**: landlord@pinaka.com / Landlord123!
- **Tenant**: tenant@pinaka.com / Tenant123!

**Test Flows:**
1. Login with different roles
2. Verify RBAC enforcement
3. Test CRUD operations for each entity
4. Verify organization scoping
5. Test file uploads/downloads
6. Verify notifications

---

## License

ISC

---

## Contributing

1. Follow the architecture principles (DDD, API-First, Shared Schema)
2. Use TypeScript/Python type hints
3. Write tests for new features
4. Update documentation

---

**Built with ❤️ using modern web technologies and best practices**

**Last Updated**: 2025-11-24  
**Status**: ✅ 100% V2 Compliant
