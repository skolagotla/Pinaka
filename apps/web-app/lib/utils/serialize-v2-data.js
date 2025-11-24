/**
 * V2 Data Serialization Utilities
 * Replaces serialize-prisma-data.js for FastAPI v2 data
 * 
 * FastAPI v2 returns data in a different format than Prisma,
 * so we need minimal transformation functions
 */

/**
 * Serialize a generic object (removes functions, converts dates to strings)
 */
export function serializeV2Data(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => serializeV2Data(item));
  }

  if (typeof obj === 'object') {
    if (obj instanceof Date) {
      return obj.toISOString();
    }

    const serialized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip functions
      if (typeof value === 'function') {
        continue;
      }
      
      // Recursively serialize nested objects
      serialized[key] = serializeV2Data(value);
    }
    return serialized;
  }

  return obj;
}

/**
 * Serialize property data from v2 API
 */
export function serializeProperty(property) {
  if (!property) return null;
  return serializeV2Data(property);
}

/**
 * Serialize tenant data from v2 API
 */
export function serializeTenant(tenant) {
  if (!tenant) return null;
  return serializeV2Data(tenant);
}

/**
 * Serialize lease data from v2 API
 */
export function serializeLease(lease) {
  if (!lease) return null;
  return serializeV2Data(lease);
}

/**
 * Serialize rent payment data from v2 API
 */
export function serializeRentPayment(payment) {
  if (!payment) return null;
  return serializeV2Data(payment);
}

/**
 * Serialize maintenance request data from v2 API
 */
export function serializeMaintenanceRequest(request) {
  if (!request) return null;
  return serializeV2Data(request);
}

/**
 * Serialize document data from v2 API
 */
export function serializeDocument(doc) {
  if (!doc) return null;
  return serializeV2Data(doc);
}

/**
 * Serialize partial payment data from v2 API
 */
export function serializePartialPayment(payment) {
  if (!payment) return null;
  return serializeV2Data(payment);
}

// Export default serialize function for backward compatibility
export default serializeV2Data;

