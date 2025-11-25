/**
 * Schema Index - V2 Compatibility Layer
 * 
 * ⚠️ MIGRATED TO V2: This file now re-exports types from FastAPI OpenAPI spec.
 * 
 * All types are now generated from FastAPI's Pydantic schemas via OpenAPI.
 * 
 * For new code, use:
 *   import type { components } from "@pinaka/shared-types/v2-api";
 *   type Property = components["schemas"]["Property"];
 * 
 * For backward compatibility, you can still use:
 *   import type { Property, PropertyCreate } from '@/lib/schemas';
 * 
 * To regenerate types: pnpm generate:types
 */

// Re-export V2 types from OpenAPI spec
export type {
  components,
  paths,
} from "@pinaka/shared-types/v2-api";

// Convenience type aliases for backward compatibility
import type { components } from "@pinaka/shared-types/v2-api";

// Property types
export type Property = components["schemas"]["Property"];
export type PropertyCreate = components["schemas"]["PropertyCreate"];
// PropertyUpdate may not exist in OpenAPI - use Partial<PropertyCreate> as fallback
export type PropertyUpdate = Partial<components["schemas"]["PropertyCreate"]>;
// Response types may not exist in OpenAPI - using base types
export type PropertyResponse = components["schemas"]["Property"];
export type PropertyListResponse = components["schemas"]["Property"][];

// Tenant types
export type Tenant = components["schemas"]["Tenant"];
export type TenantCreate = components["schemas"]["TenantCreate"];
export type TenantUpdate = components["schemas"]["TenantUpdate"];
export type TenantResponse = components["schemas"]["Tenant"];
export type TenantListResponse = components["schemas"]["Tenant"][];

// Lease types
export type Lease = components["schemas"]["Lease"];
export type LeaseCreate = components["schemas"]["LeaseCreate"];
export type LeaseUpdate = components["schemas"]["LeaseUpdate"];
export type LeaseResponse = components["schemas"]["Lease"];
export type LeaseListResponse = components["schemas"]["Lease"][];

// Work Order types
export type WorkOrder = components["schemas"]["WorkOrder"];
export type WorkOrderCreate = components["schemas"]["WorkOrderCreate"];
export type WorkOrderUpdate = components["schemas"]["WorkOrderUpdate"];
export type WorkOrderResponse = components["schemas"]["WorkOrder"];
export type WorkOrderListResponse = components["schemas"]["WorkOrder"][];

// Unit types
export type Unit = components["schemas"]["Unit"];
export type UnitCreate = components["schemas"]["UnitCreate"];
export type UnitUpdate = components["schemas"]["UnitUpdate"];
export type UnitResponse = components["schemas"]["Unit"];
export type UnitListResponse = components["schemas"]["Unit"][];

// Landlord types
export type Landlord = components["schemas"]["Landlord"];
export type LandlordCreate = components["schemas"]["LandlordCreate"];
export type LandlordUpdate = components["schemas"]["LandlordUpdate"];
export type LandlordResponse = components["schemas"]["Landlord"];
export type LandlordListResponse = components["schemas"]["Landlord"][];

// Vendor types (using actual OpenAPI schema names)
export type Vendor = components["schemas"]["schemas__vendor__VendorResponse"] | components["schemas"]["schemas__vendor_v2__VendorResponse"];
export type VendorCreate = components["schemas"]["schemas__vendor__VendorCreate"] | components["schemas"]["schemas__vendor_v2__VendorCreate"];
export type VendorUpdate = components["schemas"]["schemas__vendor__VendorUpdate"] | components["schemas"]["schemas__vendor_v2__VendorUpdate"];
export type VendorResponse = components["schemas"]["schemas__vendor__VendorResponse"] | components["schemas"]["schemas__vendor_v2__VendorResponse"];
export type VendorListResponse = components["schemas"]["VendorListResponse"] | (components["schemas"]["schemas__vendor__VendorResponse"] | components["schemas"]["schemas__vendor_v2__VendorResponse"])[];

// Organization types
export type Organization = components["schemas"]["Organization"];
export type OrganizationCreate = components["schemas"]["OrganizationCreate"];
// OrganizationUpdate may not exist in OpenAPI - use Partial<OrganizationCreate> as fallback
export type OrganizationUpdate = Partial<components["schemas"]["OrganizationCreate"]>;

// User types
export type User = components["schemas"]["User"];
export type UserResponse = components["schemas"]["User"];

// Add more type aliases as needed from components["schemas"]

// Re-export Zod schemas for UI validation only
// FastAPI backend validates with Pydantic - these are for client-side form validation
export {
  propertyCreateSchema,
  propertyUpdateSchema,
  propertyQuerySchema,
  propertyResponseSchema,
  propertyListResponseSchema,
} from '../../../../packages/shared-types/src/types/domains/property.schema';

export {
  tenantCreateSchema,
  tenantUpdateSchema,
  tenantQuerySchema,
  tenantResponseSchema,
  tenantListResponseSchema,
} from '../../../../packages/shared-types/src/types/domains/tenant.schema';

export {
  leaseCreateSchema,
  leaseUpdateSchema,
  leaseQuerySchema,
  leaseResponseSchema,
  leaseListResponseSchema,
} from '../../../../packages/shared-types/src/types/domains/lease.schema';

export {
  unitCreateSchema,
  unitUpdateSchema,
  unitQuerySchema,
  unitResponseSchema,
  unitListResponseSchema,
} from '../../../../packages/shared-types/src/types/domains/unit.schema';

export {
  landlordCreateSchema,
  landlordUpdateSchema,
  landlordQuerySchema,
  landlordResponseSchema,
  landlordListResponseSchema,
} from '../../../../packages/shared-types/src/types/domains/landlord.schema';

export {
  vendorCreateSchema,
  vendorUpdateSchema,
  vendorQuerySchema,
  vendorResponseSchema,
  vendorListResponseSchema,
} from '../../../../packages/shared-types/src/types/domains/vendor.schema';

export {
  maintenanceRequestCreateSchema as maintenanceCreateSchema,
  maintenanceRequestUpdateSchema as maintenanceUpdateSchema,
  maintenanceRequestQuerySchema as maintenanceQuerySchema,
  maintenanceRequestResponseSchema as maintenanceResponseSchema,
  maintenanceRequestListResponseSchema as maintenanceListResponseSchema,
} from '../../../../packages/shared-types/src/types/domains/maintenance.schema';

export {
  documentCreateSchema,
  documentUpdateSchema,
  documentQuerySchema,
  documentResponseSchema,
  documentListResponseSchema,
} from '../../../../packages/shared-types/src/types/domains/document.schema';

export {
  expenseCreateSchema,
  expenseUpdateSchema,
  expenseQuerySchema,
  expenseResponseSchema,
  expenseListResponseSchema,
} from '../../../../packages/shared-types/src/types/domains/expense.schema';

export {
  inspectionCreateSchema,
  inspectionUpdateSchema,
  inspectionQuerySchema,
  inspectionResponseSchema,
  inspectionListResponseSchema,
} from '../../../../packages/shared-types/src/types/domains/inspection.schema';

export {
  notificationCreateSchema,
  notificationUpdateSchema,
  notificationQuerySchema,
  notificationResponseSchema,
  notificationListResponseSchema,
} from '../../../../packages/shared-types/src/types/domains/notification.schema';

export {
  conversationCreateSchema,
  conversationUpdateSchema,
  conversationQuerySchema,
  conversationResponseSchema,
  conversationListResponseSchema,
} from '../../../../packages/shared-types/src/types/domains/conversation.schema';

export {
  applicationCreateSchema,
  applicationUpdateSchema,
  applicationQuerySchema,
  applicationResponseSchema,
  applicationListResponseSchema,
} from '../../../../packages/shared-types/src/types/domains/application.schema';

export {
  taskCreateSchema,
  taskUpdateSchema,
  taskQuerySchema,
  taskResponseSchema,
  taskListResponseSchema,
} from '../../../../packages/shared-types/src/types/domains/task.schema';

export {
  invitationCreateSchema,
  invitationUpdateSchema,
  invitationQuerySchema,
  invitationResponseSchema,
  invitationListResponseSchema,
} from '../../../../packages/shared-types/src/types/domains/invitation.schema';

export {
  generatedFormCreateSchema,
  generatedFormUpdateSchema,
  generatedFormQuerySchema,
  generatedFormResponseSchema,
  generatedFormListResponseSchema,
} from '../../../../packages/shared-types/src/types/domains/generated-form.schema';

export {
  rentPaymentCreateSchema,
  rentPaymentUpdateSchema,
  rentPaymentQuerySchema,
  rentPaymentResponseSchema,
  rentPaymentListResponseSchema,
} from '../../../../packages/shared-types/src/types/domains/rent-payment.schema';

// Re-export Zod for UI validation and legacy handlers
export { z } from 'zod';
export * from '../../../../packages/shared-types/src/types/base';
