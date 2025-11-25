# Pinaka v2 - Overview

## What is Pinaka?

Pinaka is a modern, enterprise-grade property management platform designed for Property Management Companies (PMCs), landlords, tenants, and vendors. It provides comprehensive functionality for managing properties, leases, maintenance, financials, and communications in a unified, role-based system.

## Key Features

### Core Functionality
- **Property Management**: Complete property and unit management with address tracking
- **Lease Management**: Full lease lifecycle from application to termination
- **Tenant Management**: Tenant profiles, applications, approvals, and communications
- **Maintenance**: Work order system with vendor assignments and tracking
- **Financials**: Rent payments, expenses, and financial reporting
- **Documents**: Document storage, forms, and digital signatures
- **Communications**: Messaging, notifications, and conversations
- **Analytics**: Dashboards, reports, and insights per role

### Enterprise Features
- **Multi-Tenant Architecture**: Organization-aware data isolation
- **Role-Based Access Control (RBAC)**: Fine-grained permissions per role
- **Unified Portfolio**: Single interface for all property management needs
- **Onboarding Flows**: Role-specific onboarding experiences
- **Guided Tours**: Interactive tours for first-time users

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: Flowbite React (Pro components)
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Language**: TypeScript/JavaScript
- **Icons**: React Icons (Heroicons)

### Backend
- **Framework**: FastAPI (Python)
- **ORM**: SQLAlchemy (async)
- **Database**: PostgreSQL v2
- **Authentication**: JWT (JSON Web Tokens)
- **Migrations**: Alembic
- **API Documentation**: OpenAPI/Swagger

### Architecture

### Architecture Diagrams

Comprehensive architectural diagrams are available in the [diagrams directory](./diagrams/README.md):

- **System Overview** - High-level system architecture
- **DDD Bounded Contexts** - Domain-driven design boundaries
- **Backend Service Layer** - Backend architecture
- **Frontend Architecture** - Frontend structure
- **RBAC Permission Matrix** - Role-based access control
- **Organization Scoping** - Multi-tenant scoping
- **Database ERD** - Complete entity-relationship diagram
- **API Flow** - Request lifecycle
- **Sequence Diagrams** - Key operation flows
- **Deployment Architecture** - Infrastructure and security

See [Architecture Diagrams](./diagrams/README.md) for details.
- **Monorepo**: pnpm workspaces
- **Type Generation**: OpenAPI → TypeScript (Single Source of Truth)
- **Design Patterns**: Domain-Driven Design (DDD), API-First
- **Deployment**: Docker-ready, environment-based configuration

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│  (apps/web-app) - React + Flowbite + Tailwind          │
└────────────────────┬──────────────────────────────────┘
                      │ HTTP/REST (JWT Auth)
                      │
┌─────────────────────▼──────────────────────────────────┐
│                  FastAPI Backend                        │
│  (apps/backend-api) - Python + SQLAlchemy              │
│  - 25+ API Routers                                     │
│  - RBAC Enforcement                                    │
│  - Organization Scoping                                │
└─────────────────────┬──────────────────────────────────┘
                      │
┌─────────────────────▼──────────────────────────────────┐
│              PostgreSQL Database (v2)                   │
│  - UUID Primary Keys                                   │
│  - Organization-Aware Multi-Tenant                     │
│  - Async Queries (asyncpg)                             │
└─────────────────────────────────────────────────────────┘
```

## User Roles

Pinaka supports six primary user roles:

1. **SUPER_ADMIN**: Full system access, can see all organizations
2. **PMC_ADMIN**: Property Management Company administrator
3. **PM**: Property Manager (manages assigned properties)
4. **LANDLORD**: Property owner
5. **TENANT**: Lease holder
6. **VENDOR**: Service provider

Each role has specific permissions and sees a customized interface based on their responsibilities.

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

## Quick Start

### Prerequisites
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Python >= 3.9
- PostgreSQL >= 14

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
cd apps/backend-api
alembic upgrade head

# Start backend (http://localhost:8000)
cd apps/backend-api
source venv/bin/activate
uvicorn main:app --reload

# Start frontend (http://localhost:3000)
pnpm dev
```

### Test Credentials
- **Super Admin**: superadmin@pinaka.com / SuperAdmin123!
- **PMC Admin**: pmcadmin@pinaka.com / PmcAdmin123!
- **Landlord**: landlord@pinaka.com / Landlord123!
- **Tenant**: tenant@pinaka.com / Tenant123!

## Documentation Structure

This documentation is organized into the following sections:

1. **[Architecture](01_Architecture.md)** - System architecture and design decisions
2. **[Backend API](02_Backend_API.md)** - API endpoints and usage
3. **[Frontend Structure](03_Frontend_Structure.md)** - Frontend organization and patterns
4. **[Database Schema](04_Database_v2_Schema.md)** - Database structure and relationships
5. **[RBAC](05_RBAC_Roles_and_Permissions.md)** - Role-based access control
6. **[Domain Models](06_Domain_Models.md)** - Domain-driven design structure
7. **[Portfolio Module](07_Portfolio_Module.md)** - Unified Portfolio interface
8. **[Onboarding](08_Onboarding_Flow.md)** - User onboarding flows
9. **[Authentication](09_Authentication_and_Sessions.md)** - Auth and session management
10. **[Development Guide](10_Development_Guide.md)** - How to develop and extend
11. **[Deployment Guide](11_Deployment_Guide.md)** - Production deployment
12. **[Folder Reference](12_Folder_Reference.md)** - Monorepo structure
13. **[Glossary](13_Glossary.md)** - Terms and definitions

## Status

✅ **100% V2 Compliant** - All active runtime code uses v2 architecture
- ✅ FastAPI backend with 25+ routers
- ✅ Next.js 16 App Router frontend
- ✅ Flowbite UI components
- ✅ OpenAPI-generated TypeScript types
- ✅ RBAC fully implemented
- ✅ Organization-aware multi-tenancy
- ✅ Unified Portfolio module

## License

ISC

---

**Last Updated**: 2025-01-25  
**Version**: 2.0.0

