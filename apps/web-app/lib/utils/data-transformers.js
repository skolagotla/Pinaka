/**
 * Data Transformation Utilities
 * 
 * Common data transformation functions used across landlord pages.
 * Eliminates duplicate transformation logic.
 */

/**
 * Flatten leases from properties structure
 * Converts nested structure (properties -> units -> leases) to flat array
 * 
 * @param {Array} properties - Array of property objects with nested units and leases
 * @returns {Array} Flat array of all leases
 * 
 * @example
 * const leases = flattenLeasesFromProperties(landlord.properties);
 */
export function flattenLeasesFromProperties(properties) {
  if (!properties || !Array.isArray(properties)) {
    return [];
  }
  
  return properties.flatMap(property => 
    (property.units || []).flatMap(unit => 
      (unit.leases || [])
    )
  );
}

/**
 * Flatten units with property information attached
 * Converts nested structure to flat array with property context
 * 
 * @param {Array} properties - Array of property objects with nested units
 * @returns {Array} Flat array of units with property info attached
 * 
 * @example
 * const units = flattenUnitsWithPropertyInfo(landlord.properties);
 */
export function flattenUnitsWithPropertyInfo(properties) {
  if (!properties || !Array.isArray(properties)) {
    return [];
  }
  
  return properties.flatMap(property => 
    (property.units || []).map(unit => ({
      ...unit,
      property: {
        id: property.id,
        propertyName: property.propertyName,
        addressLine1: property.addressLine1,
        addressLine2: property.addressLine2,
        city: property.city,
        provinceState: property.provinceState,
        postalZip: property.postalZip,
        country: property.country,
        unitCount: property.unitCount
      }
    }))
  );
}

/**
 * Extract unique tenants from properties/leases structure
 * 
 * @param {Array} properties - Array of property objects with nested leases
 * @returns {Array} Array of unique tenant objects
 */
export function extractTenantsFromProperties(properties) {
  if (!properties || !Array.isArray(properties)) {
    return [];
  }
  
  const tenantMap = new Map();
  
  properties.forEach(property => {
    (property.units || []).forEach(unit => {
      (unit.leases || []).forEach(lease => {
        (lease.leaseTenants || []).forEach(leaseTenant => {
          if (leaseTenant.tenant && !tenantMap.has(leaseTenant.tenant.id)) {
            tenantMap.set(leaseTenant.tenant.id, leaseTenant.tenant);
          }
        });
      });
    });
  });
  
  return Array.from(tenantMap.values());
}

/**
 * Group leases by status
 * 
 * @param {Array} leases - Array of lease objects
 * @returns {Object} Object with leases grouped by status
 */
export function groupLeasesByStatus(leases) {
  if (!leases || !Array.isArray(leases)) {
    return {
      active: [],
      expired: [],
      pending: [],
      terminated: []
    };
  }
  
  return leases.reduce((acc, lease) => {
    const status = lease.status?.toLowerCase() || 'pending';
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(lease);
    return acc;
  }, {
    active: [],
    expired: [],
    pending: [],
    terminated: []
  });
}

/**
 * Calculate total monthly rent from leases
 * 
 * @param {Array} leases - Array of lease objects
 * @returns {Object} Object with total rent and breakdown by currency
 */
export function calculateTotalMonthlyRent(leases) {
  if (!leases || !Array.isArray(leases)) {
    return {
      total: 0,
      byCurrency: {}
    };
  }
  
  const byCurrency = {};
  let total = 0;
  
  leases.forEach(lease => {
    if (lease.status === 'Active' && lease.rentAmount) {
      const country = lease.unit?.property?.country || 'US';
      const currency = country === 'CA' ? 'CAD' : 'USD';
      
      if (!byCurrency[currency]) {
        byCurrency[currency] = 0;
      }
      
      byCurrency[currency] += lease.rentAmount;
      total += lease.rentAmount;
    }
  });
  
  return {
    total,
    byCurrency
  };
}

