/**
 * Schema Index - Compatibility Layer
 * 
 * ⚠️ DEPRECATED: This file is kept for backward compatibility.
 * 
 * The canonical schemas are now in `schema/types/domains/`.
 * All types are generated from `schema/types/registry.ts`.
 * 
 * For new code, use:
 * - `import { PropertyCreate } from '@/lib/schemas';` (still works)
 * - Or: `import { PropertyCreate } from 'schema/types/src/generated-types';` (canonical)
 * 
 * To regenerate types: `npm run generate:types`
 * 
 * ⚠️ NOTE: All schema imports are commented out because the `schema` directory
 * doesn't exist. This is a legacy compatibility layer for the deprecated Next.js API server.
 * The new FastAPI backend uses OpenAPI-generated types from `@pinaka/shared-types`.
 */

// Re-export from canonical schema location
// ⚠️ NOTE: All @/schema/types/* imports are disabled - legacy schema system deprecated
// The schema directory doesn't exist. Use @pinaka/shared-types for new code.

// export * from '@/schema/types/base';
// export * from '@/schema/types/domains/property.schema';
// export {
//   approvalStatusSchema as tenantApprovalStatusSchema,
//   employmentStatusSchema,
//   emergencyContactSchema,
//   employerSchema,
//   tenantCreateSchema,
//   tenantUpdateSchema,
//   tenantQuerySchema,
//   tenantResponseSchema,
//   tenantListResponseSchema,
//   tenantApprovalSchema,
//   tenantRejectionSchema,
// } from '@/schema/types/domains/tenant.schema';
// export type {
//   ApprovalStatus as TenantApprovalStatus,
//   TenantCreate,
//   TenantUpdate,
//   TenantQuery,
//   TenantResponse,
//   TenantListResponse,
// } from '@/schema/types/domains/tenant.schema';
// export * from '@/schema/types/domains/lease.schema';
// export * from '@/schema/types/domains/rent-payment.schema';
// export * from '@/schema/types/domains/maintenance.schema';
// export * from '@/schema/types/domains/document.schema';
// export * from '@/schema/types/domains/expense.schema';
// export * from '@/schema/types/domains/inspection.schema';
// export * from '@/schema/types/domains/vendor.schema';
// export * from '@/schema/types/domains/portfolio.schema';
// export * from '@/schema/types/domains/conversation.schema';
// export * from '@/schema/types/domains/application.schema';
// export * from '@/schema/types/domains/notification.schema';
// export * from '@/schema/types/domains/task.schema';
// export * from '@/schema/types/domains/invitation.schema';
// export * from '@/schema/types/domains/generated-form.schema';
// export * from '@/schema/types/domains/unit.schema';
// export {
//   approvalStatusSchema as landlordApprovalStatusSchema,
//   landlordCreateSchema,
//   landlordUpdateSchema,
//   landlordQuerySchema,
//   landlordResponseSchema,
//   landlordListResponseSchema,
// } from '@/schema/types/domains/landlord.schema';
// export type {
//   ApprovalStatus as LandlordApprovalStatus,
//   LandlordCreate,
//   LandlordUpdate,
//   LandlordQuery,
//   LandlordResponse,
//   LandlordListResponse,
// } from '@/schema/types/domains/landlord.schema';
// export * from '@/schema/types/domains/form-generation.schema';
// export * from '@/schema/types/domains/signature.schema';
// export * from '@/schema/types/domains/tenant-rent-data.schema';
// export * from '@/schema/types/domains/analytics.schema';
// export * from '@/schema/types/domains/search.schema';
// export * from '@/schema/types/domains/activity-log.schema';
// export * from '@/schema/types/domains/user.schema';
// export * from '@/schema/types/domains/ltb-document.schema';
// export * from '@/schema/types/src/generated-types';

// Re-export Zod for convenience
export { z } from 'zod';
