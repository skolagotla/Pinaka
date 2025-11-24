/**
 * CRUD Helper Utility
 * 
 * Provides common patterns for CRUD operations in API endpoints.
 * Reduces code duplication while maintaining flexibility for custom logic.
 * 
 * @example
 * // In your API endpoint:
 * import { createCRUDHandler } from '@/lib/middleware/crudHelper';
 * 
 * export default withAuth(createCRUDHandler({
 *   model: 'property',
 *   getWhere: (user) => ({ landlordId: user.userId }),
 *   createData: (body, user) => ({ ...body, landlordId: user.userId }),
 *   validateCreate: (data) => {
 *     if (!data.addressLine1) throw new Error('Address is required');
 *   }
 * }));
 */

const { prisma } = require('@/lib/prisma');
const { executeWithRetry } = require('@/lib/utils/db-connection-manager');
const { getCache, setCache, shouldCache, getCacheConfig } = require('@/lib/utils/api-cache');

/**
 * Create a CRUD handler for a Prisma model
 * @param {Object} config - Configuration object
 * @returns {Function} Handler function compatible with withAuth
 */
export function createCRUDHandler(config) {
  const {
    model, // Prisma model name (e.g., 'property', 'unit')
    getWhere, // Function to generate WHERE clause for GET
    createData, // Function to transform request body for CREATE
    updateData, // Function to transform request body for UPDATE
    validateCreate, // Optional validation function for CREATE
    validateUpdate, // Optional validation function for UPDATE
    beforeCreate, // Optional hook before CREATE
    afterCreate, // Optional hook after CREATE
    beforeUpdate, // Optional hook before UPDATE
    afterUpdate, // Optional hook after UPDATE
    beforeDelete, // Optional hook before DELETE
    afterDelete, // Optional hook after DELETE
    include, // Optional include object for GET queries
    orderBy = { createdAt: 'desc' }, // Default orderBy
    allowedMethods = ['GET', 'POST', 'PATCH', 'DELETE'],
    processQueryParams, // Optional function to process query params
    transformResponse, // Optional function to transform GET response
    checkAccess, // Optional function to check access for PATCH/DELETE
    softDelete, // Optional function for soft delete
  } = config;

  return async (req, res, user) => {
    // Check if method is allowed
    if (!allowedMethods.includes(req.method)) {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      // GET - List all records
      if (req.method === 'GET') {
        return await handleGet(req, res, user, {
          model,
          getWhere,
          include,
          orderBy,
          processQueryParams,
          transformResponse
        });
      }

      // POST - Create new record
      if (req.method === 'POST') {
        return await handlePost(req, res, user, {
          model,
          createData,
          validateCreate,
          beforeCreate,
          afterCreate
        });
      }

      // PATCH - Update existing record (requires [id].ts file)
      if (req.method === 'PATCH') {
        return await handlePatch(req, res, user, {
          model,
          updateData,
          validateUpdate,
          beforeUpdate,
          afterUpdate,
          checkAccess,
          transformResponse
        });
      }

      // DELETE - Delete record (requires [id].ts file)
      if (req.method === 'DELETE') {
        return await handleDelete(req, res, user, {
          model,
          beforeDelete,
          afterDelete,
          checkAccess,
          softDelete
        });
      }
    } catch (error) {
      console.error(`[${model} API] Error:`, error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  };
}

/**
 * Handle GET request
 */
async function handleGet(req, res, user, config) {
  const { model, getWhere, include, orderBy, processQueryParams, transformResponse, pagination } = config;
  
  try {
    // Check cache first (only for GET requests)
    if (shouldCache(req.url, 'GET')) {
      const cached = getCache(req.url, 'GET', req.query);
      if (cached) {
        return res.status(200).json(cached);
      }
    }
    
    let where = getWhere ? getWhere(user, req.query) : {};
    
    // Allow custom query parameter processing
    if (processQueryParams) {
      const customWhere = processQueryParams(req.query, user);
      where = { ...where, ...customWhere };
    }
    
    // Handle pagination if enabled
    const limit = pagination ? parseInt(req.query.limit || '50') : undefined;
    const offset = pagination ? parseInt(req.query.offset || '0') : undefined;
    
    // Get total count if pagination is enabled
    let total = undefined;
    if (pagination) {
      total = await executeWithRetry(
        () => prisma[model].count({ where }),
        { maxRetries: 2, timeout: 10000 }
      );
    }
    
    const records = await executeWithRetry(
      () => prisma[model].findMany({
        where,
        include,
        orderBy,
        take: limit,
        skip: offset,
      }),
      { maxRetries: 2, timeout: 15000 }
    );

    // Allow response transformation (e.g., wrap in { success: true, data: [...] })
    const response = transformResponse 
      ? transformResponse(records, req.query, total) 
      : pagination && total !== undefined
      ? { success: true, data: records, meta: { total } }
      : { success: true, data: records };
    
    // Cache response if enabled
    if (shouldCache(req.url, 'GET')) {
      const config = getCacheConfig(req.url);
      setCache(req.url, response, 'GET', req.query, config.ttl);
    }
    
    return res.status(200).json(response);
  } catch (error) {
    console.error(`[${model} API] GET Error:`, error);
    return res.status(500).json({
      error: `Failed to fetch ${model}s`,
      message: error?.message || 'Unknown error'
    });
  }
}

/**
 * Handle POST request
 */
async function handlePost(req, res, user, config) {
  const { model, createData, validateCreate, beforeCreate, afterCreate } = config;
  
  try {
    // Transform request body
    const data = createData ? createData(req.body, user) : req.body;

    // Validate if validator provided
    if (validateCreate) {
      await validateCreate(data, user);
    }

    // Before create hook
    if (beforeCreate) {
      await beforeCreate(data, user);
    }

    // Create record with retry logic
    const record = await executeWithRetry(
      () => prisma[model].create({ data }),
      { maxRetries: 2, timeout: 10000 }
    );

    // After create hook
    if (afterCreate) {
      await afterCreate(record, user);
    }

    return res.status(201).json({ success: true, data: record });
  } catch (error) {
    console.error(`[${model} API] POST Error:`, error);
    
    // Handle validation errors
    if (error?.message && error.message.includes('required')) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.message
      });
    }

    return res.status(500).json({
      error: `Failed to create ${model}`,
      message: error?.message || 'Unknown error'
    });
  }
}

/**
 * Handle PATCH request (for [id].ts files)
 */
async function handlePatch(req, res, user, config) {
  const { model, updateData, validateUpdate, beforeUpdate, afterUpdate, checkAccess, transformResponse } = config;
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  try {
    // Check if record exists with retry
    const existing = await executeWithRetry(
      () => prisma[model].findUnique({ where: { id } }),
      { maxRetries: 2, timeout: 5000 }
    );

    if (!existing) {
      return res.status(404).json({ error: `${model} not found` });
    }

    // Check access/authorization if provided
    if (checkAccess) {
      const hasAccess = await checkAccess(existing, user);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Transform request body
    const data = updateData ? updateData(req.body, user, existing) : req.body;

    // Validate if validator provided
    if (validateUpdate) {
      await validateUpdate(data, user, existing);
    }

    // Before update hook
    if (beforeUpdate) {
      await beforeUpdate(data, user, existing);
    }

    // Update record with retry logic
    const record = await executeWithRetry(
      () => prisma[model].update({ where: { id }, data }),
      { maxRetries: 2, timeout: 10000 }
    );

    // After update hook
    if (afterUpdate) {
      await afterUpdate(record, user, existing);
    }

    // Transform response if provided
    const response = transformResponse 
      ? transformResponse(record, req.query) 
      : { success: true, data: record };
    return res.status(200).json(response);
  } catch (error) {
    console.error(`[${model} API] PATCH Error:`, error);
    return res.status(500).json({
      error: `Failed to update ${model}`,
      message: error?.message || 'Unknown error'
    });
  }
}

/**
 * Handle DELETE request (for [id].ts files)
 */
async function handleDelete(req, res, user, config) {
  const { model, beforeDelete, afterDelete, checkAccess, softDelete } = config;
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  try {
    // Check if record exists with retry
    const existing = await executeWithRetry(
      () => prisma[model].findUnique({ where: { id } }),
      { maxRetries: 2, timeout: 5000 }
    );

    if (!existing) {
      return res.status(404).json({ error: `${model} not found` });
    }

    // Check access/authorization if provided
    if (checkAccess) {
      const hasAccess = await checkAccess(existing, user);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Before delete hook
    if (beforeDelete) {
      await beforeDelete(existing, user);
    }

    // Soft delete or hard delete (with retry)
    if (softDelete) {
      // Soft delete - update status field
      await executeWithRetry(
        () => prisma[model].update({
          where: { id },
          data: softDelete(existing)
        }),
        { maxRetries: 2, timeout: 10000 }
      );
    } else {
      // Hard delete
      await executeWithRetry(
        () => prisma[model].delete({ where: { id } }),
        { maxRetries: 2, timeout: 10000 }
      );
    }

    // After delete hook
    if (afterDelete) {
      await afterDelete(existing, user);
    }

    return res.status(200).json({ success: true, message: `${model} deleted successfully` });
  } catch (error) {
    console.error(`[${model} API] DELETE Error:`, error);
    return res.status(500).json({
      error: `Failed to delete ${model}`,
      message: error?.message || 'Unknown error'
    });
  }
}

/**
 * Common validation helpers
 */
export const validators = {
  /**
   * Validate required fields
   */
  requireFields: (fields) => {
    return (data) => {
      const missing = fields.filter(field => !data[field]);
      if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
      }
    };
  },

  /**
   * Validate ownership (for landlord resources)
   */
  requireOwnership: (model, ownerField = 'landlordId') => {
    return async (data, user, existing) => {
      if (existing && existing[ownerField] !== user.userId) {
        throw new Error('Forbidden: You do not own this resource');
      }
    };
  },
};

