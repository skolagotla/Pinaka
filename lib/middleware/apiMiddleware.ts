import { NextApiRequest, NextApiResponse } from "next";
// Auth0 disabled - using password-based authentication
// import { auth0 } from '../auth0';
const config = require('../config/app-config').default || require('../config/app-config');

// Auto-initialize RBAC on application startup (when middleware is first loaded)
if (typeof window === 'undefined') {
  // Only run on server-side
  require('@/lib/rbac/autoInitialize');
}

export type UserContext = {
  email: string;
  role: 'landlord' | 'tenant' | 'vendor' | 'contractor' | 'pmc' | 'admin';
  userId: string;
  userName: string;
  organizationId?: string | null; // Organization ID for SaaS multi-tenancy
};

export type ApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  user: UserContext
) => Promise<void | NextApiResponse>;

export type ApiMiddlewareOptions = {
  /**
   * Allow only specific HTTP methods
   */
  allowedMethods?: string[];
  
  /**
   * Require specific user role(s) - can be a single role or array of roles
   */
  requireRole?: 'landlord' | 'tenant' | 'vendor' | 'contractor' | 'pmc' | 'admin' | Array<'landlord' | 'tenant' | 'vendor' | 'contractor' | 'pmc' | 'admin'>;
  
  /**
   * Skip authentication check (for public endpoints)
   */
  skipAuth?: boolean;
  
  /**
   * Allow admin users to access this endpoint (default: true)
   */
  allowAdmin?: boolean;
};

/**
 * API Middleware - Wraps API routes with common functionality
 * 
 * Features:
 * - Authentication via Auth0 session
 * - User role detection (landlord/tenant)
 * - Standardized error handling
 * - HTTP method validation
 * - Role-based access control
 * 
 * Usage:
 * ```typescript
 * export default withAuth(async (req, res, user) => {
 *   // Your API logic here
 *   // user.email, user.role, user.userId are available
 * });
 * ```
 * 
 * With options:
 * ```typescript
 * export default withAuth(async (req, res, user) => {
 *   // Only landlords can access this endpoint
 * }, { requireRole: 'landlord', allowedMethods: ['GET', 'POST'] });
 * ```
 */
export function withAuth(handler: ApiHandler, options: ApiMiddlewareOptions = {}) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Validate HTTP method
      if (options.allowedMethods && !options.allowedMethods.includes(req.method || '')) {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
      }

      // Skip auth if requested (for public endpoints)
      if (options.skipAuth) {
        return await handler(req, res, {
          email: '',
          role: 'tenant',
          userId: '',
          userName: 'Public',
          organizationId: null,
        });
      }

      // First, check for admin session (if allowAdmin option is set or default)
      const allowAdmin = options.allowAdmin !== false; // Default to true
      if (allowAdmin) {
        try {
          const adminSessionToken = req.cookies.admin_session;
          if (adminSessionToken) {
            const { validateSession } = require("../admin/session");
            const sessionData = await validateSession(adminSessionToken);
            if (sessionData && sessionData.admin) {
              const admin = sessionData.admin;
              
              // Check if this admin is a PMC Admin (has PMC_ADMIN RBAC role)
              // If so, we need to treat them as a PMC user for landlord/tenant routes
              const { prisma } = require("../prisma");
              const pmcAdminRole = await prisma.userRole.findFirst({
                where: {
                  userId: admin.id,
                  userType: 'admin',
                  isActive: true,
                  role: {
                    name: 'PMC_ADMIN',
                  },
                },
                include: {
                  role: true,
                },
              }).catch(() => null);
              
              // Check if this is a landlord/tenant route that PMC Admin should access as PMC
              const url = req.url || '';
              const isLandlordRoute = url.startsWith('/api/lld/') || url.startsWith('/api/landlords') || url.startsWith('/api/properties') || url.startsWith('/api/tenants') || url.startsWith('/api/leases');
              const isTenantRoute = url.startsWith('/api/tnt/') || url.startsWith('/api/tenants');
              
              if (pmcAdminRole && pmcAdminRole.pmcId && (isLandlordRoute || isTenantRoute)) {
                // PMC Admin accessing landlord/tenant routes - use PMC Company ID
                const pmcCompany = await prisma.propertyManagementCompany.findUnique({
                  where: { id: pmcAdminRole.pmcId },
                  select: { id: true, companyName: true, email: true, approvalStatus: true }
                }).catch(() => null);
                
                if (pmcCompany && pmcCompany.approvalStatus === 'APPROVED') {
                  if (process.env.NODE_ENV === 'development') {
                    console.log('[apiMiddleware] PMC Admin accessing as PMC:', {
                      adminEmail: admin.email,
                      pmcId: pmcCompany.id,
                      companyName: pmcCompany.companyName,
                      route: url,
                    });
                  }
                  // Return as PMC user with PMC Company ID
                  return await handler(req, res, {
                    email: admin.email,
                    role: 'pmc',
                    userId: pmcCompany.id, // Use PMC Company ID, not Admin ID
                    userName: pmcCompany.companyName || 'PMC',
                    organizationId: null,
                  });
                }
              }
              
              // Regular admin user - create user context and call handler
              return await handler(req, res, {
                email: admin.email,
                role: 'admin',
                userId: admin.id,
                userName: `${admin.firstName} ${admin.lastName}`.trim() || admin.email,
                organizationId: null,
              });
            }
          }
        } catch (adminError: any) {
          // Admin session check failed - continue to Auth0 check
          // Don't log if it's just "no admin session" - that's expected for non-admin users
          if (process.env.NODE_ENV === 'development' && adminError?.message && 
              !adminError.message.includes('cookies') && !adminError.message.includes('session')) {
            console.log('[apiMiddleware] Admin session check failed, trying Auth0:', adminError.message);
          }
        }
      }

      // Get email from session using unified auth interface
      let email: string | null = null;
      
      try {
        const authModule = await import('@/lib/auth');
        const { getSession } = authModule;
        const session = await getSession(req, res);
        email = session?.user?.email || null;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[apiMiddleware] Session retrieved:', {
            hasSession: !!session,
            hasUser: !!session?.user,
            email: email
          });
        }
      } catch (sessionError: any) {
        console.error('[apiMiddleware] Error getting session:', {
          error: sessionError,
          message: sessionError?.message,
          stack: sessionError?.stack
        });
        // Don't return error immediately - continue to check if email is set
      }
      
      if (!email) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[apiMiddleware] No session or email found');
        }
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      // Get user from database - check all roles: Landlord > Tenant > PMC > Vendor > Contractor
      // Use cache to reduce database queries
      if (process.env.NODE_ENV === 'development') {
        console.log('[apiMiddleware] Fetching user for email:', email);
      }
      let landlord, tenant, vendor, contractor, pmc, admin;
      
      // Try cache first (cache may not include all roles yet, so we'll update it)
      const { getCachedUser, setCachedUser } = require("../utils/user-lookup-cache");
      const cached = getCachedUser(email);
      
      if (cached) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[apiMiddleware] Using cached user data');
        }
        landlord = cached.landlord;
        tenant = cached.tenant;
        // Cache may not have vendor/contractor/pmc yet, so we'll fetch them
      }
      
      // Always fetch all roles (cache will be updated)
      try {
        const { prisma } = require("../prisma");
        [landlord, tenant, vendor, contractor, pmc, admin] = await Promise.all([
          landlord || prisma.landlord.findUnique({ 
            where: { email: email },
            select: { id: true, email: true, firstName: true, lastName: true, organizationId: true, approvalStatus: true }
          }),
          tenant || prisma.tenant.findUnique({ 
            where: { email: email },
            select: { id: true, email: true, firstName: true, lastName: true, approvalStatus: true, hasAccess: true }
          }),
          prisma.serviceProvider.findFirst({ 
            where: { email: email, type: 'vendor', isDeleted: false },
            select: { id: true, email: true, name: true, businessName: true }
          }),
          prisma.serviceProvider.findFirst({ 
            where: { email: email, type: 'contractor', isDeleted: false },
            select: { id: true, email: true, contactName: true, name: true, businessName: true }
          }),
          prisma.propertyManagementCompany.findUnique({ 
            where: { email: email },
            select: { id: true, email: true, companyName: true, approvalStatus: true }
          }),
          // Check for Admin user (for PMC Admin users)
          prisma.admin.findUnique({
            where: { email: email },
            select: { id: true, email: true, firstName: true, lastName: true, isActive: true, isLocked: true }
          }),
        ]);
        
        // Cache the result (update cache with all roles)
        setCachedUser(email, landlord, tenant, vendor, contractor, pmc);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[apiMiddleware] Database query completed:', {
            hasLandlord: !!landlord,
            hasTenant: !!tenant,
            hasVendor: !!vendor,
            hasContractor: !!contractor,
            hasPMC: !!pmc
          });
        }
      } catch (dbError: any) {
        console.error('[apiMiddleware] Database error:', {
          error: dbError,
          message: dbError?.message,
          stack: dbError?.stack
        });
        return res.status(500).json({ 
          success: false,
          error: 'Database error',
          message: dbError?.message || 'Failed to fetch user'
        });
      }

      // Determine user role based on API route context and available roles
      // Priority: Landlord > Tenant > PMC > Vendor > Contractor
      let user: UserContext | null = null;
      
      // Route detection - match both exact paths and paths with trailing slashes
      const url = req.url || '';
      const isLandlordRoute = url.startsWith('/api/lld/') || url.startsWith('/api/landlords') || url.startsWith('/api/properties') || url.startsWith('/api/tenants') || url.startsWith('/api/leases');
      const isTenantRoute = url.startsWith('/api/tnt/') || url.startsWith('/api/tenants');
      const isVendorRoute = url.startsWith('/api/vendor/') || url.startsWith('/api/vendors');
      const isContractorRoute = url.startsWith('/api/contractor/'); // Legacy contractors route removed, use /api/v1/vendors with type='contractor'
      const isPMCRoute = url.startsWith('/api/pmc/');
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[apiMiddleware] Route detection:', {
          url,
          isLandlordRoute,
          isTenantRoute,
          isPMCRoute,
        });
      }
      
      // Check if requireRole option allows multiple roles (e.g., ['landlord', 'pmc'])
      // If so, we need to check all allowed roles, not just the route-based one
      const allowedRoles = options.requireRole 
        ? (Array.isArray(options.requireRole) ? options.requireRole : [options.requireRole])
        : null;
      
      // Check if admin user has PMC_ADMIN role (for PMC Admin users)
      let pmcAdminUser: {
        id: string;
        email: string;
        companyName: string;
        approvalStatus: string;
        isPMCAdmin: boolean;
      } | null = null;
      if (admin && admin.isActive && !admin.isLocked) {
        try {
          const pmcAdminRole = await prisma.userRole.findFirst({
            where: {
              userId: admin.id,
              userType: 'admin',
              isActive: true,
              role: {
                name: 'PMC_ADMIN',
              },
            },
            include: {
              role: true,
            },
          }).catch(() => null);
          
          if (pmcAdminRole) {
            // Get the PMC company info
            const pmcCompany = pmcAdminRole.pmcId ? await prisma.propertyManagementCompany.findUnique({
              where: { id: pmcAdminRole.pmcId },
              select: { id: true, companyName: true, email: true, approvalStatus: true }
            }).catch(() => null) : null;
            
            pmcAdminUser = {
              id: pmcAdminRole.pmcId || admin.id,
              email: admin.email,
              companyName: pmcCompany?.companyName || 'PMC Admin',
              approvalStatus: pmcCompany?.approvalStatus || 'APPROVED',
              isPMCAdmin: true,
            };
          }
        } catch (pmcAdminError) {
          // Error checking PMC Admin role - continue without it
          if (process.env.NODE_ENV === 'development') {
            console.log('[apiMiddleware] Error checking PMC Admin role:', pmcAdminError?.message);
          }
        }
      }
      
      // PMC users can automatically access landlord and tenant routes (since they manage both)
      // unless requireRole explicitly excludes 'pmc' (i.e., requireRole is set and doesn't include 'pmc')
      // Include PMC Admin users in this check
      const effectivePMC = pmcAdminUser || pmc;
      const pmcCanAccess = effectivePMC && effectivePMC.approvalStatus === 'APPROVED' && 
        (!allowedRoles || allowedRoles.includes('pmc'));
      
      // If requireRole includes 'pmc' and route matches landlord route, allow PMC to proceed
      // But prefer landlord if both are available and allowed
      if (isLandlordRoute && pmcCanAccess) {
        // If landlord is available and allowed, use landlord (preferred for landlord routes)
        if (landlord && (!allowedRoles || allowedRoles.includes('landlord'))) {
          // Continue to landlord check below - will set user as landlord
        } else {
          // Allow PMC to access landlord routes (PMCs manage landlords)
          if (process.env.NODE_ENV === 'development') {
            console.log('[apiMiddleware] Setting PMC user for landlord route:', {
              email: effectivePMC.email,
              userId: effectivePMC.id,
              companyName: effectivePMC.companyName,
            });
          }
          user = {
            email: effectivePMC.email,
            role: 'pmc',
            userId: effectivePMC.id,
            userName: effectivePMC.companyName || effectivePMC.name || 'PMC',
            organizationId: null,
          };
        }
      }
      
      // Also check if route matches tenant route - PMCs can access tenant routes too
      // This handles routes like /api/tenants/ that match both patterns
      if (isTenantRoute && !user && pmcCanAccess) {
        // Allow PMC to access tenant routes (PMCs manage tenants through properties)
        user = {
          email: effectivePMC.email,
          role: 'pmc',
          userId: effectivePMC.id,
          userName: effectivePMC.companyName || effectivePMC.name || 'PMC',
          organizationId: null,
        };
      }
      
      if (isLandlordRoute && !user) {
        if (!landlord) {
          // If PMC can access but wasn't set (shouldn't happen, but just in case)
          if (pmcCanAccess) {
            user = {
              email: pmc.email,
              role: 'pmc',
              userId: pmc.id,
              userName: pmc.companyName || 'PMC',
              organizationId: null,
            };
          } else {
            // If requireRole allows PMC but no PMC was found, return appropriate error
            if (allowedRoles && allowedRoles.includes('pmc')) {
              return res.status(403).json({ 
                success: false,
                error: 'Forbidden: Landlord or PMC access required' 
              });
            }
            return res.status(403).json({ 
              success: false,
              error: 'Forbidden: Landlord access required' 
            });
          }
        }
        // Check approval status - only APPROVED landlords can access
        if (landlord.approvalStatus !== 'APPROVED') {
          return res.status(403).json({ 
            success: false,
            error: 'Your account is pending approval. Please wait for admin approval before accessing the system.',
            approvalStatus: landlord.approvalStatus,
          });
        }
        user = {
          email: landlord.email,
          role: 'landlord',
          userId: landlord.id,
          userName: `${landlord.firstName} ${landlord.lastName}`.trim(),
          organizationId: landlord.organizationId || null,
        };
      } else if (isTenantRoute && !user) {
        // PMC can access tenant routes (already checked above, but double-check here)
        if (pmcCanAccess) {
          user = {
            email: effectivePMC.email,
            role: 'pmc',
            userId: effectivePMC.id,
            userName: effectivePMC.companyName || effectivePMC.name || 'PMC',
            organizationId: null,
          };
        } else if (!tenant) {
          // If requireRole allows PMC but no PMC was found, return appropriate error
          if (allowedRoles && allowedRoles.includes('pmc')) {
            return res.status(403).json({ 
              success: false,
              error: 'Forbidden: Tenant or PMC access required' 
            });
          }
          return res.status(403).json({ 
            success: false,
            error: 'Forbidden: Tenant access required' 
          });
        }
        // Check approval status - only APPROVED tenants can access
        if (tenant.approvalStatus !== 'APPROVED') {
          return res.status(403).json({ 
            success: false,
            error: 'Your account is pending approval. Please wait for landlord/PMC approval before accessing the system.',
            approvalStatus: tenant.approvalStatus,
          });
        }
        // For tenants, get organizationId from their landlord (via leases)
        let tenantOrganizationId: string | null = null;
        try {
          const { prisma } = require("../prisma");
          const leaseTenant = await prisma.leaseTenant.findFirst({
            where: { tenantId: tenant.id },
            include: {
              lease: {
                include: {
                  unit: {
                    include: {
                      property: {
                        select: { organizationId: true, landlordId: true }
                      }
                    }
                  }
                }
              }
            }
          });
          tenantOrganizationId = leaseTenant?.lease?.unit?.property?.organizationId || null;
        } catch (error) {
          // If error, continue without organizationId (backward compatibility)
          console.warn('[apiMiddleware] Could not fetch tenant organizationId:', error);
        }
        
        user = {
          email: tenant.email,
          role: 'tenant',
          userId: tenant.id,
          userName: `${tenant.firstName} ${tenant.lastName}`.trim(),
          organizationId: tenantOrganizationId,
        };
      } else if (isVendorRoute) {
        if (!vendor) {
          return res.status(403).json({ 
            success: false,
            error: 'Forbidden: Vendor access required' 
          });
        }
        user = {
          email: vendor.email,
          role: 'vendor',
          userId: vendor.id,
          userName: vendor.name || vendor.businessName || 'Vendor',
        };
      } else if (isContractorRoute) {
        if (!contractor) {
          return res.status(403).json({ 
            success: false,
            error: 'Forbidden: Contractor access required' 
          });
        }
        user = {
          email: contractor.email,
          role: 'contractor',
          userId: contractor.id,
          userName: contractor.contactName || contractor.name || contractor.businessName || 'Contractor',
        };
      } else if (isPMCRoute) {
        if (!effectivePMC) {
          return res.status(403).json({ 
            success: false,
            error: 'Forbidden: PMC access required' 
          });
        }
        // Check approval status - only APPROVED PMCs can access
        if (effectivePMC.approvalStatus !== 'APPROVED') {
          return res.status(403).json({ 
            success: false,
            error: 'Your account is pending approval. Please wait for admin approval before accessing the system.',
            approvalStatus: effectivePMC.approvalStatus,
          });
        }
        user = {
          email: effectivePMC.email,
          role: 'pmc',
          userId: effectivePMC.id,
          userName: effectivePMC.companyName || effectivePMC.name || 'PMC',
          organizationId: null, // PMCs can manage properties across organizations
        };
      } else {
        // Special case: /api/v1/user/status should be accessible to users regardless of approval status
        const isStatusRoute = req.url === '/api/v1/user/status' || req.url?.startsWith('/api/v1/user/status');
        
        // Generic route - determine role by priority: Landlord > Tenant > PMC > Vendor > Contractor
        if (landlord && (landlord.approvalStatus === 'APPROVED' || isStatusRoute)) {
          user = {
            email: landlord.email,
            role: 'landlord',
            userId: landlord.id,
            userName: `${landlord.firstName} ${landlord.lastName}`.trim(),
            organizationId: landlord.organizationId || null,
          };
        } else if (tenant && (tenant.approvalStatus === 'APPROVED' || isStatusRoute)) {
          // For tenants, get organizationId from their landlord (via leases)
          let tenantOrganizationId: string | null = null;
          try {
            const { prisma } = require("../prisma");
            const leaseTenant = await prisma.leaseTenant.findFirst({
              where: { tenantId: tenant.id },
              include: {
                lease: {
                  include: {
                    unit: {
                      include: {
                        property: {
                          select: { organizationId: true }
                        }
                      }
                    }
                  }
                }
              }
            });
            tenantOrganizationId = leaseTenant?.lease?.unit?.property?.organizationId || null;
          } catch (error) {
            // If error, continue without organizationId (backward compatibility)
            console.warn('[apiMiddleware] Could not fetch tenant organizationId:', error);
          }
          
          user = {
            email: tenant.email,
            role: 'tenant',
            userId: tenant.id,
            userName: `${tenant.firstName} ${tenant.lastName}`.trim(),
            organizationId: tenantOrganizationId,
          };
        } else if (effectivePMC && (effectivePMC.approvalStatus === 'APPROVED' || isStatusRoute)) {
          user = {
            email: effectivePMC.email,
            role: 'pmc',
            userId: effectivePMC.id,
            userName: effectivePMC.companyName || effectivePMC.name || 'PMC',
            organizationId: null, // PMCs can manage properties across organizations
          };
        } else if (vendor) {
          user = {
            email: vendor.email,
            role: 'vendor',
            userId: vendor.id,
            userName: vendor.name || vendor.businessName || 'Vendor',
            organizationId: null, // Vendors don't have organizations (they're shared)
          };
        } else if (contractor) {
          user = {
            email: contractor.email,
            role: 'contractor',
            userId: contractor.id,
            userName: contractor.contactName || contractor.name || contractor.businessName || 'Contractor',
            organizationId: null, // Contractors don't have organizations (they're shared)
          };
        }
      }

      // If no user found, return error
      if (!user) {
        return res.status(403).json({ success: false, error: 'User not found' });
      }

      // Check role requirement (support both single role and array of roles)
      if (options.requireRole) {
        const requiredRoles = Array.isArray(options.requireRole) ? options.requireRole : [options.requireRole];
        if (!requiredRoles.includes(user.role)) {
          const roleStr = Array.isArray(options.requireRole) ? requiredRoles.join(',') : options.requireRole;
          return res.status(403).json({ 
            success: false,
            error: `Forbidden: This endpoint requires ${roleStr} role` 
          });
        }
      }

      // Verify organization status (for SaaS multi-tenancy)
      if (user.organizationId) {
        try {
          const { verifyOrganizationStatus } = require("../utils/organization-helpers");
          const { prisma } = require("../prisma");
          const statusCheck = await verifyOrganizationStatus(prisma, user.organizationId);
          
          if (!statusCheck.allowed) {
            return res.status(403).json({
              success: false,
              error: statusCheck.error || 'Organization access denied',
              code: statusCheck.status || 'ORGANIZATION_INACTIVE',
            });
          }

          // Track API call and check rate limits
          const { trackApiCall } = require("../utils/organization-api-tracking");
          const apiLimit = await trackApiCall(prisma, user.organizationId);
          
          if (!apiLimit.allowed) {
            return res.status(429).json({
              success: false,
              error: `API rate limit exceeded. You have reached your monthly API call limit (${apiLimit.limit}). Please upgrade your plan or wait until ${apiLimit.resetAt?.toLocaleDateString()}.`,
              code: 'API_RATE_LIMIT_EXCEEDED',
              limit: apiLimit.limit,
              resetAt: apiLimit.resetAt,
            });
          }

          // Set rate limit headers
          if (apiLimit.remaining !== undefined && apiLimit.limit !== undefined) {
            res.setHeader('X-RateLimit-Limit', apiLimit.limit.toString());
            res.setHeader('X-RateLimit-Remaining', apiLimit.remaining.toString());
            if (apiLimit.resetAt) {
              res.setHeader('X-RateLimit-Reset', apiLimit.resetAt.toISOString());
            }
          }
        } catch (statusError: any) {
          // Log error but don't block request (backward compatibility)
          console.warn('[apiMiddleware] Error checking organization status/limits:', statusError);
          // Continue with request if status check fails
        }
      }

      // Execute handler with user context
      await handler(req, res, user);

    } catch (error: any) {
      console.error(`[API Error] ${req.method} ${req.url}:`, error);
      console.error(`[API Error] Stack:`, error.stack);
      console.error(`[API Error] Details:`, {
        code: error.code,
        message: error.message,
        name: error.name,
        meta: error.meta
      });
      
      // Ensure response hasn't been sent yet
      if (!res.headersSent) {
        return res.status(500).json({ 
          success: false,
          error: 'Internal server error',
          message: error.message || 'Unknown error',
          ...(process.env.NODE_ENV === 'development' && { 
            meta: {
              stack: error.stack,
              details: error.toString(),
              code: error.code
            }
          })
        });
      } else {
        console.error(`[API Error] Response already sent, cannot send error response`);
      }
    }
  };
}

/**
 * Lightweight middleware that only checks authentication without fetching user
 * Useful when you need to do custom user fetching in your handler
 */
export function withAuthOnly(handler: (req: NextApiRequest, res: NextApiResponse, email: string) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // In Pages Router API routes, getSession needs req and res
      // @ts-ignore - Auth0 types may not match but this works in Pages Router
      const session = await auth0.getSession(req, res);
      if (!session?.user?.email) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await handler(req, res, session.user.email);

    } catch (error: any) {
      console.error(`[API Error] ${req.method} ${req.url}:`, error);
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error.message || 'Unknown error'
      });
    }
  };
}

