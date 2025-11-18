/**
 * Event Types
 * 
 * Defines all events that can be emitted in the system.
 * Used for webhooks, notifications, and event-driven architecture.
 */

export enum EventType {
  // Tenant Events
  TENANT_INVITED = 'tenant.invited',
  TENANT_INVITATION_OPENED = 'tenant.invitation.opened',
  TENANT_INVITATION_COMPLETED = 'tenant.invitation.completed',
  TENANT_INVITATION_EXPIRED = 'tenant.invitation.expired',
  TENANT_INVITATION_CANCELLED = 'tenant.invitation.cancelled',
  TENANT_CREATED = 'tenant.created',
  TENANT_UPDATED = 'tenant.updated',
  
  // Lease Events
  LEASE_CREATED = 'lease.created',
  LEASE_RENEWED = 'lease.renewed',
  LEASE_TERMINATED = 'lease.terminated',
  
  // Payment Events
  RENT_PAYMENT_RECEIVED = 'rent.payment.received',
  RENT_PAYMENT_OVERDUE = 'rent.payment.overdue',
  
  // Maintenance Events
  MAINTENANCE_REQUEST_CREATED = 'maintenance.request.created',
  MAINTENANCE_REQUEST_RESOLVED = 'maintenance.request.resolved',
  
  // Document Events
  DOCUMENT_UPLOADED = 'document.uploaded',
  DOCUMENT_EXPIRING = 'document.expiring',
  DOCUMENT_EXPIRED = 'document.expired',
}

/**
 * Event payload structure
 */
export type EventPayload = {
  eventType: EventType;
  timestamp: string;
  data: any;
  metadata?: {
    userId?: string;
    userRole?: string;
    requestId?: string;
    [key: string]: any;
  };
};

