# Pinaka - Property Management Platform

A modern, enterprise-grade property management platform built with Next.js, Flowbite UI, FastAPI, and PostgreSQL.

**Status**: ✅ **100% V2 Compliant** - All active runtime code uses v2 architecture.

---

## What is Pinaka?

Pinaka is a comprehensive property management system designed for Property Management Companies (PMCs), landlords, tenants, and vendors. It provides end-to-end functionality for managing properties, leases, maintenance, financials, and communications in a unified, role-based system.

### Key Features

- **Unified Portfolio**: Single interface for all property management activities
- **Role-Based Access Control**: Fine-grained permissions per role
- **Multi-Tenant Architecture**: Organization-aware data isolation
- **Onboarding Flows**: Role-specific onboarding experiences
- **Guided Tours**: Interactive tours for first-time users
- **Work Order Management**: Complete maintenance request system
- **Lease Management**: Full lease lifecycle management
- **Financial Tracking**: Rent payments and expenses

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
# Edit .env with your database credentials

# Set up Python virtual environment
cd apps/backend-api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# (Optional) Seed test data
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

---

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: Flowbite React (Pro components)
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Language**: TypeScript/JavaScript

### Backend
- **Framework**: FastAPI (Python)
- **ORM**: SQLAlchemy (async)
- **Database**: PostgreSQL v2
- **Authentication**: JWT (JSON Web Tokens)
- **Migrations**: Alembic

### Architecture
- **Monorepo**: pnpm workspaces
- **Type Generation**: OpenAPI → TypeScript (Single Source of Truth)
- **Design Patterns**: Domain-Driven Design (DDD), API-First

---

## Folder Structure

```
Pinaka/
├── apps/
│   ├── backend-api/        # FastAPI backend
│   │   ├── routers/        # API route handlers (25+ routers)
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── db/             # SQLAlchemy models
│   │   └── core/           # Core utilities (auth, RBAC, database)
│   └── web-app/            # Next.js frontend
│       ├── app/            # Next.js App Router pages
│       ├── components/     # React components
│       └── lib/            # Frontend utilities, hooks, API clients
├── packages/               # Shared packages
│   ├── api-client/         # Generated API client
│   ├── shared-types/       # OpenAPI-generated TypeScript types
│   └── shared-utils/       # Shared utilities
├── domains/                # Domain-Driven Design modules
├── infra/                  # Infrastructure (migrations, backups)
├── scripts/                # Utility scripts
└── docs/                   # Documentation
```

---

## Documentation

Comprehensive documentation is available in the `/docs` directory:

1. **[Overview](docs/00_Overview.md)** - Project overview and key features
2. **[Architecture](docs/01_Architecture.md)** - System architecture and design decisions
3. **[Backend API](docs/02_Backend_API.md)** - API endpoints and usage
4. **[Frontend Structure](docs/03_Frontend_Structure.md)** - Frontend organization and patterns
5. **[Database Schema](docs/04_Database_v2_Schema.md)** - Database structure and relationships
6. **[RBAC](docs/05_RBAC_Roles_and_Permissions.md)** - Role-based access control
7. **[Domain Models](docs/06_Domain_Models.md)** - Domain-driven design structure
8. **[Portfolio Module](docs/07_Portfolio_Module.md)** - Unified Portfolio interface
9. **[Onboarding Flow](docs/08_Onboarding_Flow.md)** - User onboarding flows
10. **[Authentication](docs/09_Authentication_and_Sessions.md)** - Auth and session management
11. **[Development Guide](docs/10_Development_Guide.md)** - How to develop and extend
12. **[Deployment Guide](docs/11_Deployment_Guide.md)** - Production deployment
13. **[Folder Reference](docs/12_Folder_Reference.md)** - Monorepo structure
14. **[Glossary](docs/13_Glossary.md)** - Terms and definitions

---

## Key Design Principles

### 1. Domain-Driven Design (DDD)
- Business logic organized by domain (properties, tenants, leases, etc.)
- Clear separation between domain, application, and infrastructure layers
- Domain services encapsulate business rules

### 2. API-First
- FastAPI backend with OpenAPI/Swagger documentation
- Consistent RESTful API patterns
- Type-safe API clients generated from schemas
- All endpoints use `/api/v2` prefix

### 3. Single Source of Truth (SSOT)
- All API schemas defined in FastAPI (Pydantic)
- TypeScript types generated from OpenAPI spec
- Runtime validation on both frontend and backend
- No duplicate schema definitions

### 4. Organization-Aware Multi-Tenancy
- All data scoped to organizations
- SUPER_ADMIN can see all organizations
- Other roles see only their organization's data
- Automatic filtering based on user role and organization

---

## User Roles

Pinaka supports six primary user roles:

1. **SUPER_ADMIN**: Full system access, can see all organizations
2. **PMC_ADMIN**: Property Management Company administrator
3. **PM**: Property Manager (manages assigned properties)
4. **LANDLORD**: Property owner
5. **TENANT**: Lease holder
6. **VENDOR**: Service provider

Each role has specific permissions and sees a customized interface based on their responsibilities.

---

## API Documentation

FastAPI automatically generates API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

---

## Generate TypeScript Types

```bash
# Make sure FastAPI server is running
# Then generate types from OpenAPI spec
pnpm generate:types
```

This fetches the OpenAPI spec from `http://localhost:8000/openapi.json` and generates TypeScript types to `packages/shared-types/v2-api.d.ts`.

---

## Development

### Adding a New Feature

1. **Define Schema**: Add Pydantic schemas in `apps/backend-api/schemas/`
2. **Backend**: Create router in `apps/backend-api/routers/`
3. **Frontend**: Create components in `apps/web-app/components/`
4. **Types**: Regenerate types with `pnpm generate:types`
5. **API Client**: Use `v2Api` or React Query hooks

See [Development Guide](docs/10_Development_Guide.md) for detailed instructions.

---

## License

ISC

---

**Built with ❤️ using modern web technologies and best practices**

**Last Updated**: 2025-01-25  
**Version**: 2.0.0
