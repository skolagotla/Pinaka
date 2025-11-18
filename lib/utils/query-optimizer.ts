/**
 * Query Optimizer Utilities
 * Helpers to optimize Prisma queries by using select instead of include where possible
 */

/**
 * Convert include to select for better performance
 * Only works when all nested relations use select
 */
export function optimizeInclude(include: any): any {
  if (!include || typeof include !== 'object') {
    return include;
  }

  const select: any = {};

  for (const [key, value] of Object.entries(include)) {
    if (value === true) {
      // Simple include - can't optimize without knowing fields
      // Return original include
      return include;
    } else if (value && typeof value === 'object') {
      if ('select' in value) {
        // Already using select - good!
        select[key] = value.select;
      } else if ('include' in value) {
        // Nested include - try to optimize recursively
        const optimized = optimizeInclude(value.include);
        if (optimized && !('select' in optimized)) {
          // Couldn't optimize nested - return original
          return include;
        }
        select[key] = optimized;
      } else {
        // Unknown structure - return original
        return include;
      }
    }
  }

  return { select };
}

/**
 * Get optimized select for common entity queries
 * Returns only essential fields to reduce data transfer
 */
export function getOptimizedSelect(entityType: 'property' | 'landlord' | 'tenant' | 'pmc' | 'vendor' | 'contractor') {
  const selects: Record<string, any> = {
    property: {
      id: true,
      propertyId: true,
      propertyName: true,
      addressLine1: true,
      city: true,
      provinceState: true,
      country: true,
      countryCode: true,
      regionCode: true,
    },
    landlord: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
    tenant: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
    pmc: {
      id: true,
      companyId: true,
      companyName: true,
      email: true,
    },
    vendor: {
      id: true,
      vendorId: true,
      name: true,
      businessName: true,
      email: true,
      phone: true,
    },
    contractor: {
      id: true,
      contractorId: true,
      companyName: true,
      contactName: true,
      email: true,
      phone: true,
    },
  };

  return selects[entityType] || {};
}

/**
 * Optimize a Prisma query by ensuring select is used where possible
 */
export function optimizeQuery(query: any): any {
  if (!query) return query;

  const optimized = { ...query };

  // If include is used, try to convert to select
  if (optimized.include) {
    const converted = optimizeInclude(optimized.include);
    if (converted && 'select' in converted) {
      optimized.select = converted.select;
      delete optimized.include;
    }
  }

  return optimized;
}

module.exports = {
  optimizeInclude,
  getOptimizedSelect,
  optimizeQuery,
};

