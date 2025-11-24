# Pinaka FastAPI Backend (v2)

FastAPI backend for the Pinaka Property Management Platform using v2 database schema.

## Quick Start

### Prerequisites
- Python 3.9+
- PostgreSQL database
- Virtual environment (recommended)

### Setup

1. **Create and activate virtual environment:**
   ```bash
   cd apps/backend-api
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and settings
   ```

4. **Run migrations:**
   ```bash
   alembic upgrade head
   ```

5. **Seed test data (optional):**
   ```bash
   python scripts/seed_v2.py
   ```

6. **Start the server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

The API will be available at:
- **API:** http://localhost:8000
- **Docs:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/v2/auth/login` - Login with email/password
- `GET /api/v2/auth/me` - Get current user and roles

### Organizations
- `GET /api/v2/organizations` - List organizations
- `POST /api/v2/organizations` - Create organization (super_admin only)
- `GET /api/v2/organizations/{id}` - Get organization
- `PATCH /api/v2/organizations/{id}` - Update organization
- `DELETE /api/v2/organizations/{id}` - Delete organization

### Properties
- `GET /api/v2/properties` - List properties
- `POST /api/v2/properties` - Create property
- `GET /api/v2/properties/{id}` - Get property
- `PATCH /api/v2/properties/{id}` - Update property
- `DELETE /api/v2/properties/{id}` - Delete property

### Units
- `GET /api/v2/units` - List units (optionally filtered by property)
- `POST /api/v2/units` - Create unit
- `GET /api/v2/units/{id}` - Get unit
- `PATCH /api/v2/units/{id}` - Update unit
- `DELETE /api/v2/units/{id}` - Delete unit

### Landlords
- `GET /api/v2/landlords` - List landlords
- `POST /api/v2/landlords` - Create landlord
- `GET /api/v2/landlords/{id}` - Get landlord
- `PATCH /api/v2/landlords/{id}` - Update landlord
- `DELETE /api/v2/landlords/{id}` - Delete landlord

### Tenants
- `GET /api/v2/tenants` - List tenants
- `POST /api/v2/tenants` - Create tenant
- `GET /api/v2/tenants/{id}` - Get tenant
- `PATCH /api/v2/tenants/{id}` - Update tenant
- `DELETE /api/v2/tenants/{id}` - Delete tenant

### Leases
- `GET /api/v2/leases` - List leases (with filters)
- `POST /api/v2/leases` - Create lease
- `GET /api/v2/leases/{id}` - Get lease
- `PATCH /api/v2/leases/{id}` - Update lease
- `DELETE /api/v2/leases/{id}` - Delete lease

### Work Orders
- `GET /api/v2/work-orders` - List work orders
- `POST /api/v2/work-orders` - Create work order
- `GET /api/v2/work-orders/{id}` - Get work order
- `PATCH /api/v2/work-orders/{id}` - Update work order
- `POST /api/v2/work-orders/{id}/comments` - Add comment

### Attachments
- `GET /api/v2/attachments` - List attachments (filtered by entity)
- `POST /api/v2/attachments` - Upload attachment
- `GET /api/v2/attachments/{id}/download` - Download attachment
- `DELETE /api/v2/attachments/{id}` - Delete attachment

### Notifications
- `GET /api/v2/notifications` - List notifications for current user
- `PATCH /api/v2/notifications/{id}/read` - Mark notification as read
- `POST /api/v2/notifications/mark-all-read` - Mark all as read

### Users & Roles
- `GET /api/v2/users` - List users
- `POST /api/v2/users` - Create user
- `GET /api/v2/users/{id}` - Get user with roles
- `PATCH /api/v2/users/{id}` - Update user
- `POST /api/v2/users/{id}/roles` - Assign role to user (super_admin only)
- `DELETE /api/v2/users/{id}/roles/{role_id}` - Remove role from user

### Audit Logs
- `GET /api/v2/audit-logs` - List audit logs (super_admin only)
- `GET /api/v2/audit-logs/{id}` - Get audit log

## Authentication

All endpoints (except `/auth/login`) require JWT authentication.

**Request Header:**
```
Authorization: Bearer <token>
```

The token is obtained from `/api/v2/auth/login` and should be stored securely (currently in localStorage for development).

## Role-Based Access Control (RBAC)

### Roles
- `super_admin` - Platform-wide access, can access all organizations
- `pmc_admin` - PMC organization administrator
- `pm` - Property Manager
- `landlord` - Property owner
- `tenant` - Tenant
- `vendor` - Service vendor

### Access Control
- **super_admin**: Can access all organizations and resources
- **Other roles**: Scoped to their organization (`organization_id`)
- **Tenants**: Can only see their own leases and work orders
- **Landlords**: Can see their properties, tenants, and leases

## Database Schema

The v2 schema uses:
- **UUID primary keys** for all tables
- **snake_case** naming convention
- **Organization-scoped** multi-tenancy
- **Additive-only** migrations (legacy tables preserved)

### Key Tables
- `organizations` - Multi-tenant organizations
- `users` - User accounts
- `roles` - Role definitions
- `user_roles` - User-role assignments
- `properties`, `units`, `leases` - Property management
- `work_orders` - Maintenance/work orders
- `attachments` - File storage metadata
- `notifications` - User notifications
- `audit_logs` - Audit trail

## Development

### Running Tests
```bash
pytest
```

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Seeding Data
```bash
python scripts/seed_v2.py
```

**Test Credentials:**
- `superadmin@pinaka.com` / `SuperAdmin123!`
- `pmcadmin@pinaka.com` / `PmcAdmin123!`
- `landlord@pinaka.com` / `Landlord123!`
- `tenant@pinaka.com` / `Tenant123!`

## Project Structure

```
apps/backend-api/
├── alembic/              # Database migrations
│   └── versions/         # Migration files
├── core/                 # Core configuration
│   ├── config.py        # Settings
│   ├── database.py      # Database connection
│   ├── auth_v2.py       # Authentication & RBAC
│   └── exceptions.py    # Exception handlers
├── db/                   # Database models
│   ├── models_v2.py     # v2 SQLAlchemy models
│   └── models.py        # Legacy models
├── routers/              # API route handlers
│   ├── auth_v2.py       # Authentication
│   ├── organizations.py # Organizations
│   ├── properties.py     # Properties
│   ├── units.py         # Units
│   ├── landlords.py     # Landlords
│   ├── tenants.py       # Tenants
│   ├── leases.py        # Leases
│   ├── work_orders.py   # Work Orders
│   ├── attachments.py   # File attachments
│   ├── notifications.py # Notifications
│   ├── audit_logs.py    # Audit logs
│   └── users.py         # User management
├── schemas/              # Pydantic schemas
│   ├── auth.py          # Auth schemas
│   ├── organization.py  # Organization schemas
│   ├── property.py      # Property schemas
│   └── ...              # Other domain schemas
├── scripts/              # Utility scripts
│   └── seed_v2.py       # Seed test data
├── main.py               # FastAPI app entry point
└── requirements.txt      # Python dependencies
```

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user@localhost:5432/dbname

# JWT
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Integration with Next.js Frontend

The Next.js frontend proxies API requests to FastAPI:

- `/api/v2/*` → `http://localhost:8000/api/v2/*`
- `/api/v1/properties/*` → `http://localhost:8000/api/v2/properties/*`
- `/api/v1/tenants/*` → `http://localhost:8000/api/v2/tenants/*`
- etc.

See `apps/web-app/next.config.js` for full rewrite rules.

## Notes

- All v2 endpoints use UUID primary keys
- Legacy Prisma tables are preserved with `_legacy_prisma` suffix
- File uploads are stored locally (S3-ready for future migration)
- JWT tokens are stored in localStorage (should use httpOnly cookies in production)
