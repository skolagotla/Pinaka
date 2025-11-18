/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN AUTHENTICATION MIDDLEWARE
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { validateSession } from '../admin/session';

export type AdminContext = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
};

export type AdminApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  admin: AdminContext
) => Promise<void>;

export type AdminMiddlewareOptions = {
  /**
   * Allow only specific HTTP methods
   */
  allowedMethods?: string[];
  
  /**
   * Require specific admin role
   */
  requireRole?: 'SUPER_ADMIN' | 'PLATFORM_ADMIN' | 'SUPPORT_ADMIN' | 'BILLING_ADMIN' | 'AUDIT_ADMIN';
  
  /**
   * Skip authentication check (for public endpoints)
   */
  skipAuth?: boolean;
};

/**
 * Admin API Middleware - Wraps API routes with admin authentication
 * 
 * Usage:
 * ```typescript
 * export default withAdminAuth(async (req, res, admin) => {
 *   // Your API logic here
 *   // admin.id, admin.email, admin.role are available
 * });
 * ```
 */
/**
 * Set CORS headers for cross-origin requests
 */
function setCorsHeaders(req: NextApiRequest, res: NextApiResponse) {
  const origin = req.headers.origin;
  const allowedOrigin = process.env.NODE_ENV === 'production'
    ? process.env.WEB_APP_URL || 'https://localhost:3000'
    : 'http://localhost:3000';
  
  // Allow the origin if it matches our allowed origin
  if (origin === allowedOrigin || process.env.NODE_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Origin', origin || allowedOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  }
}

export function withAdminAuth(
  handler: AdminApiHandler,
  options: AdminMiddlewareOptions = {}
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Handle CORS preflight requests
      setCorsHeaders(req, res);
      
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
      
      // Validate HTTP method
      if (options.allowedMethods && !options.allowedMethods.includes(req.method || '')) {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
      }

      // Skip auth if requested
      if (options.skipAuth) {
        return await handler(req, res, {
          id: '',
          email: '',
          firstName: '',
          lastName: '',
          role: 'AUDIT_ADMIN',
          isActive: false,
        });
      }

      // Get session token from cookie
      const sessionToken = req.cookies.admin_session;

      if (!sessionToken) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'No session token found',
        });
      }

      // Validate session
      const sessionData = await validateSession(sessionToken);

      if (!sessionData) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Invalid or expired session',
        });
      }

      const admin = sessionData.admin;

      // Check role requirement - check both base Admin.role and RBAC roles
      if (options.requireRole) {
        let hasRequiredRole = false;
        
        // First check base Admin.role
        if (admin.role === options.requireRole) {
          hasRequiredRole = true;
        } else {
          // Check RBAC roles
          try {
            const { prisma } = require('../prisma');
            const userRole = await prisma.userRole.findFirst({
              where: {
                userId: admin.id,
                userType: 'admin',
                isActive: true,
                role: {
                  name: options.requireRole,
                },
              },
            }).catch(() => null);
            
            if (userRole) {
              hasRequiredRole = true;
            }
          } catch (rbacError) {
            // If RBAC check fails, continue with base role check only
            if (process.env.NODE_ENV === 'development') {
              console.log('[AdminAuth] RBAC check error:', rbacError?.message);
            }
          }
        }
        
        if (!hasRequiredRole) {
          return res.status(403).json({
            success: false,
            error: 'Forbidden',
            message: `This endpoint requires ${options.requireRole} role`,
          });
        }
      }

      // Execute handler with admin context
      await handler(req, res, {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        isActive: admin.isActive,
      });
    } catch (error: any) {
      // Ensure CORS headers are set even on errors
      setCorsHeaders(req, res);
      console.error(`[Admin API Error] ${req.method} ${req.url}:`, error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message || 'Unknown error',
      });
    }
  };
}

