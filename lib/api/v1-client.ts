/**
 * API v1 Client
 * 
 * ⚠️ DEPRECATED: This file is now a re-export of the generated client.
 * The canonical client is auto-generated from the schema registry.
 * 
 * Use: `import { v1Api } from '@/lib/api/v1-client';` (still works)
 * Or: `import { v1Api } from '@/lib/api/v1-client.generated';` (direct)
 * 
 * To regenerate: `npm run generate:api-client`
 * 
 * @example
 * import { v1Api } from '@/lib/api/v1-client';
 * 
 * // Get properties
 * const response = await v1Api.properties.list({ page: 1, limit: 10 });
 * 
 * // Create property
 * const property = await v1Api.properties.create({
 *   landlordId: 'c123...',
 *   addressLine1: '123 Main St',
 *   city: 'Toronto',
 *   postalZip: 'M5H 2N2',
 * });
 */

// Re-export from generated client (canonical source)
// All types and implementations are generated from schema/types/registry.ts
export { v1Api, default } from './v1-client.generated';

// Re-export types for convenience
export type {
  PropertyCreate,
  PropertyUpdate,
  PropertyQuery,
  PropertyResponse,
  PropertyListResponse,
  TenantCreate,
  TenantUpdate,
  TenantQuery,
  TenantResponse,
  TenantListResponse,
  LeaseCreate,
  LeaseUpdate,
  LeaseQuery,
  LeaseResponse,
  LeaseListResponse,
  RentPaymentCreate,
  RentPaymentUpdate,
  RentPaymentQuery,
  RentPaymentResponse,
  RentPaymentListResponse,
  MaintenanceCreate as MaintenanceRequestCreate,
  MaintenanceUpdate as MaintenanceRequestUpdate,
  MaintenanceQuery as MaintenanceRequestQuery,
  MaintenanceResponse as MaintenanceRequestResponse,
  MaintenanceListResponse as MaintenanceRequestListResponse,
  MaintenanceCreate,
  MaintenanceUpdate,
  MaintenanceQuery,
  MaintenanceResponse,
  MaintenanceListResponse,
  DocumentCreate,
  DocumentUpdate,
  DocumentQuery,
  DocumentResponse,
  DocumentListResponse,
  ExpenseCreate,
  ExpenseUpdate,
  ExpenseQuery,
  ExpenseResponse,
  ExpenseListResponse,
  InspectionCreate,
  InspectionUpdate,
  InspectionQuery,
  InspectionResponse,
  InspectionListResponse,
  VendorCreate,
  VendorUpdate,
  VendorQuery,
  VendorResponse,
  VendorListResponse,
  ConversationCreate,
  ConversationUpdate,
  ConversationQuery,
  ConversationResponse,
  ConversationListResponse,
  ApplicationCreate,
  ApplicationUpdate,
  ApplicationQuery,
  ApplicationResponse,
  ApplicationListResponse,
  NotificationCreate,
  NotificationUpdate,
  NotificationQuery,
  NotificationResponse,
  NotificationListResponse,
  TaskCreate,
  TaskUpdate,
  TaskQuery,
  TaskResponse,
  TaskListResponse,
  InvitationCreate,
  InvitationUpdate,
  InvitationQuery,
  InvitationResponse,
  InvitationListResponse,
  GeneratedFormCreate,
  GeneratedFormUpdate,
  GeneratedFormQuery,
  GeneratedFormResponse,
  GeneratedFormListResponse,
  UnitCreate,
  UnitUpdate,
  UnitQuery,
  UnitResponse,
  UnitListResponse,
} from '@/lib/schemas';
