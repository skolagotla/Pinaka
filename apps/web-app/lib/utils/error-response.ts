/**
 * Standardized Error Response Utility
 * 
 * Provides consistent error response format across all API endpoints
 * for better frontend error handling and debugging.
 */

export interface StandardErrorResponse {
  success: false;
  error: string; // Error code (e.g., 'PROPERTY_UPDATE_FAILED')
  message: string; // Human-readable message
  details?: any; // Additional details (only in development)
  code?: string; // Prisma error code or similar
}

export interface StandardSuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    [key: string]: any;
  };
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  errorCode: string,
  message: string,
  statusCode: number = 500,
  details?: any
): { statusCode: number; response: StandardErrorResponse } {
  const response: StandardErrorResponse = {
    success: false,
    error: errorCode,
    message,
  };

  // Only include details in development
  if (process.env.NODE_ENV === 'development' && details) {
    response.details = details;
    if (details.code) {
      response.code = details.code;
    }
  }

  return { statusCode, response };
}

/**
 * Common error codes
 */
export const ErrorCodes = {
  // Validation errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_INPUT: 'INVALID_INPUT',
  BAD_REQUEST: 'BAD_REQUEST',
  
  // Method errors (405)
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  
  // Authentication/Authorization errors (401/403)
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Not found errors (404)
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  
  // Conflict errors (409)
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  CONFLICT: 'CONFLICT',
  
  // Server errors (500)
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  
  // Property-specific
  PROPERTY_UPDATE_FAILED: 'PROPERTY_UPDATE_FAILED',
  PROPERTY_NOT_FOUND: 'PROPERTY_NOT_FOUND',
  UNIT_UPDATE_FAILED: 'UNIT_UPDATE_FAILED',
  
  // Tenant-specific
  TENANT_UPDATE_FAILED: 'TENANT_UPDATE_FAILED',
  TENANT_NOT_FOUND: 'TENANT_NOT_FOUND',
  
  // Lease-specific
  LEASE_UPDATE_FAILED: 'LEASE_UPDATE_FAILED',
  LEASE_NOT_FOUND: 'LEASE_NOT_FOUND',
} as const;

/**
 * Handle Prisma errors and convert to standardized format
 */
export function handlePrismaError(error: any): { statusCode: number; response: StandardErrorResponse } {
  // P2002: Unique constraint violation
  if (error.code === 'P2002') {
    const field = error.meta?.target?.[0] || 'field';
    return createErrorResponse(
      ErrorCodes.DUPLICATE_ENTRY,
      `A record with this ${field} already exists`,
      409,
      { code: error.code, field }
    );
  }

  // P2025: Record not found
  if (error.code === 'P2025') {
    return createErrorResponse(
      ErrorCodes.NOT_FOUND,
      'Record not found',
      404,
      { code: error.code }
    );
  }

  // P2003: Foreign key constraint violation
  if (error.code === 'P2003') {
    return createErrorResponse(
      ErrorCodes.VALIDATION_ERROR,
      `Invalid reference: ${error.meta?.field_name || 'Referenced record does not exist'}`,
      400,
      { code: error.code, field: error.meta?.field_name }
    );
  }

  // P2000-P2010: Client validation errors
  if (error.code && error.code.startsWith('P20')) {
    return createErrorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Invalid data provided',
      400,
      { code: error.code, message: error.message }
    );
  }

  // Generic database error
  return createErrorResponse(
    ErrorCodes.DATABASE_ERROR,
    'Database operation failed',
    500,
    process.env.NODE_ENV === 'development' ? { code: error.code, message: error.message } : undefined
  );
}

/**
 * Create success response
 */
export function createSuccessResponse<T>(
  data: T,
  meta?: StandardSuccessResponse<T>['meta']
): StandardSuccessResponse<T> {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  };
}

