# Pinaka - Property Management Platform

A modern, full-stack property management platform built with Next.js, Flowbite UI, FastAPI, and PostgreSQL.

## 🎯 Overview

Pinaka is a comprehensive property management system designed for Property Management Companies (PMCs), landlords, tenants, and vendors. It provides end-to-end functionality for managing properties, leases, maintenance, financials, and more.

## 🏗️ Tech Stack

- **Frontend**: Next.js 16 + React + Flowbite UI
- **Backend**: FastAPI + SQLAlchemy (async)
- **Database**: PostgreSQL v2
- **Authentication**: JWT-based with role-based access control (RBAC)
- **Monorepo**: pnpm workspaces

## 📁 Monorepo Structure

```
Pinaka/
├── apps/
│   ├── web-app/              # Next.js frontend application
│   │   ├── app/              # Next.js App Router pages
│   │   ├── components/       # React components
│   │   └── lib/              # Frontend utilities, hooks, API clients
│   │
│   └── backend-api/          # FastAPI backend application
│       ├── routers/          # API route handlers
│       ├── schemas/          # Pydantic schemas
│       ├── db/               # SQLAlchemy models
│       ├── core/             # Core utilities (auth, database, CRUD helpers)
│       └── services/         # Business logic services
│
├── packages/                 # Shared packages
│   ├── api-client/           # Generated API client
│   ├── domains/              # Domain-driven design modules
│   ├── schemas/              # Shared TypeScript schemas
│   ├── shared-types/         # Shared TypeScript types
│   ├── shared-utils/         # Shared utilities
│   └── ui/                   # Shared UI components
│
├── infra/                    # Infrastructure
│   ├── db/                   # Database migrations (Alembic)
│   └── backups/              # Database backups
│
├── docs/                     # Documentation
│   ├── architecture.md       # Architecture overview
│   ├── backend.md            # Backend documentation
│   ├── frontend.md           # Frontend documentation
│   └── api.md                # API documentation
│
├── scripts/                  # Utility scripts
└── ci/                      # CI/CD configuration
```

## 🚀 Quick Start

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

### Development

```bash
# Start frontend (Next.js) - http://localhost:3000
pnpm dev

# Start backend (FastAPI) - http://localhost:8000
pnpm dev:backend

# Or run both in separate terminals
pnpm dev              # Frontend
pnpm dev:backend      # Backend
```

### Database Setup

```bash
# Run migrations
cd apps/backend-api
alembic upgrade head

# Seed initial data (optional)
python scripts/seed_v2.py
```

## 🎭 Role-Based Access Control (RBAC)

Pinaka supports multiple user roles:

- **SUPER_ADMIN**: Full system access
- **PMC_ADMIN**: PMC organization management
- **PM**: Property Manager (manages properties and tenants)
- **LANDLORD**: Property owner
- **TENANT**: Lease holder
- **VENDOR**: Service provider
- **CONTRACTOR**: Maintenance contractor

See [docs/architecture.md](docs/architecture.md) for detailed role permissions.

## 📚 Documentation

- **[Architecture Overview](docs/architecture.md)** - System architecture and design decisions
- **[Backend Documentation](docs/backend.md)** - FastAPI backend details
- **[Frontend Documentation](docs/frontend.md)** - Next.js frontend details
- **[API Documentation](docs/api.md)** - API endpoints and usage

## 🏛️ Architecture Principles

### 1. Domain-Driven Design (DDD)
- Business logic organized by domain (properties, tenants, leases, etc.)
- Domain services encapsulate business rules
- Clear separation between domain, application, and infrastructure layers

### 2. API-First
- FastAPI backend with OpenAPI/Swagger documentation
- Consistent RESTful API patterns
- Type-safe API clients generated from schemas

### 3. Shared Schema (Single Source of Truth)
- All API schemas defined in `packages/shared-types`
- TypeScript types and Pydantic schemas generated from shared definitions
- Runtime validation on both frontend and backend

## 🔧 Development Workflow

### Adding a New Feature

1. **Define Schema**: Add types to `packages/shared-types/src/types/`
2. **Backend**: Create router in `apps/backend-api/routers/`
3. **Frontend**: Create components in `apps/web-app/components/`
4. **API Client**: Regenerate client from schemas

### Code Style

- **Frontend**: TypeScript/JavaScript with Flowbite UI components
- **Backend**: Python with type hints, FastAPI conventions
- **Formatting**: Prettier (frontend), Black (backend)

## 🧪 Testing

```bash
# Backend tests
cd apps/backend-api
pytest

# Frontend tests (when available)
cd apps/web-app
pnpm test
```

## 📦 Build & Deploy

```bash
# Build all packages
pnpm build:packages

# Build all apps
pnpm build:apps

# Build frontend
cd apps/web-app
pnpm build

# Run backend in production
cd apps/backend-api
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 🗄️ Database

### Migrations

```bash
# Create a new migration
cd apps/backend-api
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Database Schema

The v2 PostgreSQL schema includes:
- Organizations, Users, Roles
- Properties, Units, Leases
- Tenants, Landlords, Vendors
- Work Orders, Attachments, Notifications
- Audit Logs, Forms, Rent Payments

See `apps/backend-api/db/models_v2.py` for full schema.

## 🔐 Authentication & Authorization

- **JWT-based authentication** via FastAPI
- **Role-based access control** (RBAC) enforced in backend
- **Organization-scoped data** - users only see data from their organization
- **Frontend auth hook**: `useV2Auth()` from `@/lib/hooks/useV2Auth`

## 📝 Key Features

- **Property Management**: Properties, units, leases
- **Tenant Management**: Applications, approvals, rent payments
- **Maintenance**: Work orders, vendor assignments, tracking
- **Financials**: Rent collection, expenses, reporting
- **Documents**: Document storage, forms, signatures
- **Communications**: Messaging, notifications
- **Analytics**: Dashboards, reports, insights

## 🛠️ Scripts

Key utility scripts in `scripts/`:
- `initialize-rbac.ts` - Initialize RBAC system
- `seed_v2.py` - Seed database with test data
- Various migration and utility scripts

## 📄 License

ISC

## 🤝 Contributing

1. Follow the architecture principles (DDD, API-First, Shared Schema)
2. Use TypeScript/Python type hints
3. Write tests for new features
4. Update documentation

## 📞 Support

For issues, questions, or contributions, please refer to the documentation in `docs/` or open an issue.

---

**Built with ❤️ using modern web technologies and best practices**
