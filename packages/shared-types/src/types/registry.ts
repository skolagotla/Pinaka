/**
 * Canonical Schema Registry
 * 
 * ⭐ SINGLE SOURCE OF TRUTH ⭐
 * 
 * This is the ONLY place where API contracts are defined.
 * All types, validators, OpenAPI specs, and code are generated from this registry.
 * 
 * Version: 1.0.0
 * Last Updated: ${new Date().toISOString()}
 */

import { z } from 'zod';
import { commonFields } from './base';

/**
 * Schema Registry Version
 */
export const SCHEMA_VERSION = '1.0.0';

/**
 * Domain Schema Definition
 */
export interface DomainSchemaDefinition {
  domain: string;
  version: string;
  schemas: {
    create: z.ZodTypeAny;
    update: z.ZodTypeAny;
    query: z.ZodTypeAny;
    response: z.ZodTypeAny;
    listResponse: z.ZodTypeAny;
  };
  schemaNames?: {
    create: string;
    update: string;
    query: string;
    response: string;
    listResponse: string;
  };
  apiPath: string;
  methods: ('GET' | 'POST' | 'PATCH' | 'DELETE')[];
  tags: string[];
  description: string;
}

/**
 * Import schemas from domain files
 * These are the canonical Zod schemas for each domain
 */
import * as propertySchemas from './domains/property.schema';
import * as tenantSchemas from './domains/tenant.schema';
import * as leaseSchemas from './domains/lease.schema';
import * as rentPaymentSchemas from './domains/rent-payment.schema';
import * as maintenanceSchemas from './domains/maintenance.schema';
import * as documentSchemas from './domains/document.schema';
import * as expenseSchemas from './domains/expense.schema';
import * as inspectionSchemas from './domains/inspection.schema';
import * as vendorSchemas from './domains/vendor.schema';
import * as conversationSchemas from './domains/conversation.schema';
import * as applicationSchemas from './domains/application.schema';
import * as notificationSchemas from './domains/notification.schema';
import * as taskSchemas from './domains/task.schema';
import * as invitationSchemas from './domains/invitation.schema';
import * as generatedFormSchemas from './domains/generated-form.schema';
import * as unitSchemas from './domains/unit.schema';
import * as landlordSchemas from './domains/landlord.schema';

/**
 * Canonical Schema Registry
 * 
 * ⭐ THIS IS THE SINGLE SOURCE OF TRUTH ⭐
 * All API contracts, types, validators, and code are generated from this registry.
 */
export const schemaRegistry: Record<string, DomainSchemaDefinition> = {
  properties: {
    domain: 'property',
    version: '1.0.0',
    schemas: {
      create: propertySchemas.propertyCreateSchema,
      update: propertySchemas.propertyUpdateSchema,
      query: propertySchemas.propertyQuerySchema,
      response: propertySchemas.propertyResponseSchema,
      listResponse: propertySchemas.propertyListResponseSchema,
    },
    apiPath: '/api/v1/properties',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    tags: ['Properties'],
    description: 'Property management operations',
  },
  tenants: {
    domain: 'tenant',
    version: '1.0.0',
    schemas: {
      create: tenantSchemas.tenantCreateSchema,
      update: tenantSchemas.tenantUpdateSchema,
      query: tenantSchemas.tenantQuerySchema,
      response: tenantSchemas.tenantResponseSchema,
      listResponse: tenantSchemas.tenantListResponseSchema,
    },
    apiPath: '/api/v1/tenants',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    tags: ['Tenants'],
    description: 'Tenant management operations',
  },
  leases: {
    domain: 'lease',
    version: '1.0.0',
    schemas: {
      create: leaseSchemas.leaseCreateSchema,
      update: leaseSchemas.leaseUpdateSchema,
      query: leaseSchemas.leaseQuerySchema,
      response: leaseSchemas.leaseResponseSchema,
      listResponse: leaseSchemas.leaseListResponseSchema,
    },
    apiPath: '/api/v1/leases',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    tags: ['Leases'],
    description: 'Lease management operations',
  },
  'rent-payments': {
    domain: 'rent-payment',
    version: '1.0.0',
    schemas: {
      create: rentPaymentSchemas.rentPaymentCreateSchema,
      update: rentPaymentSchemas.rentPaymentUpdateSchema,
      query: rentPaymentSchemas.rentPaymentQuerySchema,
      response: rentPaymentSchemas.rentPaymentResponseSchema,
      listResponse: rentPaymentSchemas.rentPaymentListResponseSchema,
    },
    apiPath: '/api/v1/rent-payments',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    tags: ['Rent Payments'],
    description: 'Rent payment operations',
  },
  maintenance: {
    domain: 'maintenance',
    version: '1.0.0',
    schemas: {
      create: maintenanceSchemas.maintenanceRequestCreateSchema,
      update: maintenanceSchemas.maintenanceRequestUpdateSchema,
      query: maintenanceSchemas.maintenanceRequestQuerySchema,
      response: maintenanceSchemas.maintenanceRequestResponseSchema,
      listResponse: maintenanceSchemas.maintenanceRequestListResponseSchema,
    },
    apiPath: '/api/v1/maintenance',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    tags: ['Maintenance'],
    description: 'Maintenance request operations',
  },
  documents: {
    domain: 'document',
    version: '1.0.0',
    schemas: {
      create: documentSchemas.documentCreateSchema,
      update: documentSchemas.documentUpdateSchema,
      query: documentSchemas.documentQuerySchema,
      response: documentSchemas.documentResponseSchema,
      listResponse: documentSchemas.documentListResponseSchema,
    },
    apiPath: '/api/v1/documents',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    tags: ['Documents'],
    description: 'Document management operations',
  },
  expenses: {
    domain: 'expense',
    version: '1.0.0',
    schemas: {
      create: expenseSchemas.expenseCreateSchema,
      update: expenseSchemas.expenseUpdateSchema,
      query: expenseSchemas.expenseQuerySchema,
      response: expenseSchemas.expenseResponseSchema,
      listResponse: expenseSchemas.expenseListResponseSchema,
    },
    apiPath: '/api/v1/expenses',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    tags: ['Expenses'],
    description: 'Expense management operations',
  },
  inspections: {
    domain: 'inspection',
    version: '1.0.0',
    schemas: {
      create: inspectionSchemas.inspectionChecklistCreateSchema,
      update: inspectionSchemas.inspectionChecklistUpdateSchema,
      query: inspectionSchemas.inspectionChecklistQuerySchema,
      response: inspectionSchemas.inspectionChecklistResponseSchema,
      listResponse: inspectionSchemas.inspectionChecklistListResponseSchema,
    },
    apiPath: '/api/v1/inspections',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    tags: ['Inspections'],
    description: 'Inspection management operations',
  },
  vendors: {
    domain: 'vendor',
    version: '1.0.0',
    schemas: {
      create: vendorSchemas.serviceProviderCreateSchema,
      update: vendorSchemas.serviceProviderUpdateSchema,
      query: vendorSchemas.serviceProviderQuerySchema,
      response: vendorSchemas.serviceProviderResponseSchema,
      listResponse: vendorSchemas.serviceProviderListResponseSchema,
    },
    apiPath: '/api/v1/vendors',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    tags: ['Vendors'],
    description: 'Vendor management operations',
  },
  conversations: {
    domain: 'conversation',
    version: '1.0.0',
    schemas: {
      create: conversationSchemas.conversationCreateSchema,
      update: conversationSchemas.conversationCreateSchema.partial(),
      query: conversationSchemas.conversationQuerySchema,
      response: conversationSchemas.conversationResponseSchema,
      listResponse: conversationSchemas.conversationListResponseSchema,
    },
    apiPath: '/api/v1/conversations',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    tags: ['Conversations'],
    description: 'Conversation management operations',
  },
  applications: {
    domain: 'application',
    version: '1.0.0',
    schemas: {
      create: applicationSchemas.applicationCreateSchema,
      update: applicationSchemas.applicationUpdateSchema,
      query: applicationSchemas.applicationQuerySchema,
      response: applicationSchemas.applicationResponseSchema,
      listResponse: applicationSchemas.applicationListResponseSchema,
    },
    apiPath: '/api/v1/applications',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    tags: ['Applications'],
    description: 'Application management operations',
  },
  notifications: {
    domain: 'notification',
    version: '1.0.0',
    schemas: {
      create: notificationSchemas.notificationCreateSchema,
      update: notificationSchemas.notificationUpdateSchema,
      query: notificationSchemas.notificationQuerySchema,
      response: notificationSchemas.notificationResponseSchema,
      listResponse: notificationSchemas.notificationListResponseSchema,
    },
    apiPath: '/api/v1/notifications',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    tags: ['Notifications'],
    description: 'Notification management operations',
  },
  tasks: {
    domain: 'task',
    version: '1.0.0',
    schemas: {
      create: taskSchemas.taskCreateSchema,
      update: taskSchemas.taskUpdateSchema,
      query: taskSchemas.taskQuerySchema,
      response: taskSchemas.taskResponseSchema,
      listResponse: taskSchemas.taskListResponseSchema,
    },
    apiPath: '/api/v1/tasks',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    tags: ['Tasks'],
    description: 'Task management operations',
  },
  invitations: {
    domain: 'invitation',
    version: '1.0.0',
    schemas: {
      create: invitationSchemas.invitationCreateSchema,
      update: invitationSchemas.invitationUpdateSchema,
      query: invitationSchemas.invitationQuerySchema,
      response: invitationSchemas.invitationResponseSchema,
      listResponse: invitationSchemas.invitationListResponseSchema,
    },
    apiPath: '/api/v1/invitations',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    tags: ['Invitations'],
    description: 'Invitation management operations',
  },
  'generated-forms': {
    domain: 'generated-form',
    version: '1.0.0',
    schemas: {
      create: generatedFormSchemas.generatedFormCreateSchema,
      update: generatedFormSchemas.generatedFormUpdateSchema,
      query: generatedFormSchemas.generatedFormQuerySchema,
      response: generatedFormSchemas.generatedFormResponseSchema,
      listResponse: generatedFormSchemas.generatedFormListResponseSchema,
    },
    apiPath: '/api/v1/generated-forms',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    tags: ['Generated Forms'],
    description: 'Generated form management operations',
  },
  units: {
    domain: 'unit',
    version: '1.0.0',
    schemas: {
      create: unitSchemas.unitCreateSchema,
      update: unitSchemas.unitUpdateSchema,
      query: z.object({
        page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()).default(1),
        limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive().max(1000)).default(50),
        propertyId: commonFields.cuid.optional(),
      }),
      response: unitSchemas.unitResponseSchema,
      listResponse: z.object({
        success: z.literal(true),
        data: z.array(unitSchemas.unitResponseSchema),
        pagination: z.object({
          page: z.number().int().positive(),
          limit: z.number().int().positive(),
          total: z.number().int().nonnegative(),
          totalPages: z.number().int().nonnegative(),
        }),
      }),
    },
    apiPath: '/api/v1/units',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    tags: ['Units'],
    description: 'Unit management operations',
  },
  landlords: {
    domain: 'landlord',
    version: '1.0.0',
    schemas: {
      create: landlordSchemas.landlordCreateSchema,
      update: landlordSchemas.landlordUpdateSchema,
      query: landlordSchemas.landlordQuerySchema,
      response: landlordSchemas.landlordResponseSchema,
      listResponse: landlordSchemas.landlordListResponseSchema,
    },
    apiPath: '/api/v1/landlords',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    tags: ['Landlords'],
    description: 'Landlord management operations',
  },
};

/**
 * Get registry metadata
 */
export function getRegistryMetadata() {
  return {
    version: SCHEMA_VERSION,
    domains: Object.keys(schemaRegistry).length,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Validate registry integrity
 */
export function validateRegistry(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [key, def] of Object.entries(schemaRegistry)) {
    if (!def.schemas.create) errors.push(`${key}: Missing create schema`);
    if (!def.schemas.update) errors.push(`${key}: Missing update schema`);
    if (!def.schemas.query) errors.push(`${key}: Missing query schema`);
    if (!def.schemas.response) errors.push(`${key}: Missing response schema`);
    if (!def.schemas.listResponse) errors.push(`${key}: Missing listResponse schema`);
    if (!def.apiPath) errors.push(`${key}: Missing apiPath`);
    if (!def.methods || def.methods.length === 0) errors.push(`${key}: Missing methods`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
