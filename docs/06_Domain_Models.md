# Pinaka v2 - Domain Models

## Overview

Pinaka v2 follows Domain-Driven Design (DDD) principles, organizing business logic into bounded contexts. Each domain encapsulates entities, value objects, repositories, and services.

## UML Class Diagrams

Detailed UML class diagrams for all domain models:

- **[Users & RBAC](./diagrams/uml-users.md)** - User authentication and role-based access control models
- **[Organizations](./diagrams/uml-organizations.md)** - Organization domain and multi-tenancy scoping
- **[Portfolio](./diagrams/uml-portfolio.md)** - Properties, units, landlords, tenants, leases, and rent payments
- **[Work Orders](./diagrams/uml-workorders.md)** - Vendors, work orders, assignments, comments, and expenses
- **[Documents](./diagrams/uml-documents.md)** - Attachments, forms, and digital signatures
- **[Messaging](./diagrams/uml-messaging.md)** - Conversations, messages, participants, and notifications

## API Sequence Diagrams

For detailed request flows showing how domain models interact through API endpoints, see:

- **[API Sequence Diagrams](./diagrams/api-sequences/README.md)** - Complete sequence diagrams for all API endpoints organized by domain

## Domain Structure

```
domains/
├── property/          # Property domain
├── unit/              # Unit domain
├── tenant/            # Tenant domain
├── landlord/          # Landlord domain
├── lease/             # Lease domain
├── work-order/        # Maintenance domain (work orders)
├── vendor/            # Vendor domain
├── organization/      # Organization domain
├── user/              # User domain
├── notification/      # Notification domain
├── conversation/      # Messaging domain
├── task/              # Task/Calendar domain
├── invitation/        # Invitation domain
├── form/              # Form generation domain
├── rent-payment/      # Rent payment domain
├── expense/           # Expense domain
├── inspection/        # Inspection domain
└── ...
```

## Domain Architecture

Each domain follows a consistent structure:

```
domains/{domain}/
├── domain/              # Pure domain logic
│   ├── {Entity}Repository.ts    # Repository interface
│   ├── {Entity}Service.ts         # Domain service
│   └── index.ts                   # Exports
```

### Domain Layer Rules

1. **Pure Business Logic**: No infrastructure dependencies
2. **Repository Interfaces**: Define data access contracts
3. **Domain Services**: Encapsulate business rules
4. **No External Libraries**: Except Zod for validation

## Core Domains

### Property Domain

**Location**: `domains/property/domain/`

**Entities**:
- Property (aggregate root)
- PropertyRepository (interface)
- PropertyService (domain service)

**Business Rules**:
- Properties belong to organizations
- Properties can have multiple units
- Properties can have one landlord
- Property status: active, inactive, maintenance

**Repository Interface**:
```typescript
interface PropertyRepository {
  findById(id: string): Promise<Property | null>;
  findByOrganization(orgId: string): Promise<Property[]>;
  save(property: Property): Promise<Property>;
  delete(id: string): Promise<void>;
}
```

### Tenant Domain

**Location**: `domains/tenant/domain/`

**Entities**:
- Tenant (aggregate root)
- TenantRepository (interface)
- TenantService (domain service)

**Business Rules**:
- Tenants belong to organizations
- Tenants can have multiple leases
- Tenant status: active, approved, pending, suspended
- Tenant can create work orders

**Repository Interface**:
```typescript
interface TenantRepository {
  findById(id: string): Promise<Tenant | null>;
  findByOrganization(orgId: string): Promise<Tenant[]>;
  findByLease(leaseId: string): Promise<Tenant[]>;
  save(tenant: Tenant): Promise<Tenant>;
}
```

### Lease Domain

**Location**: `domains/lease/domain/`

**Entities**:
- Lease (aggregate root)
- LeaseTenant (value object)
- LeaseRepository (interface)
- LeaseService (domain service)

**Business Rules**:
- Leases belong to organizations
- Leases link units to tenants
- Lease status: pending, active, terminated, expired
- Lease can have multiple tenants (primary + co-tenants)
- Rent amount and due date tracking

**Repository Interface**:
```typescript
interface LeaseRepository {
  findById(id: string): Promise<Lease | null>;
  findByOrganization(orgId: string): Promise<Lease[]>;
  findByUnit(unitId: string): Promise<Lease[]>;
  findByTenant(tenantId: string): Promise<Lease[]>;
  save(lease: Lease): Promise<Lease>;
}
```

### Work Order Domain

**Location**: `domains/maintenance/domain/` (work orders)

**Entities**:
- WorkOrder (aggregate root)
- WorkOrderAssignment (value object)
- WorkOrderComment (value object)
- WorkOrderRepository (interface)
- WorkOrderService (domain service)

**Business Rules**:
- Work orders belong to organizations
- Work orders linked to properties/units
- Work order status: new, in_progress, waiting_on_vendor, completed, canceled
- Work orders can be assigned to vendors
- Work orders can have comments and attachments

**Repository Interface**:
```typescript
interface WorkOrderRepository {
  findById(id: string): Promise<WorkOrder | null>;
  findByOrganization(orgId: string): Promise<WorkOrder[]>;
  findByProperty(propertyId: string): Promise<WorkOrder[]>;
  findByVendor(vendorId: string): Promise<WorkOrder[]>;
  save(workOrder: WorkOrder): Promise<WorkOrder>;
}
```

### Organization Domain

**Location**: `domains/organization/` (implicit, managed in backend)

**Entities**:
- Organization (aggregate root)
- Organization type: PMC, LANDLORD, INTERNAL

**Business Rules**:
- Organizations are the root of multi-tenancy
- All entities scoped to organizations
- SUPER_ADMIN can see all organizations
- Other roles see only their organization

## Domain Events

Domain events represent business occurrences:

**Planned Events**:
- `PropertyCreated`
- `LeaseSigned`
- `WorkOrderCompleted`
- `TenantApproved`
- `RentPaymentReceived`

**Event Structure**:
```typescript
interface DomainEvent {
  eventType: string;
  aggregateId: string;
  occurredAt: Date;
  payload: Record<string, any>;
}
```

## Aggregates

### Property Aggregate

**Root**: Property
**Entities**: Property, Unit (child entities)
**Invariants**:
- Property must have organization
- Units must belong to property
- Property status affects unit availability

### Lease Aggregate

**Root**: Lease
**Entities**: Lease, LeaseTenant (value objects)
**Invariants**:
- Lease must have unit and landlord
- Lease dates must be valid (start < end)
- Rent amount must be positive
- At least one tenant required

### Work Order Aggregate

**Root**: WorkOrder
**Entities**: WorkOrder, WorkOrderAssignment, WorkOrderComment
**Invariants**:
- Work order must have property
- Work order must have creator
- Status transitions must be valid
- Comments belong to work order

## Value Objects

Value objects represent concepts without identity:

- **Address**: Property address (line1, line2, city, state, postal_code, country)
- **Money**: Currency amounts (amount, currency)
- **DateRange**: Start and end dates
- **ContactInfo**: Email, phone, address

## Repository Pattern

### Repository Interfaces

Repositories define data access contracts:

```typescript
interface PropertyRepository {
  // Query methods
  findById(id: string): Promise<Property | null>;
  findByOrganization(orgId: string): Promise<Property[]>;
  findByLandlord(landlordId: string): Promise<Property[]>;
  
  // Command methods
  save(property: Property): Promise<Property>;
  delete(id: string): Promise<void>;
}
```

### Implementation

Repositories are implemented in the infrastructure layer:

- **Backend**: SQLAlchemy models and queries
- **Frontend**: API client calls to FastAPI

## Domain Services

Domain services contain business logic that doesn't belong to a single entity:

### PropertyService

```typescript
class PropertyService {
  async createProperty(data: PropertyCreate): Promise<Property> {
    // Business rules:
    // - Validate organization access
    // - Check landlord exists
    // - Set default status
    // - Create property
  }
  
  async assignToPM(propertyId: string, pmId: string): Promise<void> {
    // Business rules:
    // - Verify PM has access to organization
    // - Assign property to PM
    // - Emit PropertyAssignedToPM event
  }
}
```

### LeaseService

```typescript
class LeaseService {
  async createLease(data: LeaseCreate): Promise<Lease> {
    // Business rules:
    // - Validate unit is available
    // - Check dates don't overlap existing leases
    // - Calculate security deposit
    // - Create lease
  }
  
  async renewLease(leaseId: string, newEndDate: Date): Promise<Lease> {
    // Business rules:
    // - Validate current lease is active
    // - Check new end date is after current end date
    // - Update lease
    // - Emit LeaseRenewed event
  }
}
```

## Bounded Contexts

### Portfolio Context

**Domains**: Property, Unit, Lease, Tenant, Landlord, Vendor
**Purpose**: Core property management operations
**Shared Kernel**: Organization, User

### Maintenance Context

**Domains**: WorkOrder, Vendor
**Purpose**: Maintenance request management
**Shared Kernel**: Property, Unit, Tenant

### Financial Context

**Domains**: RentPayment, Expense
**Purpose**: Financial tracking
**Shared Kernel**: Lease, Property, Organization

### Communication Context

**Domains**: Conversation, Message, Notification
**Purpose**: User communications
**Shared Kernel**: User, Organization

## Domain Boundaries

### Cross-Domain Communication

Domains communicate through:
1. **Shared Kernel**: Common entities (User, Organization)
2. **Domain Events**: Event-driven communication
3. **Application Services**: Orchestration layer

### Dependency Rules

- ❌ **No cross-domain imports** in domain layer
- ✅ **Application layer** can import from multiple domains
- ✅ **Shared kernel** can be imported by all domains

## Implementation Status

### Backend (FastAPI)

- ✅ **Models**: SQLAlchemy models in `db/models_v2.py`
- ✅ **Schemas**: Pydantic schemas in `schemas/`
- ✅ **Routers**: API endpoints in `routers/`
- ✅ **Services**: Business logic in `services/` (partial)

### Frontend (TypeScript)

- ✅ **Domain Types**: Generated from OpenAPI
- ✅ **Domain Services**: TypeScript interfaces in `domains/`
- ⚠️ **Repository Implementation**: Uses API client (not direct DB access)

## Future Enhancements

1. **Event Sourcing**: Full event-driven architecture
2. **CQRS**: Separate read/write models
3. **Domain Events**: Event bus implementation
4. **Aggregate Versioning**: Optimistic concurrency control

---

**Related Documentation**:
- [Architecture](01_Architecture.md) - System architecture
- [Database Schema](04_Database_v2_Schema.md) - Database structure
- [Backend API](02_Backend_API.md) - API endpoints

