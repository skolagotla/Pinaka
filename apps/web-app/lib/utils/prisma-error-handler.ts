/**
 * ═══════════════════════════════════════════════════════════════
 * PRISMA ERROR HANDLER
 * ═══════════════════════════════════════════════════════════════
 * 
 * Centralized error handling for Prisma errors
 * Provides consistent error responses across all API endpoints
 * 
 * Usage:
 *   import { handlePrismaError } from '@/lib/utils/prisma-error-handler';
 *   
 *   try {
 *     await prisma.tenant.create({ ... });
 *   } catch (error) {
 *     return handlePrismaError(error, res, 'tenant');
 *   }
 * 
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiResponse } from 'next';

export interface PrismaErrorResponse {
  statusCode: number;
  error: string;
  message?: string;
  field?: string;
}

/**
 * Handle Prisma errors and return standardized responses
 * 
 * @param error - Prisma error object
 * @param res - Next.js API response object
 * @param entityName - Name of the entity (e.g., 'tenant', 'landlord', 'property')
 * @param customMessages - Optional custom error messages
 * @returns NextApiResponse or null if response was sent
 */
export function handlePrismaError(
  error: any,
  res: NextApiResponse,
  entityName: string = 'record',
  customMessages?: {
    notFound?: string;
    duplicate?: (field: string) => string;
    invalidReference?: string;
    validation?: string;
  }
): boolean {
  // If response already sent, return false
  if (res.headersSent) {
    console.error('[Prisma Error Handler] Response already sent:', error);
    return false;
  }

  const entityNameCapitalized = entityName.charAt(0).toUpperCase() + entityName.slice(1);

  // P2002: Unique constraint violation
  if (error.code === 'P2002') {
    const field = error.meta?.target?.[0] || 'field';
    
    let errorMessage: string;
    if (customMessages?.duplicate) {
      errorMessage = customMessages.duplicate(field);
    } else if (field === 'email') {
      errorMessage = `A ${entityName} with this email already exists`;
    } else if (field === `${entityName}Id`) {
      errorMessage = `A ${entityName} with these details already exists`;
    } else {
      errorMessage = `Duplicate ${field} found`;
    }

    res.status(400).json({
      success: false,
      error: errorMessage,
      field,
    });
    return true;
  }

  // P2025: Record not found
  if (error.code === 'P2025') {
    const errorMessage = customMessages?.notFound || `${entityNameCapitalized} not found`;
    res.status(404).json({
      success: false,
      error: errorMessage,
    });
    return true;
  }

  // P2003: Foreign key constraint violation
  if (error.code === 'P2003') {
    const errorMessage = customMessages?.invalidReference || 
      `Invalid reference: ${error.meta?.field_name || 'Referenced record does not exist'}`;
    res.status(400).json({
      success: false,
      error: errorMessage,
      field: error.meta?.field_name,
    });
    return true;
  }

  // P2000-P2010: Client validation errors
  if (error.code && error.code.startsWith('P20')) {
    const errorMessage = customMessages?.validation || 
      `Invalid ${entityName} data. Please check all fields and try again.`;
    res.status(400).json({
      success: false,
      error: errorMessage,
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && {
        code: error.code,
        meta: error.meta,
      }),
    });
    return true;
  }

  // Unknown Prisma error
  console.error('[Prisma Error Handler] Unhandled Prisma error:', {
    code: error.code,
    message: error.message,
    meta: error.meta,
  });

  res.status(500).json({
    success: false,
    error: `Failed to process ${entityName}`,
    message: error.message || 'Unknown error',
    ...(process.env.NODE_ENV === 'development' && {
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    }),
  });
  return true;
}

// CommonJS exports for require() compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    handlePrismaError,
    isPrismaError,
    getPrismaErrorMessage,
  };
}

/**
 * Check if error is a Prisma error
 */
export function isPrismaError(error: any): boolean {
  return error && (
    error.code?.startsWith('P') ||
    error.name === 'PrismaClientKnownRequestError' ||
    error.name === 'PrismaClientValidationError' ||
    error.name === 'PrismaClientInitializationError'
  );
}

/**
 * Extract user-friendly error message from Prisma error
 */
export function getPrismaErrorMessage(error: any, entityName: string = 'record'): string {
  if (!isPrismaError(error)) {
    return error.message || 'An error occurred';
  }

  const entityNameCapitalized = entityName.charAt(0).toUpperCase() + entityName.slice(1);

  switch (error.code) {
    case 'P2002':
      const field = error.meta?.target?.[0] || 'field';
      if (field === 'email') {
        return `A ${entityName} with this email already exists`;
      }
      return `Duplicate ${field} found`;
    
    case 'P2025':
      return `${entityNameCapitalized} not found`;
    
    case 'P2003':
      return `Invalid reference: ${error.meta?.field_name || 'Referenced record does not exist'}`;
    
    default:
      return `Invalid ${entityName} data. Please check all fields and try again.`;
  }
}

