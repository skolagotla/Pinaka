/**
 * V2 Types - Generated from FastAPI OpenAPI spec
 * 
 * This is a compatibility layer that re-exports types from @pinaka/shared-types
 * 
 * Usage:
 *   import type { Property, WorkOrder } from '@/lib/schemas/v2-types';
 */

export type {
  components,
  paths,
} from "@pinaka/shared-types/v2-api";

// Convenience type aliases
export type Property = import("@pinaka/shared-types/v2-api").components["schemas"]["Property"];
export type PropertyCreate = import("@pinaka/shared-types/v2-api").components["schemas"]["PropertyCreate"];
export type PropertyUpdate = import("@pinaka/shared-types/v2-api").components["schemas"]["PropertyUpdate"];

export type WorkOrder = import("@pinaka/shared-types/v2-api").components["schemas"]["WorkOrder"];
export type WorkOrderCreate = import("@pinaka/shared-types/v2-api").components["schemas"]["WorkOrderCreate"];
export type WorkOrderUpdate = import("@pinaka/shared-types/v2-api").components["schemas"]["WorkOrderUpdate"];

export type Lease = import("@pinaka/shared-types/v2-api").components["schemas"]["Lease"];
export type LeaseCreate = import("@pinaka/shared-types/v2-api").components["schemas"]["LeaseCreate"];
export type LeaseUpdate = import("@pinaka/shared-types/v2-api").components["schemas"]["LeaseUpdate"];

export type Tenant = import("@pinaka/shared-types/v2-api").components["schemas"]["Tenant"];
export type TenantCreate = import("@pinaka/shared-types/v2-api").components["schemas"]["TenantCreate"];
export type TenantUpdate = import("@pinaka/shared-types/v2-api").components["schemas"]["TenantUpdate"];

export type Landlord = import("@pinaka/shared-types/v2-api").components["schemas"]["Landlord"];
export type LandlordCreate = import("@pinaka/shared-types/v2-api").components["schemas"]["LandlordCreate"];
export type LandlordUpdate = import("@pinaka/shared-types/v2-api").components["schemas"]["LandlordUpdate"];

export type Unit = import("@pinaka/shared-types/v2-api").components["schemas"]["Unit"];
export type UnitCreate = import("@pinaka/shared-types/v2-api").components["schemas"]["UnitCreate"];
export type UnitUpdate = import("@pinaka/shared-types/v2-api").components["schemas"]["UnitUpdate"];

export type Vendor = import("@pinaka/shared-types/v2-api").components["schemas"]["Vendor"];
export type VendorCreate = import("@pinaka/shared-types/v2-api").components["schemas"]["VendorCreate"];
export type VendorUpdate = import("@pinaka/shared-types/v2-api").components["schemas"]["VendorUpdate"];

// Add more type aliases as needed...

