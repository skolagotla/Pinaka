# Pinaka v2 - Database Schema

## Overview

The Pinaka v2 database uses PostgreSQL with a schema designed for organization-aware multi-tenancy. All tables use UUID primary keys, snake_case naming, and include organization scoping.

## Database Diagrams

- **[Complete Database ERD](./diagrams/07-database-erd.md)** - Full entity-relationship diagram showing all tables, relationships, and foreign keys
- **[UML Class Diagrams](./diagrams/README.md#uml-class-diagrams)** - UML class diagrams for all domain models:
  - [Users & RBAC](./diagrams/uml-users.md) - User authentication and role-based access control
  - [Organizations](./diagrams/uml-organizations.md) - Organization domain and multi-tenancy
  - [Portfolio](./diagrams/uml-portfolio.md) - Properties, units, landlords, tenants, leases
  - [Work Orders](./diagrams/uml-workorders.md) - Vendors and work order management
  - [Documents](./diagrams/uml-documents.md) - Attachments, forms, and signatures
  - [Messaging](./diagrams/uml-messaging.md) - Conversations, messages, and notifications

## Schema Design Principles

1. **UUID Primary Keys**: All tables use UUID for primary keys
2. **Organization Scoping**: All entity tables include `organization_id`
3. **Soft Deletes**: Status fields instead of hard deletes (where applicable)
4. **Timestamps**: `created_at` and `updated_at` on all tables
5. **Indexes**: Optimized indexes for common queries
6. **Foreign Keys**: Proper referential integrity

## Core Tables

### Organizations

**Table**: `organizations`

Multi-tenant organization support. All data is scoped to organizations.

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,  -- 'PMC', 'LANDLORD', 'INTERNAL'
    timezone TEXT,
    country TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Relationships**:
- One-to-many with `users`, `properties`, `leases`, `work_orders`, etc.

### Users

**Table**: `users`

Unified user model for all user types.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    status TEXT DEFAULT 'active',  -- 'active', 'invited', 'suspended'
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_step INTEGER DEFAULT 0,
    onboarding_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes**:
- `idx_users_email` (unique)
- `idx_users_organization_id`

**Relationships**:
- Many-to-many with `roles` via `user_roles`
- One-to-many with `work_orders`, `notifications`, `audit_logs`

### Roles

**Table**: `roles`

Role definitions.

```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,  -- 'super_admin', 'pmc_admin', 'pm', 'landlord', 'tenant', 'vendor'
    description TEXT
);
```

**Roles**:
- `super_admin` - Full system access
- `pmc_admin` - PMC administrator
- `pm` - Property manager
- `landlord` - Property owner
- `tenant` - Lease holder
- `vendor` - Service provider

### UserRoles

**Table**: `user_roles`

User-role assignments with organization scoping.

```sql
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role_id, organization_id)
);
```

**Indexes**:
- `idx_user_roles_user_id`
- `idx_user_roles_role_id`
- `idx_user_roles_organization_id`

## Entity Tables

### Properties

**Table**: `properties`

Real estate properties.

```sql
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    landlord_id UUID REFERENCES landlords(id) ON DELETE SET NULL,
    name TEXT,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes**:
- `idx_properties_organization_id`
- `idx_properties_org_landlord` (composite)

**Relationships**:
- Many-to-one with `organizations`
- Many-to-one with `landlords`
- One-to-many with `units`, `work_orders`

### Units

**Table**: `units`

Individual units within properties.

```sql
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    unit_number TEXT NOT NULL,
    floor TEXT,
    bedrooms INTEGER,
    bathrooms INTEGER,
    size_sqft INTEGER,
    status TEXT DEFAULT 'vacant',  -- 'vacant', 'occupied', 'maintenance'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(property_id, unit_number)
);
```

**Indexes**:
- `idx_units_property_id`

**Relationships**:
- Many-to-one with `properties`
- One-to-many with `leases`, `work_orders`

### Landlords

**Table**: `landlords`

Property owners.

```sql
CREATE TABLE landlords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes**:
- `idx_landlords_organization_id`
- `idx_landlords_user_id`

**Relationships**:
- Many-to-one with `organizations`
- Optional one-to-one with `users`
- One-to-many with `properties`, `leases`

### Tenants

**Table**: `tenants`

Renters/lease holders.

```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes**:
- `idx_tenants_organization_id`
- `idx_tenants_user_id`

**Relationships**:
- Many-to-one with `organizations`
- Optional one-to-one with `users`
- Many-to-many with `leases` via `lease_tenants`
- One-to-many with `work_orders`, `rent_payments`

### Vendors

**Table**: `vendors`

Service providers.

```sql
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    service_types TEXT[],  -- Array of service types
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes**:
- `idx_vendors_organization_id`

**Relationships**:
- Many-to-one with `organizations`
- Many-to-many with `work_orders` via `work_order_assignments`

### Leases

**Table**: `leases`

Rental agreements.

```sql
CREATE TABLE leases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    unit_id UUID REFERENCES units(id) ON DELETE CASCADE NOT NULL,
    landlord_id UUID REFERENCES landlords(id) ON DELETE CASCADE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    rent_amount NUMERIC(12, 2) NOT NULL,
    rent_due_day INTEGER,  -- 1-31
    security_deposit NUMERIC(12, 2),
    status TEXT DEFAULT 'pending',  -- 'pending', 'active', 'terminated', 'expired'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes**:
- `idx_leases_organization_id`
- `idx_leases_org_unit_status` (composite)

**Relationships**:
- Many-to-one with `organizations`, `units`, `landlords`
- Many-to-many with `tenants` via `lease_tenants`
- One-to-many with `rent_payments`

### LeaseTenants

**Table**: `lease_tenants`

Many-to-many relationship between leases and tenants.

```sql
CREATE TABLE lease_tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id UUID REFERENCES leases(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(lease_id, tenant_id)
);
```

**Indexes**:
- `idx_lease_tenants_lease_id`
- `idx_lease_tenants_tenant_id`

## Work Order Tables

### WorkOrders

**Table**: `work_orders`

Maintenance requests.

```sql
CREATE TABLE work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    created_by_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'new',  -- 'new', 'in_progress', 'waiting_on_vendor', 'completed', 'canceled'
    priority TEXT DEFAULT 'medium',  -- 'low', 'medium', 'high', 'emergency'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);
```

**Indexes**:
- `idx_work_orders_organization_id`
- `idx_work_orders_org_status` (composite)
- `idx_work_orders_property_status` (composite)
- `idx_work_orders_tenant_id`
- `idx_work_orders_created_by`

**Relationships**:
- Many-to-one with `organizations`, `properties`, `units`, `tenants`, `users`
- One-to-many with `work_order_assignments`, `work_order_comments`, `attachments`

### WorkOrderAssignments

**Table**: `work_order_assignments`

Vendor assignments to work orders.

```sql
CREATE TABLE work_order_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE NOT NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
    assigned_by_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'assigned',  -- 'assigned', 'accepted', 'rejected', 'completed'
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes**:
- `idx_work_order_assignments_work_order_id`
- `idx_work_order_assignments_vendor_id`

### WorkOrderComments

**Table**: `work_order_comments`

Discussion threads on work orders.

```sql
CREATE TABLE work_order_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE NOT NULL,
    author_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes**:
- `idx_work_order_comments_work_order_id`

## Supporting Tables

### Attachments

**Table**: `attachments`

Generic file attachments (S3-ready).

```sql
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    entity_type TEXT NOT NULL,  -- 'work_order', 'message', 'lease', 'property', etc.
    entity_id UUID NOT NULL,
    storage_key TEXT NOT NULL,  -- local file path now, S3 key later
    file_name TEXT NOT NULL,
    mime_type TEXT,
    file_size_bytes BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes**:
- `idx_attachments_org_entity` (composite: organization_id, entity_type, entity_id)

### Notifications

**Table**: `notifications`

User notifications.

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    type TEXT NOT NULL,  -- 'MESSAGE_RECEIVED', 'WORK_ORDER_UPDATED', 'RENT_DUE', etc.
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);
```

**Indexes**:
- `idx_notifications_user_read_created` (composite: user_id, is_read, created_at)

### AuditLogs

**Table**: `audit_logs`

Action audit trail.

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    actor_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,  -- 'ROLE_CHANGED', 'USER_IMPERSONATED', 'LEASE_CREATED', etc.
    entity_type TEXT,
    entity_id UUID,
    extra_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes**:
- `idx_audit_logs_org_created` (composite: organization_id, created_at)
- `idx_audit_logs_actor_created` (composite: actor_user_id, created_at)

### Tasks

**Table**: `tasks`

Calendar and to-do items.

```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    created_by_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,  -- 'rent', 'lease', 'maintenance', 'legal', 'inspection', 'general'
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    priority TEXT DEFAULT 'medium',  -- 'low', 'medium', 'high', 'urgent'
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes**:
- `idx_tasks_org_due_date` (composite: organization_id, due_date)
- `idx_tasks_created_by`
- `idx_tasks_property_id`

### Conversations

**Table**: `conversations`

Messaging conversations.

```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    created_by_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    entity_type TEXT,  -- 'work_order', 'lease', 'property', etc.
    entity_id UUID,
    subject TEXT,
    status TEXT DEFAULT 'active',  -- 'active', 'archived', 'closed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes**:
- `idx_conversations_org_entity` (composite: organization_id, entity_type, entity_id)
- `idx_conversations_created_by`

### Messages

**Table**: `messages`

Messages within conversations.

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    sender_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes**:
- `idx_messages_conversation_created` (composite: conversation_id, created_at)
- `idx_messages_sender`

### RentPayments

**Table**: `rent_payments`

Rent payment tracking.

```sql
CREATE TABLE rent_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    lease_id UUID REFERENCES leases(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method TEXT,  -- 'check', 'bank_transfer', 'credit_card', 'cash', etc.
    status TEXT DEFAULT 'pending',  -- 'pending', 'completed', 'failed', 'refunded'
    reference_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes**:
- `idx_rent_payments_lease_date` (composite: lease_id, payment_date)
- `idx_rent_payments_tenant`
- `idx_rent_payments_status`

### Expenses

**Table**: `expenses`

Expense management.

```sql
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    category TEXT NOT NULL,  -- 'maintenance', 'utilities', 'insurance', 'taxes', etc.
    amount NUMERIC(12, 2) NOT NULL,
    expense_date DATE NOT NULL,
    description TEXT,
    receipt_attachment_id UUID REFERENCES attachments(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending',  -- 'pending', 'approved', 'rejected', 'paid'
    created_by_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes**:
- `idx_expenses_org_date` (composite: organization_id, expense_date)
- `idx_expenses_property`
- `idx_expenses_category`

## Entity Relationship Diagram

```
┌──────────────┐
│ Organizations│
└──────┬───────┘
       │
       ├─── Users ─── UserRoles ─── Roles
       │
       ├─── Properties ─── Units ─── Leases ─── LeaseTenants ─── Tenants
       │       │                          │
       │       └─── WorkOrders ─── WorkOrderAssignments ─── Vendors
       │
       ├─── Landlords
       │
       ├─── Attachments
       ├─── Notifications
       ├─── AuditLogs
       ├─── Tasks
       ├─── Conversations ─── Messages
       ├─── RentPayments
       └─── Expenses
```

## Organization Scoping Rules

### Automatic Filtering

All entity queries automatically filter by `organization_id`:

- **SUPER_ADMIN**: No filter (sees all organizations)
- **Other roles**: Filtered by `user.organization_id`

### Scoping Examples

**Properties**:
```sql
-- SUPER_ADMIN sees all
SELECT * FROM properties;

-- Other roles see only their organization
SELECT * FROM properties WHERE organization_id = :user_org_id;
```

**Work Orders**:
```sql
-- SUPER_ADMIN sees all
SELECT * FROM work_orders;

-- Other roles see only their organization
SELECT * FROM work_orders WHERE organization_id = :user_org_id;
```

## Indexes

### Performance Indexes

All tables include indexes for common query patterns:

- **Organization filtering**: `idx_*_organization_id`
- **Status filtering**: `idx_*_status` or composite indexes
- **Date sorting**: `idx_*_created_at` or `idx_*_date`
- **Foreign keys**: Indexed for join performance

### Composite Indexes

Common composite indexes for multi-column queries:

- `idx_properties_org_landlord` (organization_id, landlord_id)
- `idx_leases_org_unit_status` (organization_id, unit_id, status)
- `idx_work_orders_org_status` (organization_id, status)
- `idx_notifications_user_read_created` (user_id, is_read, created_at)

## Migrations

Database migrations are managed with Alembic:

```bash
# Create migration
cd apps/backend-api
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

**Migration Files**: `apps/backend-api/alembic/versions/`

## Data Types

### UUID
- Primary keys: `UUID` (PostgreSQL UUID type)
- Foreign keys: `UUID` references

### Text
- Names, descriptions: `TEXT`
- Status fields: `TEXT` with default values
- Email, phone: `TEXT` (nullable)

### Numeric
- Money amounts: `NUMERIC(12, 2)`
- Counts: `INTEGER`

### Dates
- Dates: `DATE`
- Timestamps: `TIMESTAMP WITH TIME ZONE`

### JSON
- Flexible data: `JSONB` (PostgreSQL JSONB type)
- Onboarding data, form data, metadata

### Arrays
- Service types: `TEXT[]` (PostgreSQL array type)

## Constraints

### Unique Constraints

- `users.email` - Unique email addresses
- `roles.name` - Unique role names
- `user_roles(user_id, role_id, organization_id)` - Unique role assignments
- `units(property_id, unit_number)` - Unique unit numbers per property
- `lease_tenants(lease_id, tenant_id)` - Unique lease-tenant pairs

### Foreign Key Constraints

All foreign keys use appropriate `ON DELETE` actions:

- `CASCADE`: Delete related records (e.g., units when property deleted)
- `SET NULL`: Set to null (e.g., user_id when user deleted)
- `RESTRICT`: Prevent deletion if references exist

## Best Practices

### Querying

1. **Always include organization filter** (except SUPER_ADMIN)
2. **Use eager loading** to prevent N+1 queries
3. **Use indexes** for filtered columns
4. **Paginate** large result sets

### Indexing

1. **Index foreign keys** for join performance
2. **Composite indexes** for multi-column filters
3. **Index status fields** for filtering
4. **Index date fields** for sorting

### Data Integrity

1. **Use foreign keys** for referential integrity
2. **Use constraints** for data validation
3. **Use transactions** for multi-step operations
4. **Use soft deletes** where appropriate (status fields)

---

**Related Documentation**:
- [Architecture](01_Architecture.md) - System architecture
- [Backend API](02_Backend_API.md) - API usage
- [RBAC](05_RBAC_Roles_and_Permissions.md) - Access control

