# Backend Documentation

## FastAPI Backend

The Pinaka backend is built with **FastAPI** and uses **SQLAlchemy** (async) for database access.

## Structure

```
apps/backend-api/
├── main.py              # FastAPI app entry point
├── routers/             # API route handlers
│   ├── properties.py
│   ├── tenants.py
│   ├── leases.py
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

## Running the Backend

```bash
# Development
cd apps/backend-api
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or from root
pnpm dev:backend
```

## API Endpoints

All v2 API endpoints are prefixed with `/api/v2/`:

- **Properties**: `/api/v2/properties`
- **Tenants**: `/api/v2/tenants`
- **Leases**: `/api/v2/leases`
- **Work Orders**: `/api/v2/work-orders`
- **Landlords**: `/api/v2/landlords`
- **Vendors**: `/api/v2/vendors`
- **Units**: `/api/v2/units`
- **Notifications**: `/api/v2/notifications`
- **Attachments**: `/api/v2/attachments`
- **Search**: `/api/v2/search`

## Authentication

JWT-based authentication:

```python
from core.auth_v2 import get_current_user_v2, require_role_v2, RoleEnum

@router.get("/example")
async def example_endpoint(
    current_user: User = Depends(require_role_v2([RoleEnum.PM, RoleEnum.LANDLORD]))
):
    # current_user is available here
    pass
```

## Database

### Models

All models are in `db/models_v2.py` using SQLAlchemy async:

```python
from db.models_v2 import Property, Tenant, Lease

# Query example
result = await db.execute(select(Property))
properties = result.scalars().all()
```

### Migrations

Alembic is used for database migrations:

```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

Migrations are in `alembic/versions/`.

## CRUD Helpers

Shared CRUD utilities in `core/crud_helpers.py`:

- `apply_organization_filter()` - Filter by organization
- `check_organization_access()` - Verify access
- `get_entity_or_404()` - Get entity or raise 404
- `update_entity_fields()` - Update entity fields
- `apply_pagination()` - Apply pagination

## Error Handling

Custom exception handlers in `core/exceptions.py`:

```python
from core.exceptions import setup_exception_handlers

setup_exception_handlers(app)
```

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/pinaka

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# JWT
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
```

## Testing

```bash
# Run tests
pytest

# With coverage
pytest --cov=.
```

## API Documentation

FastAPI automatically generates OpenAPI/Swagger docs:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

