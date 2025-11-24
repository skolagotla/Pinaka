# FastAPI Backend Migration Guide

## Overview

This document describes the migration from Next.js API routes to FastAPI backend while maintaining backward compatibility.

## Status

✅ **Vendors Domain Migrated**
- Full CRUD operations
- Role-based access control
- Pytest test coverage
- Frontend integration ready

## Architecture

### Structure

```
apps/backend-api/
├── main.py              # FastAPI app entry point
├── core/                # Core configuration
│   ├── config.py        # Settings (database, JWT, CORS)
│   ├── database.py      # Async SQLAlchemy setup
│   ├── auth.py          # JWT authentication & authorization
│   └── exceptions.py    # Exception handlers
├── db/                  # Database models
│   └── models.py        # SQLAlchemy models (ServiceProvider)
├── schemas/             # Pydantic schemas
│   └── vendor.py        # Request/response validation
├── services/            # Business logic
│   └── vendor_service.py
├── routers/             # API routes
│   ├── health.py        # Health checks
│   ├── auth.py          # Authentication
│   └── vendors.py       # Vendor endpoints
├── alembic/             # Database migrations
│   ├── env.py
│   └── versions/
└── tests/               # Pytest tests
    ├── conftest.py
    └── test_vendors.py
```

## Setup

### Prerequisites

- Python 3.11+
- PostgreSQL database
- Virtual environment (recommended)

### Installation

```bash
cd apps/backend-api

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your database credentials
```

### Database Setup

The FastAPI backend uses the same PostgreSQL database as the Next.js API server. No separate database is needed.

```bash
# Run migrations (when ready)
alembic upgrade head

# Create a new migration
alembic revision --autogenerate -m "description"
```

## Running

### Development

```bash
# Using uvicorn directly
cd apps/backend-api
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or using the npm script
pnpm run dev:backend
```

### API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI JSON: http://localhost:8000/openapi.json

## Testing

```bash
cd apps/backend-api
source venv/bin/activate

# Run all tests
pytest

# Run with coverage
pytest --cov=.

# Run specific test file
pytest tests/test_vendors.py
```

## Frontend Integration

### Environment Variables

Add to `apps/web-app/.env.local`:

```bash
# Enable FastAPI backend for vendors
NEXT_PUBLIC_USE_FASTAPI=true
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
```

### Current Implementation

The `useVendors` hook in `apps/web-app/lib/hooks/useDataQueries.ts` automatically switches between FastAPI and Next.js API based on the `NEXT_PUBLIC_USE_FASTAPI` environment variable.

### Authentication

The FastAPI backend uses JWT tokens. The frontend should:
1. Get token from existing auth system
2. Include token in `Authorization: Bearer <token>` header
3. FastAPI validates token and extracts user context

**Note:** Currently, the auth integration is a placeholder. Full integration with the existing auth system is pending.

## Migration Strategy

### Phase 1: Vendors Domain ✅

- [x] Create FastAPI structure
- [x] Implement ServiceProvider model
- [x] Create Pydantic schemas
- [x] Implement vendor service
- [x] Create API endpoints
- [x] Add pytest tests
- [x] Update frontend hook
- [x] Document migration

### Phase 2: Next Domain (Work Orders)

1. Create SQLAlchemy model for MaintenanceRequest
2. Create Pydantic schemas
3. Implement service layer
4. Create API endpoints
5. Add tests
6. Update frontend

### Phase 3: Remaining Domains

Continue migrating domains one at a time:
- Properties
- Tenants
- Leases
- Documents
- etc.

## API Compatibility

The FastAPI endpoints maintain compatibility with the existing Next.js API:

- Same URL structure: `/api/v1/vendors`
- Same request/response formats
- Same authentication (JWT)
- Same role-based access control

## Database Models

FastAPI uses SQLAlchemy models that mirror the Prisma schema. The `ServiceProvider` model includes:

- All fields from Prisma schema
- Proper indexes
- Relationships (when needed)

## Authentication & Authorization

### Roles

The FastAPI backend supports the same roles as the Next.js API:
- `super_admin`
- `pmc_admin`
- `pm`
- `landlord`
- `tenant`
- `vendor`
- `contractor`

### Role-Based Access

Endpoints use the `require_role` dependency to enforce access:

```python
@router.post("")
async def create_vendor(
    current_user: dict = Depends(require_role(["super_admin", "pmc_admin", "pm", "landlord"])),
):
    # Only specified roles can create vendors
    ...
```

## TypeScript Client Generation

A script is provided to generate TypeScript clients from the FastAPI OpenAPI spec:

```bash
# Generate OpenAPI spec
node scripts/generate-fastapi-client.js

# Then use openapi-generator to create TypeScript client
cd packages/api-client/src/generated/fastapi
npx @openapitools/openapi-generator-cli generate \
  -i openapi.json \
  -g typescript-axios \
  -o ./client
```

## Troubleshooting

### Database Connection Issues

Ensure `DATABASE_URL` in `.env` uses `postgresql+asyncpg://` (not `postgresql://`):

```bash
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/pinaka
```

### Import Errors

Make sure you're in the virtual environment:

```bash
source venv/bin/activate
```

### Port Conflicts

If port 8000 is in use, change it in `main.py` or use:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

## Next Steps

1. **Integrate Authentication**: Connect FastAPI auth with existing Next.js auth system
2. **Migrate Work Orders**: Next domain to migrate
3. **Generate TypeScript Client**: Create full TypeScript client from OpenAPI spec
4. **Add More Tests**: Increase test coverage
5. **Performance Optimization**: Add caching, connection pooling, etc.

## Resources

- FastAPI Documentation: https://fastapi.tiangolo.com/
- SQLAlchemy Async: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html
- Alembic Migrations: https://alembic.sqlalchemy.org/
- Pytest: https://docs.pytest.org/

