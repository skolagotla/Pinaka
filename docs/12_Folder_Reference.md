# Pinaka v2 - Folder Reference

## Dependency Graphs

For detailed dependency analysis, see:
- **[Backend Dependencies](../diagrams/dependency-backend.md)** - Complete backend dependency structure
- **[Frontend Dependencies](../diagrams/dependency-frontend.md)** - Complete frontend dependency structure
- **[Cross-Cutting Concerns](../diagrams/dependency-cross-cutting.md)** - Auth, RBAC, and organization scoping dependencies

## Monorepo Structure

```
Pinaka/
├── apps/                    # Applications
│   ├── backend-api/         # FastAPI backend
│   └── web-app/             # Next.js frontend
├── packages/                # Shared packages
│   ├── api-client/          # Generated API client
│   ├── shared-types/        # OpenAPI-generated types
│   ├── shared-utils/        # Shared utilities
│   └── ui/                  # Shared UI components
├── domains/                 # Domain-driven design modules
├── infra/                   # Infrastructure
│   ├── db/                  # Database migrations
│   └── backups/             # Database backups
├── scripts/                 # Utility scripts
├── ci/                      # CI/CD configuration
└── docs/                    # Documentation
```

## Backend Structure

### apps/backend-api/

```
backend-api/
├── main.py                  # FastAPI app entry point
├── routers/                 # API route handlers (25+ routers)
│   ├── auth_v2.py          # Authentication
│   ├── properties.py       # Properties CRUD
│   ├── tenants.py          # Tenants CRUD
│   ├── leases.py           # Leases CRUD
│   ├── work_orders.py      # Work orders CRUD
│   └── ...
├── schemas/                 # Pydantic schemas
│   ├── property.py
│   ├── tenant.py
│   └── ...
├── db/                      # Database models
│   └── models_v2.py        # SQLAlchemy models
├── core/                    # Core utilities
│   ├── database.py         # Database connection
│   ├── auth_v2.py         # Authentication
│   ├── rbac.py             # RBAC system
│   └── crud_helpers.py     # Shared CRUD utilities
├── services/                # Business logic services
├── alembic/                 # Database migrations
│   └── versions/           # Migration files
└── scripts/                 # Utility scripts
```

### Key Backend Files

- **main.py**: FastAPI application setup, router registration
- **core/rbac.py**: Central RBAC permission checking
- **core/auth_v2.py**: JWT authentication and user management
- **db/models_v2.py**: All SQLAlchemy models (25+ models)
- **routers/**: API endpoints organized by domain

## Frontend Structure

### apps/web-app/

```
web-app/
├── app/                     # Next.js App Router
│   ├── (protected)/        # Protected routes
│   │   ├── portfolio/      # Portfolio module
│   │   └── platform/       # Platform (super_admin)
│   ├── auth/               # Authentication
│   │   └── login/
│   ├── onboarding/         # Onboarding flows
│   └── layout.jsx          # Root layout
├── components/             # React components
│   ├── layout/            # Layout components
│   │   ├── UnifiedSidebar.tsx
│   │   ├── UnifiedNavbar.tsx
│   │   └── ProtectedLayoutWrapper.tsx
│   ├── pages/             # Page-specific components
│   │   └── shared/Portfolio/
│   ├── shared/            # Shared components
│   │   ├── FlowbiteTable.tsx
│   │   ├── PageHeader.tsx
│   │   └── ...
│   └── tour/              # Guided tour components
├── lib/                   # Frontend utilities
│   ├── api/               # API clients
│   │   ├── v2-client.ts   # Typed API client
│   │   └── admin-api.ts   # Admin API client
│   ├── hooks/             # React hooks
│   │   ├── useV2Auth.ts  # Authentication hook
│   │   ├── useV2Data.ts  # Data fetching hooks
│   │   ├── useRolePermissions.ts  # RBAC hook
│   │   └── ...
│   ├── rbac/              # RBAC utilities
│   │   ├── rbacConfig.ts  # Frontend RBAC config
│   │   └── permissions_v2.ts  # Permission checking
│   └── utils/             # Utility functions
└── public/                # Static assets
```

### Key Frontend Files

- **app/layout.jsx**: Root layout with providers
- **components/layout/ProtectedLayoutWrapper.tsx**: Protected route wrapper
- **lib/api/v2-client.ts**: Typed API client
- **lib/hooks/useV2Data.ts**: React Query hooks
- **lib/rbac/rbacConfig.ts**: Frontend RBAC configuration

## Shared Packages

### packages/shared-types/

**Purpose**: OpenAPI-generated TypeScript types

**Files**:
- `v2-api.d.ts`: Generated TypeScript types from OpenAPI spec

**Usage**:
```typescript
import type { components } from '@pinaka/shared-types/v2-api';
type Property = components['schemas']['Property'];
```

### packages/api-client/

**Purpose**: Generated API client from OpenAPI spec

**Files**:
- `src/api-client.ts`: Typed API client
- `src/generated-client.ts`: Generated client code

### packages/shared-utils/

**Purpose**: Shared utility functions

**Files**:
- `src/date-utils.ts`: Date formatting utilities
- `src/format-utils.ts`: Formatting utilities
- `src/validation-utils.ts`: Validation utilities

### packages/ui/

**Purpose**: Shared UI components

**Files**:
- `src/index.ts`: Shared component exports

## Domain Modules

### domains/

**Purpose**: Domain-Driven Design modules

**Structure**:
```
domains/{domain}/
├── domain/
│   ├── {Entity}Repository.ts    # Repository interface
│   ├── {Entity}Service.ts       # Domain service
│   └── index.ts
```

**Domains**:
- `property/`, `unit/`, `tenant/`, `lease/`
- `landlord/`, `vendor/`, `work-order/`
- `organization/`, `user/`, `notification/`

## Infrastructure

### infra/db/

**Purpose**: Database migrations and scripts

**Files**:
- `migrations/`: Alembic migration files

### infra/backups/

**Purpose**: Database backups

**Files**:
- SQL dump files
- Backup scripts

## Scripts

### scripts/

**Purpose**: Utility scripts for development

**Common Scripts**:
- `generate-openapi-types.sh`: Generate TypeScript types
- `seed_v2.py`: Seed test data
- `cleanup-temp-files.sh`: Clean temporary files

## CI/CD

### ci/

**Purpose**: CI/CD configuration

**Files**:
- `schema-validation.yml`: Schema validation
- `codemods/`: Code transformation scripts
- `husky/pre-commit`: Git hooks

## Documentation

### docs/

**Purpose**: Project documentation

**Files**:
- `00_Overview.md`: Project overview
- `01_Architecture.md`: System architecture
- `02_Backend_API.md`: API documentation
- `03_Frontend_Structure.md`: Frontend organization
- `04_Database_v2_Schema.md`: Database schema
- `05_RBAC_Roles_and_Permissions.md`: RBAC documentation
- `06_Domain_Models.md`: Domain models
- `07_Portfolio_Module.md`: Portfolio module
- `08_Onboarding_Flow.md`: Onboarding flows
- `09_Authentication_and_Sessions.md`: Auth documentation
- `10_Development_Guide.md`: Development guide
- `11_Deployment_Guide.md`: Deployment guide
- `12_Folder_Reference.md`: This file
- `13_Glossary.md`: Terms and definitions

## File Naming Conventions

### Backend

- **Routers**: `{entity}.py` (e.g., `properties.py`)
- **Schemas**: `{entity}.py` (e.g., `property.py`)
- **Models**: `models_v2.py` (all models in one file)
- **Core**: `{module}.py` (e.g., `auth_v2.py`, `rbac.py`)

### Frontend

- **Pages**: `page.jsx` or `page.tsx`
- **Components**: `{ComponentName}.tsx` or `{ComponentName}.jsx`
- **Hooks**: `use{HookName}.ts` or `use{HookName}.js`
- **Utils**: `{util-name}.ts` or `{util-name}.js`

## Import Paths

### Frontend Aliases

**jsconfig.json**:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Usage**:
```typescript
import { v2Api } from '@/lib/api/v2-client';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
```

### Backend Imports

**Relative imports**:
```python
from core.database import get_db
from core.auth_v2 import get_current_user_v2
from db.models_v2 import Property
from schemas.property import PropertyCreate
```

## Common Patterns

### Adding a New Entity

1. **Backend**: Add model, schema, router
2. **Frontend**: Add React Query hook, component
3. **Types**: Regenerate from OpenAPI
4. **RBAC**: Add to permission matrix
5. **Portfolio**: Add tab (if needed)

### Adding a New Route

1. **Backend**: Add endpoint to router
2. **Frontend**: Add to API client
3. **Frontend**: Add React Query hook
4. **Types**: Regenerate from OpenAPI
5. **Component**: Use hook in component

## Cleanup Notes

### Removed Directories

- `apps/api-server/` - Legacy Next.js API server (removed)
- `apps/web-app/app/admin/` - Old admin routes (removed)
- `apps/web-app/app/platform/` (root) - Moved to `(protected)/platform/`
- `apps/web-app/app/portfolio/` (root) - Moved to `(protected)/portfolio/`

### Removed Files

- Old Prisma-based services
- Legacy RBAC files
- Duplicate route handlers
- Obsolete components

---

**Related Documentation**:
- [Architecture](01_Architecture.md) - System architecture
- [Development Guide](10_Development_Guide.md) - Development patterns

