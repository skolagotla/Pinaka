/**
 * RBAC Middleware
 * Phase 2: Permission Checking Logic
 * 
 * Middleware functions for API routes and Next.js handlers
 */

import { NextApiRequest, NextApiResponse } from 'next';
import {
  hasPermission,
  canAccess,
  filterByScope,
  logPermissionCheck,
  getUserScopes,
} from './permissions';
import { ResourceCategory, PermissionAction } from '@prisma/client';

/**
 * Middleware options for RBAC
 */
export interface RBACMiddlewareOptions {
  requiredPermission?: {
    resource: string;
    action: PermissionAction;
    category: ResourceCategory;
  };
  requireScope?: {
    type: 'portfolio' | 'property' | 'unit';
    id?: string;
  };
  requireApproval?: boolean;
  logAccess?: boolean;
}

/**
 * Get user info from request (session, token, etc.)
 * This is a placeholder - implement based on your auth system
 */
function getUserFromRequest(req: NextApiRequest): {
  userId: string;
  userType: string;
  email?: string;
  name?: string;
} | null {
  // Implement based on existing authentication system (Auth0 via apiMiddleware)
  // The withAuth middleware already extracts user info, so this function
  // should be called from within an authenticated context
  
  // Try to get user from request (set by withAuth middleware)
  const userContext = (req as any).user as { userId: string; role: string; email: string; userName: string; organizationId?: string | null } | undefined;
  if (userContext) {
    return {
      userId: userContext.userId,
      userType: userContext.role, // Map role to userType
      email: userContext.email,
      name: userContext.userName,
    };
  }
  
  // Fallback: Try to get from session (Auth0) - synchronous check only
  // Note: For async session checks, use withAuth middleware which handles this properly
  try {
    const session = (req as any).session;
    if (session?.user) {
      return {
        userId: session.user.id || session.user.sub || session.user.email,
        userType: session.user.type || session.user.role || 'tenant',
        email: session.user.email,
        name: session.user.name || session.user.email,
      };
    }
  } catch (error) {
    // Session check failed
  }
  
  return null;
}

/**
 * RBAC middleware for API routes
 * @param handler - API route handler
 * @param options - RBAC middleware options
 * @returns Wrapped handler with RBAC checks
 */
export function withRBAC(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  options: RBACMiddlewareOptions = {}
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

      // Check required permission
      if (options.requiredPermission) {
        const { resource, action, category } = options.requiredPermission;
        
        // Get scope from request (query params, body, etc.)
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
          // Log denied access
          if (options.logAccess) {
            await logPermissionCheck(
              user.userId,
              user.userType,
              action,
              resource,
              req.query.id as string || '',
              false,
              req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
              req.headers['user-agent']
            );
          }

          return res.status(403).json({
            success: false,
            error: 'Forbidden',
            message: `You do not have permission to ${action} ${resource}`,
          });
        }

        // Log allowed access
        if (options.logAccess) {
          await logPermissionCheck(
            user.userId,
            user.userType,
            action,
            resource,
            req.query.id as string || '',
            true,
            req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
            req.headers['user-agent']
          );
        }
      }

      // Check scope requirement
      if (options.requireScope) {
        const scopes = await getUserScopes(user.userId, user.userType);
        const { type, id } = options.requireScope;

        const hasScope = scopes.some((scope) => {
          switch (type) {
            case 'portfolio':
              return scope.portfolioId === id || scope.portfolioId !== null;
            case 'property':
              return scope.propertyId === id || scope.propertyId !== null;
            case 'unit':
              return scope.unitId === id || scope.unitId !== null;
            default:
              return false;
          }
        });

        if (!hasScope) {
          return res.status(403).json({
            success: false,
            error: 'Forbidden',
            message: `You do not have access to this ${type}`,
          });
        }
      }

      // Call the original handler
      return handler(req, res);
    } catch (error: any) {
      console.error('RBAC middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'An error occurred',
      });
    }
  };
}

/**
 * Scope-based access middleware
 * Filters queries automatically by user's scope
 * @param handler - API route handler
 * @param resourceType - Type of resource being accessed
 * @returns Wrapped handler with scope filtering
 */
export function withScopeCheck(
  handler: (
    req: NextApiRequest,
    res: NextApiResponse,
    filteredQuery?: any
  ) => Promise<void>,
  resourceType: string
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const user = getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      // Build base query from request
      const baseQuery = {
        where: {
          ...(req.query.id && { id: req.query.id as string }),
          ...(req.body && typeof req.body === 'object' && req.body),
        },
        include: req.query.include
          ? JSON.parse(req.query.include as string)
          : undefined,
      };

      // Filter by scope
      const filteredQuery = await filterByScope(
        baseQuery,
        user.userId,
        user.userType,
        resourceType
      );

      // Pass filtered query to handler
      return handler(req, res, filteredQuery);
    } catch (error: any) {
      console.error('Scope check middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'An error occurred',
      });
    }
  };
}

/**
 * Approval workflow middleware
 * Checks if action requires approval and if user can approve
 * @param handler - API route handler
 * @param workflowType - Type of approval workflow
 * @returns Wrapped handler with approval checks
 */
export function withApprovalWorkflow(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  workflowType: 'expense' | 'lease' | 'maintenance' | 'property_edit'
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const user = getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      // Check if user can approve based on workflow type
      let canApprove = false;
      const requiredRole = getRequiredApproverRole(workflowType);

      if (requiredRole) {
        // Check if user has the required role
        const scopes = await getUserScopes(user.userId, user.userType);
        
        // This is simplified - would need to check actual roles
        // For now, we'll check based on user type
        switch (workflowType) {
          case 'expense':
            // Big expenses need PMC Admin, Accountant, or Owner approval
            canApprove =
              user.userType === 'pmc' ||
              user.userType === 'landlord' ||
              user.userType === 'admin';
            break;
          case 'lease':
            // Leases always need Owner approval
            canApprove = user.userType === 'landlord' || user.userType === 'admin';
            break;
          case 'maintenance':
            // Maintenance needs PM or Owner approval
            canApprove =
              user.userType === 'pmc' ||
              user.userType === 'landlord' ||
              user.userType === 'admin';
            break;
          case 'property_edit':
            // Property edits need Owner approval
            canApprove = user.userType === 'landlord' || user.userType === 'admin';
            break;
        }
      }

      if (!canApprove && req.method !== 'GET') {
        // Only check approval for non-GET requests
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: `You do not have permission to approve ${workflowType} requests`,
        });
      }

      return handler(req, res);
    } catch (error: any) {
      console.error('Approval workflow middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'An error occurred',
      });
    }
  };
}

/**
 * Get required approver role for workflow type
 * @param workflowType - Type of workflow
 * @returns Required role or null
 */
function getRequiredApproverRole(
  workflowType: string
): string | null {
  switch (workflowType) {
    case 'expense':
      return 'ACCOUNTANT'; // Or PMC_ADMIN, OWNER_LANDLORD
    case 'lease':
      return 'OWNER_LANDLORD';
    case 'maintenance':
      return 'PROPERTY_MANAGER'; // Or OWNER_LANDLORD
    case 'property_edit':
      return 'OWNER_LANDLORD';
    default:
      return null;
  }
}

/**
 * Helper to extract IP address from request
 */
export function getClientIp(req: NextApiRequest): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

/**
 * Helper to extract user agent from request
 */
export function getUserAgent(req: NextApiRequest): string {
  return req.headers['user-agent'] || 'unknown';
}

