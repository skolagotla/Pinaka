# Pinaka FastAPI Backend

FastAPI backend for the Pinaka Property Management Platform.

## Setup

### Prerequisites
- Python 3.11+
- PostgreSQL database
- Virtual environment (recommended)

### Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your database credentials
```

### Database Setup

```bash
# Run migrations
alembic upgrade head

# Create a new migration
alembic revision --autogenerate -m "description"
```

## Running

### Development

```bash
# Using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or using the script
pnpm dev:api
```

### Production

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI JSON: http://localhost:8000/openapi.json

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=.

# Run specific test file
pytest tests/test_vendors.py
```

## Project Structure

```
apps/backend-api/
├── main.py              # FastAPI app entry point
├── core/                # Core configuration
│   ├── config.py        # Settings
│   ├── database.py      # Database setup
│   ├── auth.py          # Authentication
│   └── exceptions.py    # Exception handlers
├── db/                  # Database models
│   └── models.py        # SQLAlchemy models
├── schemas/             # Pydantic schemas
│   └── vendor.py        # Vendor schemas
├── services/            # Business logic
│   └── vendor_service.py
├── routers/             # API routes
│   ├── health.py        # Health checks
│   ├── auth.py          # Authentication
│   └── vendors.py       # Vendor endpoints
├── alembic/             # Database migrations
└── tests/               # Tests
    └── test_vendors.py
```

## Authentication

The API uses JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Migrated Domains

- ✅ **Vendors** - Full CRUD operations migrated

## Next Steps

1. Migrate additional domains (work orders, properties, etc.)
2. Integrate with existing authentication system
3. Add comprehensive test coverage
4. Generate TypeScript client for frontend

