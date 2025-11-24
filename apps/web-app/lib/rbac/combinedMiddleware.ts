/**
 * Combined RBAC Middleware
 * Phase 3: Data Isolation & Multi-Tenancy
 * 
 * Middleware that combines permission checking and data isolation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import {
  hasPermission,
  canAccessResource,
  applyDataIsolation,
  getIsolationContext,
} from './index';
import { ResourceCategory, PermissionAction } from '@prisma/client';

/**
 * Combined middleware options
 */
export interface CombinedRBACOptions {
  requiredPermission?: {
    resource: string;
    action: PermissionAction;
    category: ResourceCategory;
  };
  resourceType?: 'property' | 'unit' | 'tenant' | 'maintenance' | 'document' | 'expense';
  resourceId?: string; // ID from query params or body
  requireScope?: boolean;
  logAccess?: boolean;
}

/**
 * Get user from request (implement based on your auth system)
 */
function getUserFromRequest(req: NextApiRequest): {
  userId: string;
  userType: string;
  email?: string;
  name?: string;
} | null {
  // Implement based on existing authentication system (Auth0 via apiMiddleware)
  // Use the withAuth middleware which sets req.user with UserContext
  const session = (req as any).session;
  if (session?.user) {
    return {
      userId: session.user.id,
      userType: session.user.type || 'tenant',
      email: session.user.email,
      name: session.user.name,
    };
  }
  return null;
}

/**
 * Combined RBAC middleware with data isolation
 * Checks permissions AND enforces data isolation
 */
export function withCombinedRBAC(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  options: CombinedRBACOptions = {}
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Get user from request
      const user = getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      // Check permission if required
      if (options.requiredPermission) {
        const { resource, action, category } = options.requiredPermission;

        // Get scope from request
        const scope = {
          portfolioId: req.query.portfolioId as string | undefined,
          propertyId: req.query.propertyId as string | undefined,
          unitId: req.query.unitId as string | undefined,
          pmcId: req.query.pmcId as string | undefined,
          landlordId: req.query.landlordId as string | undefined,
        };

        const hasAccess = await hasPermission(
          user.userId,
          user.userType,
          resource,
          action,
          category,
          scope
        );

        if (!hasAccess) {
          return res.status(403).json({
            success: false,
            error: 'Forbidden',
            message: `You do not have permission to ${action} ${resource}`,
          });
        }
      }

      // Check resource access if resource ID is provided
      if (options.resourceType && options.resourceId) {
        const canAccess = await canAccessResource(
          user.userId,
          user.userType,
          options.resourceId,
          options.resourceType
        );

        if (!canAccess) {
          return res.status(403).json({
            success: false,
            error: 'Forbidden',
            message: `You do not have access to this ${options.resourceType}`,
          });
        }
      }

      // Apply data isolation to query if resource type is specified
      if (options.resourceType && req.method === 'GET') {
        // For GET requests, we can pre-filter the query
        const baseQuery = {
          where: {
            ...(req.query.id && { id: req.query.id as string }),
            ...(req.query as any),
          },
        };

        const isolatedQuery = await applyDataIsolation(
          baseQuery,
          user.userId,
          user.userType,
          options.resourceType
        );

        // Attach isolated query to request for handler to use
        (req as any).isolatedQuery = isolatedQuery;
      }

      // Call the original handler
      return handler(req, res);
    } catch (error: any) {
      console.error('Combined RBAC middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'An error occurred',
      });
    }
  };
}

/**
 * Middleware for scope-required endpoints
 * Ensures user has appropriate scope before allowing access
 */
export function requireScope(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  scopeType: 'portfolio' | 'property' | 'unit'
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const user = getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const context = await getIsolationContext(user.userId, user.userType);

      // Check if user has the required scope
      const hasScope = context.scopes.some((scope) => {
        switch (scopeType) {
          case 'portfolio':
            return scope.portfolioId !== null;
          case 'property':
            return scope.propertyId !== null;
          case 'unit':
            return scope.unitId !== null;
          default:
            return false;
        }
      });

      if (!hasScope) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: `You must have a ${scopeType} scope to access this resource`,
        });
      }

      return handler(req, res);
    } catch (error: any) {
      console.error('Scope requirement middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'An error occurred',
      });
    }
  };
}

