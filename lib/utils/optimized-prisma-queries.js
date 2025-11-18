/**
 * Optimized Prisma Query Utilities
 * 
 * Provides optimized query patterns to prevent N+1 queries and improve performance
 */

/**
 * Batch fetch related entities to prevent N+1 queries
 * 
 * @param {Object} prisma - Prisma client instance
 * @param {Array} items - Array of items with IDs
 * @param {string} model - Prisma model name (e.g., 'tenant', 'property')
 * @param {Object} select - Fields to select
 * @param {string} idField - Field name for the ID (default: 'id')
 * @returns {Promise<Map>} Map of id -> entity for O(1) lookup
 * 
 * @example
 * const tenantIds = forms.map(f => f.tenantId).filter(Boolean);
 * const tenantMap = await batchFetchEntities(prisma, tenantIds, 'tenant', {
 *   id: true,
 *   firstName: true,
 *   lastName: true,
 * });
 */
export async function batchFetchEntities(prisma, items, model, select, idField = 'id') {
  if (!items || items.length === 0) {
    return new Map();
  }

  // Extract unique IDs
  const ids = [...new Set(items.filter(Boolean))];
  
  if (ids.length === 0) {
    return new Map();
  }

  // Fetch all entities in one query
  const entities = await prisma[model].findMany({
    where: { [idField]: { in: ids } },
    select,
  });

  // Create lookup map for O(1) access
  return new Map(entities.map(entity => [entity[idField], entity]));
}

/**
 * Enrich items with related entities using batch fetching
 * 
 * @param {Object} prisma - Prisma client instance
 * @param {Array} items - Array of items to enrich
 * @param {Array} enrichments - Array of enrichment configs
 * @returns {Promise<Array>} Enriched items
 * 
 * @example
 * const enrichedForms = await enrichWithBatchFetch(prisma, forms, [
 *   {
 *     field: 'tenantId',
 *     model: 'tenant',
 *     select: { id: true, firstName: true, lastName: true },
 *     targetField: 'tenant',
 *   },
 *   {
 *     field: 'propertyId',
 *     model: 'property',
 *     select: { id: true, propertyName: true, addressLine1: true },
 *     targetField: 'property',
 *   },
 * ]);
 */
export async function enrichWithBatchFetch(prisma, items, enrichments) {
  if (!items || items.length === 0) {
    return items;
  }

  // Collect all IDs for each enrichment
  const enrichmentMaps = await Promise.all(
    enrichments.map(async (enrichment) => {
      const ids = items
        .map(item => item[enrichment.field])
        .filter(Boolean);
      
      const entityMap = await batchFetchEntities(
        prisma,
        ids,
        enrichment.model,
        enrichment.select,
        enrichment.idField || 'id'
      );

      return { ...enrichment, map: entityMap };
    })
  );

  // Enrich items using maps
  return items.map((item) => {
    const enriched = { ...item };
    
    enrichmentMaps.forEach(({ field, targetField, map }) => {
      const id = item[field];
      if (id && map.has(id)) {
        enriched[targetField || field] = map.get(id);
      }
    });

    return enriched;
  });
}

/**
 * Optimize Prisma query by using select instead of include
 * Converts include-based queries to select-based for better performance
 * 
 * @param {Object} query - Prisma query object
 * @returns {Object} Optimized query with select instead of include
 * 
 * @example
 * const query = {
 *   where: { id: '123' },
 *   include: {
 *     tenant: true,
 *     property: { include: { units: true } },
 *   },
 * };
 * const optimized = optimizeQuery(query);
 */
export function optimizeQuery(query) {
  if (!query.include) {
    return query;
  }

  const select = convertIncludeToSelect(query.include);
  
  return {
    ...query,
    select,
    include: undefined, // Remove include
  };
}

/**
 * Convert include object to select object
 * Helper function for optimizeQuery
 */
function convertIncludeToSelect(include) {
  const select = {};
  
  for (const [key, value] of Object.entries(include)) {
    if (value === true) {
      select[key] = true;
    } else if (typeof value === 'object' && value !== null) {
      select[key] = {
        select: convertIncludeToSelect(value.include || value),
      };
    }
  }
  
  return select;
}

/**
 * Parallelize independent Prisma queries
 * 
 * @param {Array<Promise>} queries - Array of Prisma query promises
 * @returns {Promise<Array>} Results of all queries
 * 
 * @example
 * const [tenants, properties, leases] = await parallelizeQueries([
 *   prisma.tenant.findMany({ where: { ... } }),
 *   prisma.property.findMany({ where: { ... } }),
 *   prisma.lease.findMany({ where: { ... } }),
 * ]);
 */
export async function parallelizeQueries(queries) {
  return Promise.all(queries);
}

