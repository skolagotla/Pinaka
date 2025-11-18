# Architecture Migration: Domain-Driven, API-First, Shared-Schema

## Status: ✅ Phase 1 Complete - Property Domain

**Started:** January 2025  
**Approach:** Incremental migration, domain by domain

---

## Overview

Migrating from monolithic API routes to a **Domain-Driven, API-First, Shared-Schema** architecture.

### Key Principles

1. **Domain-Driven Design (DDD)**
   - Code organized by business domains (Properties, Tenants, Leases, etc.)
   - Clear separation of domain logic from infrastructure
   - Domain services handle business rules

2. **API-First**
   - APIs designed as contracts first
   - Versioned APIs (`/api/v1/...`)
   - Standardized request/response formats

3. **Shared Schema (Single Source of Truth)**
   - Zod schemas define validation and types
   - Types automatically inferred from schemas
   - Frontend and backend share the same types
   - No duplicate type definitions

---

## Architecture Structure

```
lib/
├── schemas/                    # Single Source of Truth
│   ├── base.ts                # Common schemas and utilities
│   ├── domains/
│   │   ├── property.schema.ts # Property domain schemas
│   │   ├── tenant.schema.ts   # Tenant domain (to be added)
│   │   └── ...
│   └── index.ts               # Central export
│
├── domains/                    # Domain logic
│   ├── property/
│   │   ├── PropertyService.ts # Business logic
│   │   ├── PropertyRepository.ts # Data access
│   │   └── index.ts
│   └── ...
│
└── api/
    └── handlers.ts            # API handler utilities

pages/api/
├── v1/                        # Versioned APIs (new architecture)
│   └── properties/
│       └── index.ts
└── properties/                # Legacy APIs (backward compatibility)
    └── index.ts
```

---

## Completed Domains

### ✅ Property Domain

### ✅ Schema Layer
- **File:** `lib/schemas/domains/property.schema.ts`
- **Schemas Created:**
  - `propertyCreateSchema` - Create property validation
  - `propertyUpdateSchema` - Update property validation
  - `propertyQuerySchema` - Query parameters validation
  - `propertyResponseSchema` - API response validation
  - `propertyListResponseSchema` - List response validation

### ✅ Domain Layer
- **Repository:** `lib/domains/property/PropertyRepository.ts`
  - Data access layer
  - Handles all database operations
  - Clean separation from business logic

- **Service:** `lib/domains/property/PropertyService.ts`
  - Business logic layer
  - Orchestrates domain operations
  - Handles validation and transformations

### ✅ API Layer
- **New API:** `pages/api/v1/properties/index.ts`
  - Uses shared schemas for validation
  - Uses domain service for business logic
  - Standardized request/response format
  - Type-safe end-to-end

### ✅ Backward Compatibility
- **Legacy API:** `pages/api/properties/index.ts`
  - Still works as before
  - No breaking changes
  - Can migrate gradually

---

## Benefits Achieved

### 1. Type Safety
```typescript
// Frontend and backend share the same types
import { PropertyCreate } from '@/lib/schemas';

// TypeScript knows exactly what fields are required
const property: PropertyCreate = {
  landlordId: '...',
  addressLine1: '...',
  // TypeScript autocomplete works!
};
```

### 2. Validation
```typescript
// Single source of validation
const result = propertyCreateSchema.safeParse(data);
if (!result.success) {
  // Handle validation errors
  // Errors are consistent across frontend/backend
}
```

### 3. Maintainability
- Change schema once → Types update everywhere
- No duplicate type definitions
- Clear domain boundaries

### 4. Developer Experience
- Autocomplete works perfectly
- Type errors caught at compile time
- Self-documenting APIs

---

### ✅ Tenant Domain

#### Schema Layer
- **File:** `lib/schemas/domains/tenant.schema.ts`
- **Schemas Created:**
  - `tenantCreateSchema` - Create tenant validation
  - `tenantUpdateSchema` - Update tenant validation
  - `tenantQuerySchema` - Query parameters validation
  - `tenantResponseSchema` - API response validation
  - `tenantListResponseSchema` - List response validation
  - `emergencyContactSchema` - Emergency contact validation
  - `employerSchema` - Employer validation

#### Domain Layer
- **Repository:** `lib/domains/tenant/TenantRepository.ts`
  - Data access layer
  - Handles all database operations
  - Supports complex queries with relations

- **Service:** `lib/domains/tenant/TenantService.ts`
  - Business logic layer
  - Handles tenant creation/update logic
  - Manages date parsing and country/region mapping

#### API Layer
- **New API:** `pages/api/v1/tenants/index.ts`
  - Uses shared schemas for validation
  - Uses domain service for business logic
  - Supports landlord and PMC access patterns
  - Handles PMC-managed landlord restrictions

---

### ✅ Lease Domain

#### Schema Layer
- **File:** `lib/schemas/domains/lease.schema.ts`
- **Schemas Created:**
  - `leaseCreateSchema` - Create lease validation with date validation
  - `leaseUpdateSchema` - Update lease validation
  - `leaseQuerySchema` - Query parameters validation
  - `leaseResponseSchema` - API response validation
  - `leaseListResponseSchema` - List response validation
  - `leaseTenantSchema` - Lease-tenant relationship validation

#### Domain Layer
- **Repository:** `lib/domains/lease/LeaseRepository.ts`
  - Data access layer with transaction support
  - Handles lease-tenant relationships
  - Manages unit/property status updates on lease status changes

- **Service:** `lib/domains/lease/LeaseService.ts`
  - Business logic layer
  - Date parsing and validation
  - Primary tenant validation
  - Lease date range validation

#### API Layer
- **New API:** `pages/api/v1/leases/index.ts`
  - Uses shared schemas for validation
  - Uses domain service for business logic
  - Supports landlord and PMC access patterns
  - Handles unit/property status updates automatically

---

### ✅ Rent Payment Domain

#### Schema Layer
- **File:** `lib/schemas/domains/rent-payment.schema.ts`
- **Schemas Created:**
  - `rentPaymentCreateSchema` - Create rent payment validation
  - `rentPaymentUpdateSchema` - Update rent payment validation
  - `rentPaymentQuerySchema` - Query parameters with date range filters
  - `rentPaymentResponseSchema` - API response validation
  - `recordPaymentSchema` - Record payment (mark as paid) validation
  - `createPartialPaymentSchema` - Create partial payment validation
  - `partialPaymentSchema` - Partial payment validation

#### Domain Layer
- **Repository:** `lib/domains/rent-payment/RentPaymentRepository.ts`
  - Data access layer
  - Handles complex queries with lease/property/tenant filters
  - Supports date range filtering
  - Includes partial payments and Stripe payment data

- **Service:** `lib/domains/rent-payment/RentPaymentService.ts`
  - Business logic layer
  - Prevents duplicate payments (same lease + due date)
  - Handles partial payment creation with balance validation
  - Manages payment status updates
  - Date parsing and validation

#### API Layer
- **New API:** `pages/api/v1/rent-payments/index.ts`
  - Uses shared schemas for validation
  - Uses domain service for business logic
  - Supports landlord and PMC access patterns
  - Calculates total partial payments
  - Includes Stripe payment status

---

## Next Steps

### ✅ Maintenance Request Domain

#### Schema Layer
- **File:** `lib/schemas/domains/maintenance.schema.ts`
- **Schemas Created:**
  - `maintenanceRequestCreateSchema` - Create maintenance request validation
  - `maintenanceRequestUpdateSchema` - Update maintenance request validation
  - `maintenanceRequestQuerySchema` - Query parameters with date range filters
  - `maintenanceRequestResponseSchema` - API response validation
  - `maintenanceCommentSchema` - Comment validation

#### Domain Layer
- **Repository:** `lib/domains/maintenance/MaintenanceRepository.ts`
  - Data access layer
  - Handles complex queries with property/tenant filters
  - Supports date range filtering
  - Includes comments and assigned provider data

- **Service:** `lib/domains/maintenance/MaintenanceService.ts`
  - Business logic layer
  - Generates ticket numbers automatically
  - Handles date parsing and validation

#### API Layer
- **New API:** `pages/api/v1/maintenance/index.ts`
  - Uses shared schemas for validation
  - Uses domain service for business logic
  - Supports landlord, PMC, and tenant access patterns

---

### ✅ Document Domain

#### Schema Layer
- **File:** `lib/schemas/domains/document.schema.ts`
- **Schemas Created:**
  - `documentCreateSchema` - Create document validation
  - `documentUpdateSchema` - Update document validation
  - `documentQuerySchema` - Query parameters with filters
  - `documentResponseSchema` - API response validation

#### Domain Layer
- **Repository:** `lib/domains/document/DocumentRepository.ts`
  - Data access layer
  - Handles soft delete operations
  - Supports expiration date filtering

- **Service:** `lib/domains/document/DocumentService.ts`
  - Business logic layer
  - Generates document hashes
  - Handles date parsing and validation

#### API Layer
- **New API:** `pages/api/v1/documents/index.ts`
  - Uses shared schemas for validation
  - Uses domain service for business logic
  - Supports tenant, landlord, and PMC access patterns
  - Handles document metadata (file uploads handled separately)

---

### ✅ Expense Domain

#### Schema Layer
- **File:** `lib/schemas/domains/expense.schema.ts`
- **Schemas Created:**
  - `expenseCreateSchema` - Create expense validation
  - `expenseUpdateSchema` - Update expense validation
  - `expenseQuerySchema` - Query parameters with date range filters
  - `expenseResponseSchema` - API response validation

#### Domain Layer
- **Repository:** `lib/domains/expense/ExpenseRepository.ts`
  - Data access layer
  - Handles complex queries with property/maintenance filters
  - Supports date range filtering
  - Includes PMC approval request data

- **Service:** `lib/domains/expense/ExpenseService.ts`
  - Business logic layer
  - Auto-resolves propertyId from maintenanceRequestId if needed
  - Validates property or maintenance request requirement
  - Handles date parsing and validation

#### API Layer
- **New API:** `pages/api/v1/expenses/index.ts`
  - Uses shared schemas for validation
  - Uses domain service for business logic
  - Supports landlord and PMC access patterns
  - Handles vendorId -> paidTo mapping

---

### ✅ Inspection Domain

#### Schema Layer
- **File:** `lib/schemas/domains/inspection.schema.ts`
- **Schemas Created:**
  - `inspectionChecklistCreateSchema` - Create inspection validation
  - `inspectionChecklistUpdateSchema` - Update inspection validation
  - `inspectionChecklistQuerySchema` - Query parameters
  - `inspectionChecklistResponseSchema` - API response validation

#### Domain Layer
- **Repository:** `lib/domains/inspection/InspectionRepository.ts`
- **Service:** `lib/domains/inspection/InspectionService.ts`

#### API Layer
- **New API:** `pages/api/v1/inspections/index.ts`
  - Supports tenant, landlord, and PMC access patterns
  - Handles inspection requests and creation

---

### ✅ Vendor Domain

#### Schema Layer
- **File:** `lib/schemas/domains/vendor.schema.ts`
- **Schemas Created:**
  - `serviceProviderCreateSchema` - Create vendor validation
  - `serviceProviderUpdateSchema` - Update vendor validation
  - `serviceProviderQuerySchema` - Query parameters with search
  - `serviceProviderResponseSchema` - API response validation

#### Domain Layer
- **Repository:** `lib/domains/vendor/VendorRepository.ts`
- **Service:** `lib/domains/vendor/VendorService.ts`

#### API Layer
- **New API:** `pages/api/v1/vendors/index.ts`
  - Supports landlord and PMC access patterns
  - Handles global and local vendor filtering
  - Supports soft delete

---

### ✅ Conversation Domain

#### Schema Layer
- **File:** `lib/schemas/domains/conversation.schema.ts`
- **Schemas Created:**
  - `conversationCreateSchema` - Create conversation validation
  - `messageCreateSchema` - Create message validation
  - `conversationQuerySchema` - Query parameters
  - `conversationResponseSchema` - API response validation

#### Domain Layer
- **Repository:** `lib/domains/conversation/ConversationRepository.ts`
- **Service:** `lib/domains/conversation/ConversationService.ts`

#### API Layer
- **New API:** `pages/api/v1/conversations/index.ts`
  - Supports landlord, PMC, and tenant access patterns
  - Enforces communication restrictions (LANDLORD_PMC, PMC_TENANT)
  - Handles message creation

---

### ✅ Application Domain

#### Schema Layer
- **File:** `lib/schemas/domains/application.schema.ts`
- **Schemas Created:**
  - `applicationCreateSchema` - Create application validation
  - `applicationUpdateSchema` - Update application validation
  - `applicationQuerySchema` - Query parameters
  - `applicationResponseSchema` - API response validation

#### Domain Layer
- **Repository:** `lib/domains/application/ApplicationRepository.ts`
- **Service:** `lib/domains/application/ApplicationService.ts`

#### API Layer
- **New API:** `pages/api/v1/applications/index.ts`
  - Supports tenant, landlord, and PMC access patterns
  - Handles application creation with 1-week deadline
  - Supports status updates and screening

---

### ✅ Notification Domain

#### Schema Layer
- **File:** `lib/schemas/domains/notification.schema.ts`
- **Schemas Created:**
  - `notificationCreateSchema` - Create notification validation
  - `notificationUpdateSchema` - Update notification validation
  - `notificationQuerySchema` - Query parameters with filters
  - `notificationResponseSchema` - API response validation
  - `notificationPreferenceSchema` - Preference validation

#### Domain Layer
- **Repository:** `lib/domains/notification/NotificationRepository.ts`
  - Data access layer
  - Handles unread/archived filtering
  - Supports mark all as read

- **Service:** `lib/domains/notification/NotificationService.ts`
  - Business logic layer
  - Manages notification lifecycle

#### API Layer
- **New API:** `pages/api/v1/notifications/index.ts`
  - Supports all user roles
  - Handles read/archive operations
  - Supports mark all as read
  - Admin-only creation

---

### ✅ Task Domain

#### Schema Layer
- **File:** `lib/schemas/domains/task.schema.ts`
- **Schemas Created:**
  - `taskCreateSchema` - Create task validation
  - `taskUpdateSchema` - Update task validation
  - `taskQuerySchema` - Query parameters with date range filters
  - `taskResponseSchema` - API response validation

#### Domain Layer
- **Repository:** `lib/domains/task/TaskRepository.ts`
  - Data access layer
  - Handles date range filtering
  - Supports property linking

- **Service:** `lib/domains/task/TaskService.ts`
  - Business logic layer
  - Auto-infers propertyId from linkedEntity
  - Handles date parsing and validation

#### API Layer
- **New API:** `pages/api/v1/tasks/index.ts`
  - Supports all user roles
  - Handles task CRUD operations
  - Supports property linking

---

### ✅ Invitation Domain

#### Schema Layer
- **File:** `lib/schemas/domains/invitation.schema.ts`
- **Schemas Created:**
  - `invitationCreateSchema` - Create invitation validation
  - `invitationUpdateSchema` - Update invitation validation
  - `invitationQuerySchema` - Query parameters with filters
  - `invitationResponseSchema` - API response validation
  - `invitationListResponseSchema` - List response validation

#### Domain Layer
- **Repository:** `lib/domains/invitation/InvitationRepository.ts`
  - Data access layer
  - Handles RBAC filtering by inviter role
  - Supports approval status lookup for completed invitations

- **Service:** `lib/domains/invitation/InvitationService.ts`
  - Business logic layer
  - Validates invitation types and permissions
  - Handles email sending
  - Prevents duplicate invitations

#### API Layer
- **New API:** `pages/api/v1/invitations/index.ts`
  - Supports admin, landlord, and PMC roles
  - Handles invitation creation with email sending
  - Supports filtering and pagination

---

### ✅ Analytics Domain

#### Schema Layer
- **File:** `lib/schemas/domains/analytics.schema.ts`
- **Schemas Created:**
  - `propertyPerformanceQuerySchema` - Property performance query validation
  - `portfolioPerformanceQuerySchema` - Portfolio performance query validation
  - `tenantDelinquencyRiskQuerySchema` - Tenant risk query validation
  - `cashFlowForecastQuerySchema` - Cash flow forecast query validation
  - Response schemas for each analytics endpoint

#### Domain Layer
- **Service:** Uses existing `lib/services/analytics-service.js`
  - Read-only analytics endpoints
  - No repository layer needed (direct service calls)

#### API Layer
- **New APIs:**
  - `pages/api/v1/analytics/property-performance.ts`
  - `pages/api/v1/analytics/portfolio-performance.ts`
  - `pages/api/v1/analytics/tenant-delinquency-risk.ts`
  - `pages/api/v1/analytics/cash-flow-forecast.ts`
  - All endpoints are GET-only (read-only analytics)

---

### Phase 15: Frontend Migration (Next)
- Update API client to use v1 endpoints
- Migrate components to use new schemas
- Update form validation
- Test end-to-end flows

---

## Migration Strategy

### Incremental Approach
1. ✅ Start with one domain (Properties)
2. ⏳ Migrate domain by domain
3. ⏳ Keep legacy APIs working
4. ⏳ Update frontend gradually
5. ⏳ Deprecate legacy APIs once migration complete

### No Breaking Changes
- Legacy APIs continue to work
- New APIs are versioned (`/api/v1/...`)
- Frontend can use either API during migration
- Gradual migration reduces risk

---

## Usage Examples

### Backend (API Route)
```typescript
import { propertyCreateSchema, PropertyCreate } from '@/lib/schemas';
import { PropertyService, PropertyRepository } from '@/lib/domains/property';

// Validate request body
const validatedData = propertyCreateSchema.parse(req.body);

// Use domain service
const repository = new PropertyRepository(prisma);
const service = new PropertyService(repository);
const property = await service.create(validatedData, { userId, organizationId });
```

### Frontend (Component)
```typescript
import { PropertyCreate, propertyCreateSchema } from '@/lib/schemas';

// Type-safe form state
const [formData, setFormData] = useState<PropertyCreate>({
  landlordId: '...',
  addressLine1: '',
  // TypeScript autocomplete!
});

// Validate before submit
const result = propertyCreateSchema.safeParse(formData);
if (!result.success) {
  // Handle validation errors
}
```

---

## Files Created

### Schemas
- ✅ `lib/schemas/base.ts`
- ✅ `lib/schemas/domains/property.schema.ts`
- ✅ `lib/schemas/index.ts`
- ✅ `lib/schemas/README.md`

### Domain Layer
- ✅ `lib/domains/property/PropertyRepository.ts`
- ✅ `lib/domains/property/PropertyService.ts`
- ✅ `lib/domains/property/index.ts`

### API Layer
- ✅ `lib/api/handlers.ts`
- ✅ `pages/api/v1/properties/index.ts`

---

## Progress

- ✅ **Phase 1:** Foundation & Property Domain (Complete)
- ✅ **Phase 2:** Tenant Domain (Complete)
- ✅ **Phase 3:** Lease Domain (Complete)
- ✅ **Phase 4:** Rent Payment Domain (Complete)
- ✅ **Phase 5:** Maintenance Request Domain (Complete)
- ✅ **Phase 6:** Document Domain (Complete)
- ✅ **Phase 7:** Expense Domain (Complete)
- ✅ **Phase 8:** Inspection Domain (Complete)
- ✅ **Phase 9:** Vendor Domain (Complete)
- ✅ **Phase 10:** Conversation Domain (Complete)
- ✅ **Phase 11:** Application Domain (Complete)
- ✅ **Phase 12:** Notification Domain (Complete)
- ✅ **Phase 13:** Task Domain (Complete)
- ⏳ **Phase 14:** Remaining Domains
- ⏳ **Phase 15:** Frontend Migration
- ⏳ **Phase 16:** Legacy API Deprecation

**Current Status:** 13 domains migrated (Properties, Tenants, Leases, Rent Payments, Maintenance Requests, Documents, Expenses, Inspections, Vendors, Conversations, Applications, Notifications, Tasks)  
**Total Domains:** ~15 domains to migrate  
**Progress:** ~87% complete

---

**Last Updated:** January 2025

