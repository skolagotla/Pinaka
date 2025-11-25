# API Types and Schemas

## Overview

This document provides complete type definitions for all API request and response models in Pinaka v2.

## Common Types

### UUID

All IDs are UUIDs (Universally Unique Identifiers):
```
550e8400-e29b-41d4-a716-446655440000
```

### DateTime

ISO 8601 formatted datetime strings:
```
2025-01-15T10:30:00Z
```

### Date

ISO 8601 formatted date strings:
```
2025-01-15
```

### Email

Email addresses validated as `EmailStr`:
```
user@example.com
```

### Decimal

Monetary amounts use `Decimal` with 2 decimal places:
```
1234.56
```

## Authentication Schemas

### Token

```typescript
{
  access_token: string;
  token_type: "bearer";
}
```

### CurrentUser

```typescript
{
  user: User;
  roles: Role[];
  organization_id: UUID | null;
}
```

### UserLogin

```typescript
{
  email: EmailStr;
  password: string; // min 8 characters
}
```

## User Schemas

### User

```typescript
{
  id: UUID;
  email: EmailStr;
  full_name: string | null;
  phone: string | null;
  organization_id: UUID | null;
  status: string; // "active" | "suspended" | "inactive"
  onboarding_completed: boolean;
  onboarding_step: number;
  onboarding_data: object | null;
  created_at: DateTime;
  updated_at: DateTime;
  roles?: Role[];
}
```

### UserCreate

```typescript
{
  email: EmailStr;
  password: string; // min 8 characters
  full_name: string | null;
  phone: string | null;
  organization_id: UUID | null;
}
```

### UserUpdate

```typescript
{
  email?: EmailStr;
  full_name?: string;
  phone?: string;
  status?: string;
  onboarding_completed?: boolean;
  onboarding_step?: number;
  onboarding_data?: object;
}
```

### UserWithRoles

Extends `User` with required `roles` array:
```typescript
User & {
  roles: Role[];
}
```

## Organization Schemas

### Organization

```typescript
{
  id: UUID;
  name: string;
  type: string; // "PMC" | "LANDLORD" | "INTERNAL"
  timezone: string | null;
  country: string | null;
  created_at: DateTime;
}
```

### OrganizationCreate

```typescript
{
  name: string;
  type: string;
  timezone?: string;
  country?: string;
}
```

### OrganizationUpdate

```typescript
{
  name?: string;
  type?: string;
  timezone?: string;
  country?: string;
}
```

## Property Schemas

### Property

```typescript
{
  id: UUID;
  name: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  status: string; // default: "active"
  organization_id: UUID;
  landlord_id: UUID | null;
  created_at: DateTime;
}
```

### PropertyCreate

```typescript
{
  name?: string;
  address_line1: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  status?: string; // default: "active"
  organization_id: UUID;
  landlord_id?: UUID;
}
```

### PropertyUpdate

All fields optional:
```typescript
{
  name?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  status?: string;
  landlord_id?: UUID;
}
```

## Unit Schemas

### Unit

```typescript
{
  id: UUID;
  unit_number: string;
  floor: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  size_sqft: number | null;
  status: string; // "vacant" | "occupied" | "maintenance"
  property_id: UUID;
  created_at: DateTime;
}
```

### UnitCreate

```typescript
{
  unit_number: string;
  floor?: string;
  bedrooms?: number;
  bathrooms?: number;
  size_sqft?: number;
  status?: string; // default: "vacant"
  property_id: UUID;
}
```

### UnitUpdate

All fields optional.

## Landlord Schemas

### Landlord

```typescript
{
  id: UUID;
  name: string;
  email: EmailStr | null;
  phone: string | null;
  status: string; // default: "active"
  organization_id: UUID;
  user_id: UUID | null;
  created_at: DateTime;
}
```

### LandlordCreate

```typescript
{
  name: string;
  email?: EmailStr;
  phone?: string;
  status?: string; // default: "active"
  organization_id: UUID;
  user_id?: UUID;
}
```

## Tenant Schemas

### Tenant

```typescript
{
  id: UUID;
  name: string;
  email: EmailStr | null;
  phone: string | null;
  status: string; // default: "active"
  organization_id: UUID;
  user_id: UUID | null;
  created_at: DateTime;
}
```

### TenantCreate

```typescript
{
  name: string;
  email?: EmailStr;
  phone?: string;
  status?: string; // default: "active"
  organization_id: UUID;
  user_id?: UUID;
}
```

### TenantApprovalRequest

```typescript
{} // Empty object
```

### TenantRejectionRequest

```typescript
{
  reason?: string;
}
```

## Lease Schemas

### Lease

```typescript
{
  id: UUID;
  start_date: Date;
  end_date: Date;
  rent_amount: number;
  rent_due_day: number | null; // 1-31
  security_deposit: number | null;
  status: string; // "pending" | "active" | "terminated" | "expired"
  organization_id: UUID;
  unit_id: UUID;
  landlord_id: UUID;
  tenant_id: UUID | null;
  created_at: DateTime;
  updated_at: DateTime | null;
}
```

### LeaseCreate

```typescript
{
  start_date: Date;
  end_date: Date;
  rent_amount: number;
  rent_due_day?: number;
  security_deposit?: number;
  status?: string; // default: "pending"
  organization_id: UUID;
  unit_id: UUID;
  landlord_id: UUID;
  tenant_id: UUID; // Primary tenant
}
```

### LeaseRenewalRequest

```typescript
{
  decision: string; // "renew" | "month-to-month" | "terminate"
  new_lease_end?: Date;
  new_rent_amount?: number;
}
```

### LeaseTerminationRequest

```typescript
{
  termination_date: Date;
  reason?: string;
  actual_loss?: number;
}
```

## Work Order Schemas

### WorkOrder

```typescript
{
  id: UUID;
  title: string;
  description: string | null;
  status: string; // "new" | "in_progress" | "waiting_on_vendor" | "completed" | "canceled"
  priority: string; // "low" | "medium" | "high" | "emergency"
  organization_id: UUID;
  property_id: UUID;
  unit_id: UUID | null;
  tenant_id: UUID | null;
  created_by_user_id: UUID;
  created_at: DateTime;
  updated_at: DateTime | null;
  completed_at: DateTime | null;
  comments?: WorkOrderComment[];
}
```

### WorkOrderCreate

```typescript
{
  title: string;
  description?: string;
  status?: string; // default: "new"
  priority?: string; // default: "medium"
  organization_id: UUID;
  property_id: UUID;
  unit_id?: UUID;
  tenant_id?: UUID;
}
```

### WorkOrderApprovalRequest

```typescript
{
  approved_amount?: number;
  notes?: string;
}
```

### WorkOrderAssignVendorRequest

```typescript
{
  vendor_id: UUID;
}
```

### WorkOrderMarkViewedRequest

```typescript
{
  role: string; // "landlord" | "tenant"
}
```

## Work Order Comment Schemas

### WorkOrderComment

```typescript
{
  id: UUID;
  body: string;
  work_order_id: UUID;
  author_user_id: UUID;
  created_at: DateTime;
  author?: User;
}
```

### WorkOrderCommentCreate

```typescript
{
  body: string;
}
```

## Vendor Schemas

### VendorResponse

```typescript
{
  id: UUID;
  organization_id: UUID;
  user_id: UUID | null;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  service_categories: string[] | null;
  status: string;
  created_at: DateTime;
}
```

### VendorCreate

```typescript
{
  organization_id: UUID;
  user_id?: UUID;
  company_name: string;
  contact_name?: string;
  email?: EmailStr;
  phone?: string;
  service_categories?: string[];
  status?: string; // default: "active"
}
```

## Attachment Schemas

### Attachment

```typescript
{
  id: UUID;
  file_name: string;
  mime_type: string | null;
  file_size_bytes: number | null;
  organization_id: UUID;
  entity_type: string; // "work_order" | "message" | "lease" | "property" | etc.
  entity_id: UUID;
  storage_key: string;
  created_at: DateTime;
}
```

### AttachmentCreate

```typescript
{
  file_name: string;
  mime_type?: string;
  file_size_bytes?: number;
  entity_type: string;
  entity_id: UUID;
}
```

## Notification Schemas

### Notification

```typescript
{
  id: UUID;
  entity_type: string;
  entity_id: UUID;
  type: string; // "MESSAGE_RECEIVED" | "WORK_ORDER_UPDATED" | "RENT_DUE" | etc.
  is_read: boolean; // default: false
  user_id: UUID;
  organization_id: UUID;
  created_at: DateTime;
  read_at: DateTime | null;
}
```

## Conversation Schemas

### Conversation

```typescript
{
  id: UUID;
  subject: string | null;
  entity_type: string | null;
  entity_id: UUID | null;
  organization_id: UUID;
  created_by_user_id: UUID;
  status: string; // "active" | "archived" | "closed"
  created_at: DateTime;
  updated_at: DateTime;
  messages?: Message[];
}
```

### Message

```typescript
{
  id: UUID;
  body: string;
  conversation_id: UUID;
  sender_user_id: UUID;
  is_read: boolean; // default: false
  created_at: DateTime;
}
```

## Rent Payment Schemas

### RentPayment

```typescript
{
  id: UUID;
  amount: Decimal; // 2 decimal places
  payment_date: Date;
  payment_method: string | null; // "check" | "bank_transfer" | "credit_card" | "cash" | etc.
  reference_number: string | null;
  notes: string | null;
  status: string; // "pending" | "completed" | "failed" | "refunded"
  organization_id: UUID;
  lease_id: UUID;
  tenant_id: UUID;
  created_at: DateTime;
  updated_at: DateTime;
}
```

## Expense Schemas

### Expense

```typescript
{
  id: UUID;
  category: string; // "maintenance" | "utilities" | "insurance" | "taxes" | etc.
  amount: Decimal; // 2 decimal places
  expense_date: Date;
  description: string | null;
  receipt_attachment_id: UUID | null;
  status: string; // "pending" | "approved" | "rejected" | "paid"
  organization_id: UUID;
  property_id: UUID | null;
  work_order_id: UUID | null;
  vendor_id: UUID | null;
  created_by_user_id: UUID;
  created_at: DateTime;
  updated_at: DateTime;
}
```

## Form Schemas

### Form

```typescript
{
  id: UUID;
  form_type: string; // "N4" | "N5" | "L1" | "T1" | etc.
  entity_type: string | null;
  entity_id: UUID | null;
  template_data: object | null;
  status: string; // "draft" | "pending_signature" | "signed" | "expired"
  organization_id: UUID;
  created_by_user_id: UUID;
  signed_at: DateTime | null;
  created_at: DateTime;
  updated_at: DateTime;
  signatures?: FormSignature[];
}
```

### FormSignature

```typescript
{
  id: UUID;
  form_id: UUID;
  signer_user_id: UUID;
  signature_data: string | null; // Base64 encoded signature image
  signed_at: DateTime;
}
```

## Task Schemas

### Task

```typescript
{
  id: UUID;
  title: string;
  description: string | null;
  category: string | null; // "rent" | "lease" | "maintenance" | "legal" | "inspection" | "general"
  due_date: DateTime;
  priority: string; // "low" | "medium" | "high" | "urgent"
  is_completed: boolean; // default: false
  completed_at: DateTime | null;
  organization_id: UUID;
  property_id: UUID | null;
  created_by_user_id: UUID;
  created_at: DateTime;
  updated_at: DateTime;
}
```

## Inspection Schemas

### Inspection

```typescript
{
  id: UUID;
  inspection_type: string; // "move_in" | "move_out" | "routine" | "damage" | etc.
  scheduled_date: Date;
  completed_date: Date | null;
  status: string; // "scheduled" | "in_progress" | "completed" | "cancelled"
  notes: string | null;
  checklist_data: object | null;
  organization_id: UUID;
  property_id: UUID;
  unit_id: UUID | null;
  lease_id: UUID | null;
  created_by_user_id: UUID;
  created_at: DateTime;
  updated_at: DateTime;
}
```

## Invitation Schemas

### Invitation

```typescript
{
  id: UUID;
  email: string;
  role_name: string; // "landlord" | "tenant" | "pmc" | "vendor" | etc.
  organization_id: UUID;
  invited_by_user_id: UUID;
  token: string;
  status: string; // "pending" | "accepted" | "expired" | "cancelled"
  expires_at: DateTime;
  accepted_at: DateTime | null;
  created_at: DateTime;
}
```

## Audit Log Schemas

### AuditLog

```typescript
{
  id: UUID;
  action: string; // "ROLE_CHANGED" | "USER_IMPERSONATED" | "LEASE_CREATED" | etc.
  entity_type: string | null;
  entity_id: UUID | null;
  extra_metadata: object | null;
  organization_id: UUID | null;
  actor_user_id: UUID;
  created_at: DateTime;
}
```

## Role Schemas

### Role

```typescript
{
  id: UUID;
  name: string; // "super_admin" | "pmc_admin" | "pm" | "landlord" | "tenant" | "vendor"
  description: string | null;
}
```

## Enums

### Status Enums

**Property Status**: `"active" | "inactive" | "maintenance"`

**Unit Status**: `"vacant" | "occupied" | "maintenance"`

**Lease Status**: `"pending" | "active" | "terminated" | "expired"`

**Work Order Status**: `"new" | "in_progress" | "waiting_on_vendor" | "completed" | "canceled"`

**Work Order Priority**: `"low" | "medium" | "high" | "emergency"`

**User Status**: `"active" | "suspended" | "inactive"`

**Payment Status**: `"pending" | "completed" | "failed" | "refunded"`

**Expense Status**: `"pending" | "approved" | "rejected" | "paid"`

**Form Status**: `"draft" | "pending_signature" | "signed" | "expired"`

**Task Priority**: `"low" | "medium" | "high" | "urgent"`

**Inspection Status**: `"scheduled" | "in_progress" | "completed" | "cancelled"`

**Invitation Status**: `"pending" | "accepted" | "expired" | "cancelled"`

**Conversation Status**: `"active" | "archived" | "closed"`

## Related Documentation

- [API Overview](./overview.md) - General API information
- [Errors](./errors.md) - Error response formats
- [Backend API Documentation](../02_Backend_API.md) - Complete API reference

