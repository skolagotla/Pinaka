/**
 * Prisma Data Serialization Utility
 * 
 * Serializes Prisma data objects by converting all Date objects to ISO strings
 * for safe transmission from server components to client components.
 * 
 * This prevents "Server Components render" errors in production builds.
 */

/**
 * Serialize a single Date value to ISO string
 * @param {Date|string|null|undefined} date - Date to serialize
 * @returns {string|null} ISO string or null
 */
function serializeDate(date) {
  if (!date) return null;
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'string') return date; // Already serialized
  return null;
}

/**
 * Recursively serialize all Date objects in a data structure
 * @param {any} data - Data to serialize
 * @returns {any} Serialized data
 */
function serializeDates(data) {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (data instanceof Date) {
    return data.toISOString();
  }
  
  if (Array.isArray(data)) {
    return data.map(item => serializeDates(item));
  }
  
  if (typeof data === 'object') {
    const serialized = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip functions and symbols
      if (typeof value === 'function' || typeof value === 'symbol') {
        continue;
      }
      serialized[key] = serializeDates(value);
    }
    return serialized;
  }
  
  return data;
}

/**
 * Serialize a lease object
 * @param {Object} lease - Lease object from Prisma
 * @returns {Object} Serialized lease
 */
export function serializeLease(lease) {
  if (!lease) return null;
  
  return serializeDates({
    ...lease,
    leaseStart: serializeDate(lease.leaseStart),
    leaseEnd: serializeDate(lease.leaseEnd),
    createdAt: serializeDate(lease.createdAt),
    updatedAt: serializeDate(lease.updatedAt),
    leaseTenants: lease.leaseTenants?.map(lt => ({
      ...lt,
      addedAt: serializeDate(lt.addedAt),
      tenant: lt.tenant ? serializeTenant(lt.tenant) : null,
    })) || [],
    unit: lease.unit ? serializeUnit(lease.unit) : null,
  });
}

/**
 * Serialize a tenant object
 * @param {Object} tenant - Tenant object from Prisma
 * @returns {Object} Serialized tenant
 */
export function serializeTenant(tenant) {
  if (!tenant) return null;
  
  return serializeDates({
    ...tenant,
    dateOfBirth: serializeDate(tenant.dateOfBirth),
    invitationSentAt: serializeDate(tenant.invitationSentAt),
    lastLoginAt: serializeDate(tenant.lastLoginAt),
    createdAt: serializeDate(tenant.createdAt),
    updatedAt: serializeDate(tenant.updatedAt),
    leaseTenants: tenant.leaseTenants?.map(lt => ({
      ...lt,
      addedAt: serializeDate(lt.addedAt),
      lease: lt.lease ? serializeLease(lt.lease) : null,
    })) || [],
  });
}

/**
 * Serialize a unit object
 * @param {Object} unit - Unit object from Prisma
 * @returns {Object} Serialized unit
 */
export function serializeUnit(unit) {
  if (!unit) return null;
  
  return serializeDates({
    ...unit,
    createdAt: serializeDate(unit.createdAt),
    updatedAt: serializeDate(unit.updatedAt),
    property: unit.property ? serializeProperty(unit.property) : null,
    leases: unit.leases?.map(lease => serializeLease(lease)) || [],
  });
}

/**
 * Serialize a property object
 * @param {Object} property - Property object from Prisma
 * @returns {Object} Serialized property
 */
export function serializeProperty(property) {
  if (!property) return null;
  
  return serializeDates({
    ...property,
    createdAt: serializeDate(property.createdAt),
    updatedAt: serializeDate(property.updatedAt),
    mortgageStartDate: serializeDate(property.mortgageStartDate),
    units: property.units?.map(unit => serializeUnit(unit)) || [],
  });
}

/**
 * Serialize a maintenance request object
 * @param {Object} request - Maintenance request object from Prisma
 * @returns {Object} Serialized maintenance request
 */
export function serializeMaintenanceRequest(request) {
  if (!request) return null;
  
  return serializeDates({
    ...request,
    requestedDate: serializeDate(request.requestedDate),
    completedDate: serializeDate(request.completedDate),
    createdAt: serializeDate(request.createdAt),
    updatedAt: serializeDate(request.updatedAt),
    lastViewedByLandlord: serializeDate(request.lastViewedByLandlord),
    lastViewedByTenant: serializeDate(request.lastViewedByTenant),
    property: request.property ? serializeProperty(request.property) : null,
    tenant: request.tenant ? serializeTenant(request.tenant) : null,
    comments: request.comments?.map(comment => ({
      ...comment,
      createdAt: serializeDate(comment.createdAt),
      updatedAt: serializeDate(comment.updatedAt),
    })) || [],
  });
}

/**
 * Serialize a rent payment object
 * @param {Object} payment - Rent payment object from Prisma
 * @returns {Object} Serialized rent payment
 */
export function serializeRentPayment(payment) {
  if (!payment) return null;
  
  return serializeDates({
    ...payment,
    dueDate: serializeDate(payment.dueDate),
    paidDate: serializeDate(payment.paidDate),
    createdAt: serializeDate(payment.createdAt),
    updatedAt: serializeDate(payment.updatedAt),
    lease: payment.lease ? serializeLease(payment.lease) : null,
    partialPayments: payment.partialPayments?.map(pp => ({
      ...pp,
      paidDate: serializeDate(pp.paidDate),
      createdAt: serializeDate(pp.createdAt),
    })) || [],
  });
}

/**
 * Serialize a document object
 * @param {Object} document - Document object from Prisma
 * @returns {Object} Serialized document
 */
export function serializeDocument(document) {
  if (!document) return null;
  
  return serializeDates({
    ...document,
    uploadedAt: serializeDate(document.uploadedAt),
    expirationDate: serializeDate(document.expirationDate),
    reminderSentAt: serializeDate(document.reminderSentAt),
    updatedAt: serializeDate(document.updatedAt),
    tenant: document.tenant ? serializeTenant(document.tenant) : null,
  });
}

/**
 * Serialize a landlord object
 * @param {Object} landlord - Landlord object from Prisma
 * @returns {Object} Serialized landlord
 */
export function serializeLandlord(landlord) {
  if (!landlord) return null;
  
  return serializeDates({
    ...landlord,
    createdAt: serializeDate(landlord.createdAt),
    updatedAt: serializeDate(landlord.updatedAt),
  });
}

/**
 * Serialize a partial payment object
 * @param {Object} partialPayment - Partial payment object from Prisma
 * @returns {Object} Serialized partial payment
 */
export function serializePartialPayment(partialPayment) {
  if (!partialPayment) return null;
  
  return serializeDates({
    ...partialPayment,
    paidDate: serializeDate(partialPayment.paidDate),
    createdAt: serializeDate(partialPayment.createdAt),
    updatedAt: serializeDate(partialPayment.updatedAt),
    rentPayment: partialPayment.rentPayment ? serializeRentPayment(partialPayment.rentPayment) : null,
  });
}

/**
 * Generic serializer - automatically detects and serializes all Date objects
 * @param {any} data - Any data structure
 * @returns {any} Fully serialized data structure
 */
export function serializePrismaData(data) {
  if (data == null) {
    return null;
  }
  if (Array.isArray(data)) {
    return data.map(item => serializeDates(item));
  }
  return serializeDates(data);
}

