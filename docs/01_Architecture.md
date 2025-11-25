# Pinaka v2 - Architecture

## System Architecture Overview

Pinaka v2 follows a modern, API-first architecture with clear separation between frontend and backend, leveraging Domain-Driven Design principles and organization-aware multi-tenancy.

## API Documentation

Complete, developer-friendly API documentation is available in the `/docs/api/` directory:

- **[API Overview](./api/overview.md)** - Complete API guide with authentication, RBAC, and common patterns
- **[API Types](./api/types.md)** - Complete schema definitions for all request/response models
- **[API Errors](./api/errors.md)** - Comprehensive error response documentation
- **Domain APIs**: [Auth](./api/auth.md), [Users](./api/users.md), [Properties](./api/properties.md), [Leases](./api/leases.md), [Work Orders](./api/work_orders.md), and [20+ more domains](./api/overview.md#markdown-documentation)

## Architecture Diagrams

Comprehensive architectural diagrams are available in the `/docs/diagrams/` directory:

- **[System Overview](./diagrams/01-system-overview.md)** - High-level system architecture and role-based access
- **[DDD Bounded Contexts](./diagrams/02-ddd-bounded-contexts.md)** - Domain-driven design boundaries and relationships
- **[Backend Service Layer](./diagrams/03-backend-service-layer.md)** - Backend architecture with routers, services, and repositories
- **[Frontend Architecture](./diagrams/04-frontend-architecture.md)** - Frontend structure, components, and state management
- **[RBAC Permission Matrix](./diagrams/05-rbac-permission-matrix.md)** - Role-based access control permissions
- **[Organization Scoping](./diagrams/06-organization-scoping.md)** - Multi-tenant organization scoping rules
- **[Database ERD](./diagrams/07-database-erd.md)** - Complete entity-relationship diagram
- **[API Flow](./diagrams/08-api-flow.md)** - Request lifecycle and example flows
- **[Sequence Diagrams](./diagrams/09-sequence-diagrams.md)** - Detailed sequence diagrams for key operations
- **[API Sequence Diagrams](./diagrams/api-sequences/README.md)** - Complete sequence diagrams for all API endpoints
- **[Deployment Architecture](./diagrams/10-deployment-architecture.md)** - Deployment infrastructure and security

### Dependency Graphs

Detailed dependency analysis showing how components interact:

- **[Backend Dependencies](./diagrams/dependency-backend.md)** - Complete backend dependency graph (routers → services → repositories → models → DB)
- **[Frontend Dependencies](./diagrams/dependency-frontend.md)** - Complete frontend dependency graph (pages → hooks → API clients → backend)
- **[Cross-Cutting Concerns](./diagrams/dependency-cross-cutting.md)** - Authentication, RBAC, organization scoping, and typed API client dependencies

### API Sequence Diagrams

Complete sequence diagrams for all API endpoints showing request flows:

- **[API Sequences Overview](./diagrams/api-sequences/README.md)** - Index of all sequence diagrams organized by domain
- **Authentication**: Login, get current user
- **Properties**: List, create, get operations
- **Leases**: List, create, renew, terminate
- **Work Orders**: List, create, approve, assign vendor, comments
- And more...

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Next.js 16 App Router (apps/web-app)                │  │
│  │  - React 18 + Flowbite UI                            │  │
│  │  - React Query for state management                  │  │
│  │  - TypeScript types from OpenAPI                     │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/REST + JWT
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    API Layer                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  FastAPI Backend (apps/backend-api)                   │  │
│  │  - 25+ Routers with RBAC                              │  │
│  │  - Pydantic schemas for validation                   │  │
│  │  - SQLAlchemy async ORM                               │  │
│  │  - OpenAPI documentation                              │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    Data Layer                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PostgreSQL v2 Database                               │  │
│  │  - UUID primary keys                                  │  │
│  │  - Organization-scoped tables                         │  │
│  │  - Async queries (asyncpg)                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Design Principles

### 1. Domain-Driven Design (DDD)

Pinaka organizes business logic into domain modules:

```
domains/
├── property/          # Property domain
├── tenant/            # Tenant domain
├── lease/             # Lease domain
├── work-order/        # Maintenance domain
├── organization/      # Organization domain
└── ...
```

Each domain contains:
- **Domain Models**: Core business entities
- **Domain Services**: Business logic
- **Domain Events**: Domain events and handlers

**Benefits**:
- Clear separation of concerns
- Business logic isolated from infrastructure
- Easier to test and maintain
- Scalable architecture

### 2. API-First Design

FastAPI backend serves as the **Single Source of Truth (SSOT)**:

- **All schemas defined in FastAPI** (Pydantic models)
- **TypeScript types generated** from OpenAPI spec
- **No duplicate schemas** between frontend and backend
- **Runtime validation** on both sides

**Type Generation Flow**:
```
FastAPI (Pydantic) → OpenAPI JSON → TypeScript Types → Frontend
```

**Benefits**:
- Type safety across the stack
- Single source of truth for data structures
- Automatic API documentation
- Reduced maintenance burden

### 3. Organization-Aware Multi-Tenancy

All data is scoped to organizations:

- **Organization ID** on all entity tables
- **Automatic filtering** based on user's organization
- **SUPER_ADMIN exception**: Can see all organizations
- **Backend enforcement**: RBAC checks organization access

**Scoping Rules**:
- `SUPER_ADMIN`: No organization filter (sees all)
- `PMC_ADMIN`: Scoped to their organization
- `PM`: Scoped to organization + assigned properties
- `LANDLORD`: Scoped to organization + owned properties
- `TENANT`: Scoped to organization + their lease
- `VENDOR`: Scoped to organization + assigned work orders

## Frontend Architecture

### Next.js App Router

Pinaka uses Next.js 16 App Router with the following structure:

```
app/
├── (protected)/          # Protected routes (require auth)
│   ├── portfolio/        # Portfolio module
│   │   ├── page.jsx      # Dashboard
│   │   ├── properties/   # Properties tab
│   │   ├── tenants/      # Tenants tab
│   │   └── ...
│   └── platform/         # Platform (super_admin only)
├── auth/                 # Authentication
│   └── login/
├── onboarding/           # Onboarding flows
└── layout.jsx           # Root layout
```

### Client vs Server Components

- **Server Components**: Default in App Router, used for initial data fetching
- **Client Components**: Marked with `"use client"`, used for interactivity
- **Hybrid Approach**: Server components for layout, client components for interactive features

### State Management

**React Query (TanStack Query)**:
- All data fetching uses React Query hooks
- Automatic caching and invalidation
- Optimistic updates
- Request deduplication

**Example**:
```typescript
const { data, isLoading } = useProperties(organizationId);
```

### UI Components

**Flowbite React**:
- Professional UI component library
- Tailwind CSS-based
- Accessible and responsive
- Pro components for advanced features

**Component Structure**:
```
components/
├── layout/              # Layout components
│   ├── UnifiedSidebar.tsx
│   ├── UnifiedNavbar.tsx
│   └── ProtectedLayoutWrapper.tsx
├── shared/              # Shared components
│   ├── FlowbiteTable.tsx
│   ├── PageHeader.tsx
│   └── ...
├── pages/               # Page-specific components
│   └── shared/Portfolio/
└── tour/                # Guided tour components
```

## Backend Architecture

### FastAPI Structure

```
apps/backend-api/
├── main.py              # FastAPI app entry point
├── routers/             # API route handlers (25+ routers)
│   ├── auth_v2.py
│   ├── properties.py
│   ├── tenants.py
│   └── ...
├── schemas/             # Pydantic schemas
│   ├── property.py
│   ├── tenant.py
│   └── ...
├── db/                  # SQLAlchemy models
│   └── models_v2.py
├── core/                # Core utilities
│   ├── database.py      # Database connection
│   ├── auth_v2.py       # Authentication
│   ├── rbac.py          # RBAC system
│   └── crud_helpers.py  # Shared CRUD utilities
└── services/            # Business logic services
```

### Router Pattern

Each router follows a consistent pattern:

```python
from fastapi import APIRouter, Depends
from core.rbac import require_permission, PermissionAction, ResourceType
from core.database import get_db

router = APIRouter(prefix="/properties", tags=["properties"])

@router.get("", response_model=List[Property])
async def list_properties(
    current_user: User = Depends(require_permission(PermissionAction.READ, ResourceType.PROPERTY)),
    db: AsyncSession = Depends(get_db)
):
    # RBAC already checked by require_permission
    # Organization scoping handled automatically
    ...
```

### RBAC Integration

All protected routes use `require_permission`:

- **Permission checking**: Centralized in `core/rbac.py`
- **Organization scoping**: Automatic based on user role
- **Resource-level permissions**: Fine-grained control

### Database Layer

**SQLAlchemy Async**:
- Async queries using `asyncpg`
- Eager loading with `selectinload` to prevent N+1 queries
- Pagination on all list endpoints
- Database indexes for performance

**Example**:
```python
query = select(Property).options(
    selectinload(Property.landlord),
    selectinload(Property.organization),
)
```

## Data Flow

### Request Flow

```
1. User Action (Frontend)
   ↓
2. React Query Hook (useProperties, useCreateProperty, etc.)
   ↓
3. API Client (v2Api.listProperties, v2Api.createProperty)
   ↓
4. HTTP Request (JWT token in Authorization header)
   ↓
5. FastAPI Router (require_permission checks RBAC)
   ↓
6. Database Query (SQLAlchemy with organization filtering)
   ↓
7. Response (JSON with validated data)
   ↓
8. React Query Cache (automatic caching and invalidation)
   ↓
9. UI Update (React re-renders with new data)
```

### Authentication Flow

```
1. User Login
   ↓
2. POST /api/v2/auth/login (email + password)
   ↓
3. Backend validates credentials
   ↓
4. JWT token generated (includes user_id, roles, organization_id)
   ↓
5. Token stored in localStorage (frontend)
   ↓
6. Token sent in Authorization header for all requests
   ↓
7. Backend validates token and extracts user context
   ↓
8. RBAC checks permissions based on user roles
```

## Organization-Aware Multi-Tenancy

### Database Schema

All entity tables include `organization_id`:

```sql
CREATE TABLE properties (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    ...
);
```

### Backend Filtering

Automatic organization filtering in queries:

```python
# SUPER_ADMIN: no filter
if RoleEnum.SUPER_ADMIN in user_roles:
    query = select(Property)
else:
    # Other roles: filter by organization
    query = select(Property).where(
        Property.organization_id == current_user.organization_id
    )
```

### Frontend Scoping

Hooks automatically scope queries:

```typescript
// useOrganizationId() returns undefined for SUPER_ADMIN
const orgId = useOrganizationId();
const { data } = useProperties(orgId);
```

## SSR vs CSR Strategy

### Server-Side Rendering (SSR)
- **Layout components**: Server components for initial HTML
- **Static pages**: Onboarding, help pages
- **SEO**: Public-facing pages use SSR

### Client-Side Rendering (CSR)
- **Interactive components**: Forms, tables, modals
- **Data fetching**: React Query hooks (client-side)
- **Real-time updates**: WebSocket-ready architecture

### Hybrid Approach
- **Initial load**: Server-rendered layout
- **Data fetching**: Client-side with React Query
- **Interactivity**: Client components for user interactions

## Performance Optimizations

### Backend
- **Eager loading**: `selectinload` prevents N+1 queries
- **Pagination**: All list endpoints paginated
- **Database indexes**: Optimized for common queries
- **Query optimization**: Reduced database round trips

### Frontend
- **React Query caching**: Configurable stale times
- **Code splitting**: Dynamic imports for large components
- **Optimistic updates**: Immediate UI feedback
- **Request deduplication**: Prevents duplicate API calls

## Security

### Authentication
- **JWT tokens**: Stateless authentication
- **Token expiration**: Configurable (default 30 minutes)
- **Secure storage**: localStorage (can be migrated to httpOnly cookies)

### Authorization
- **RBAC**: Role-based access control
- **Permission matrix**: Centralized permission definitions
- **Organization scoping**: Automatic data isolation
- **Resource-level permissions**: Fine-grained control

### Data Protection
- **Input validation**: Pydantic schemas
- **SQL injection prevention**: SQLAlchemy parameterized queries
- **XSS protection**: React's built-in escaping
- **CORS**: Configured for allowed origins

## Scalability

### Horizontal Scaling
- **Stateless backend**: JWT tokens enable load balancing
- **Database connection pooling**: Async SQLAlchemy
- **CDN-ready**: Static assets can be served from CDN

### Vertical Scaling
- **Async operations**: Non-blocking I/O
- **Efficient queries**: Optimized database access
- **Caching**: React Query client-side caching

## Monitoring & Observability

### Logging
- **Structured logging**: JSON logs for parsing
- **Error tracking**: Centralized error handling
- **Performance metrics**: Query timing and response times

### API Documentation
- **OpenAPI/Swagger**: Auto-generated at `/docs`
- **ReDoc**: Alternative documentation at `/redoc`
- **Type definitions**: Generated TypeScript types

## Future Enhancements

### Planned Features
- **WebSocket support**: Real-time updates
- **GraphQL API**: Alternative to REST
- **Microservices**: Split into domain services
- **Event sourcing**: Audit trail and event replay

### Technical Debt
- **Service migration**: Migrate Prisma-based services to FastAPI
- **Test coverage**: Increase unit and integration tests
- **Documentation**: Expand API documentation with examples

---

**Related Documentation**:
- [Backend API](02_Backend_API.md) - API endpoints and usage
- [Frontend Structure](03_Frontend_Structure.md) - Frontend organization
- [Database Schema](04_Database_v2_Schema.md) - Database structure
- [RBAC](05_RBAC_Roles_and_Permissions.md) - Access control

