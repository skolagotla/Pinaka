# Architecture Overview

## System Architecture

Pinaka follows a **monorepo architecture** with clear separation between frontend, backend, and shared packages.

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
│   PostgreSQL    │  (v2 Database)
└─────────────────┘
```

## Monorepo Structure

### Apps

**`apps/web-app/`** - Next.js Frontend
- Next.js 16 with App Router
- Flowbite UI components
- React Query for data fetching
- TypeScript for type safety

**`apps/backend-api/`** - FastAPI Backend
- FastAPI with async SQLAlchemy
- PostgreSQL v2 database
- Alembic for migrations
- Pydantic schemas for validation

### Packages

**`packages/shared-types/`** - Shared Type Definitions
- TypeScript types
- Zod schemas
- Single source of truth for API contracts

**`packages/api-client/`** - Generated API Client
- Type-safe API client
- Generated from OpenAPI schema

**`packages/domains/`** - Domain Logic
- Domain-driven design modules
- Business logic and services

**`packages/shared-utils/`** - Shared Utilities
- Common utilities used across apps
- Date formatting, validation, etc.

**`packages/ui/`** - Shared UI Components
- Reusable React components
- Built on Flowbite

## Design Principles

### 1. Domain-Driven Design (DDD)

Business logic is organized by domain:
- **Properties**: Property and unit management
- **Tenants**: Tenant lifecycle and applications
- **Leases**: Lease agreements and renewals
- **Work Orders**: Maintenance requests and tracking
- **Financials**: Rent payments and expenses

Each domain has:
- Domain models (entities, value objects)
- Domain services (business logic)
- Repositories (data access)

### 2. API-First

- All APIs defined in FastAPI with OpenAPI/Swagger
- Type-safe clients generated from schemas
- Consistent RESTful patterns
- Versioned APIs (`/api/v2/*`)

### 3. Shared Schema (Single Source of Truth)

- All API contracts defined in `packages/shared-types`
- TypeScript types and Pydantic schemas generated
- Runtime validation on both frontend and backend
- No duplicate schema definitions

## Data Flow

### Frontend → Backend

1. User action in React component
2. Component calls hook (e.g., `useCreateProperty()`)
3. Hook uses API client (`v2Api.createProperty()`)
4. API client makes HTTP request to FastAPI
5. FastAPI router validates with Pydantic schema
6. Router calls domain service
7. Service uses repository to access database
8. Response flows back through the chain

### Authentication Flow

1. User logs in via `/api/v2/auth/login`
2. Backend validates credentials
3. Backend returns JWT token
4. Frontend stores token in localStorage
5. All subsequent requests include token in `Authorization` header
6. Backend validates token and extracts user/role info

## Role-Based Access Control (RBAC)

### Roles

- **SUPER_ADMIN**: Full system access, can see all organizations
- **PMC_ADMIN**: Manages PMC organization and users
- **PM**: Property Manager, manages properties and tenants
- **LANDLORD**: Property owner, sees own properties
- **TENANT**: Lease holder, sees own lease and work orders
- **VENDOR**: Service provider, sees assigned work orders
- **CONTRACTOR**: Maintenance contractor

### Access Control

- **Organization-scoped**: Users only see data from their organization
- **Role-based filtering**: Backend filters data based on user role
- **Resource-level permissions**: Fine-grained permissions for specific actions

## Database Schema

### Core Entities

- **organizations**: PMC organizations
- **users**: System users
- **roles**: System roles
- **user_roles**: User-role assignments
- **properties**: Properties
- **units**: Property units
- **leases**: Lease agreements
- **lease_tenants**: Lease-tenant relationships
- **tenants**: Tenant records
- **landlords**: Landlord records
- **vendors**: Vendor records
- **work_orders**: Maintenance work orders
- **attachments**: File attachments
- **notifications**: User notifications
- **audit_logs**: System audit trail

### Relationships

- Organizations → Users (one-to-many)
- Users → Roles (many-to-many via user_roles)
- Properties → Units (one-to-many)
- Units → Leases (one-to-many)
- Leases → Tenants (many-to-many via lease_tenants)
- Work Orders → Properties/Units/Tenants (many-to-one)

## Performance Optimizations

### Backend

- **Eager loading**: `selectinload` for related entities
- **Pagination**: All list endpoints support pagination
- **Database indexes**: Optimized indexes for common queries
- **Query optimization**: Reduced N+1 queries

### Frontend

- **React Query**: Caching and stale-while-revalidate
- **Code splitting**: Dynamic imports for large components
- **Optimistic updates**: Immediate UI feedback
- **Request deduplication**: Prevent duplicate API calls

## Security

- **JWT authentication**: Secure token-based auth
- **HTTPS**: All production traffic encrypted
- **Input validation**: Pydantic schemas validate all inputs
- **SQL injection protection**: SQLAlchemy ORM prevents SQL injection
- **XSS protection**: React escapes content by default
- **CSRF protection**: SameSite cookies, token validation

## Deployment

### Frontend

- Next.js standalone build
- Static assets served via CDN
- API routes proxied to FastAPI backend

### Backend

- FastAPI with Uvicorn ASGI server
- PostgreSQL database
- Alembic migrations on startup
- Environment-based configuration

## Future Considerations

- **GraphQL API**: Optional GraphQL layer for flexible queries
- **Real-time**: WebSocket support for live updates
- **Microservices**: Potential split into domain services
- **Caching**: Redis for session and query caching
- **Search**: Elasticsearch for full-text search

