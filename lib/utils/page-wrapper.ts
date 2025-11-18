/**
 * Server-Side Page Wrapper Utility
 * 
 * Eliminates duplicate authentication and redirect logic across page.jsx files.
 * Provides a consistent pattern for server-side page components.
 * 
 * Usage:
 * ```jsx
 * import { withAuth } from '@/lib/utils/page-wrapper';
 * import MyClientComponent from './ui';
 * 
 * export default withAuth(async ({ user, prisma }) => {
 *   // Fetch data using user.email or user.id
 *   const data = await prisma.property.findMany({
 *     where: { landlordId: user.id }
 *   });
 *   
 *   return <MyClientComponent data={data} />;
 * }, { role: 'landlord' });
 * ```
 */

import { auth0 } from '../auth0';
import { redirect } from "next/navigation";
import { cookies } from 'next/headers';
const { prisma } = require("../prisma");
const { validateSession } = require("../admin/session");

/**
 * Options for page wrapper
 */
interface PageWrapperOptions {
  role?: 'landlord' | 'tenant' | 'pmc' | 'both' | 'admin' | Array<'landlord' | 'tenant' | 'pmc' | 'admin'>;
  redirectTo?: string;
  redirectIfNotFound?: string;
  requireAccess?: boolean;
  allowAdmin?: boolean; // Allow admin users to access this page
}

/**
 * Wraps a page component with authentication and user context
 * @param pageComponent - Async function that receives { user, prisma, email } and returns JSX
 * @param options - Configuration options
 * @returns Next.js page component
 */
export function withAuth(pageComponent: (context: { user: any; userRole: string | null; email: string; prisma: any; params?: any }) => Promise<JSX.Element>, options: PageWrapperOptions = {}) {
  const {
    role = 'both', // 'landlord', 'tenant', or 'both'
    redirectTo = '/',
    redirectIfNotFound = '/complete-registration',
    requireAccess = false, // For tenants, require hasAccess
  } = options;

  return async function AuthenticatedPage(props: { params?: any | Promise<any> } = {}) {
    try {
      // In Next.js App Router, params are passed as { params: { id: '...' } }
      // In Next.js 15+, params might be a Promise, so we need to await it
      let params = props?.params;
      if (params instanceof Promise) {
        params = await params;
      }
      // If params is undefined or null, use empty object
      if (!params) {
        params = {};
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[page-wrapper] Received props:', {
          propsKeys: Object.keys(props || {}),
          params,
          paramsType: typeof params,
          paramsKeys: Object.keys(params || {}),
          hasId: params?.id,
          fullProps: JSON.stringify(props, null, 2).substring(0, 500),
        });
      }
      // First, check for admin session if admin access is allowed
      if (options.allowAdmin !== false) {
        try {
          const cookieStore = await cookies();
          const adminSessionToken = cookieStore.get('admin_session')?.value;
          
          if (adminSessionToken) {
            const sessionData = await validateSession(adminSessionToken);
            if (sessionData && sessionData.admin) {
              const admin = sessionData.admin;
              // Admin user found - allow access
              return pageComponent({
                params,
                user: {
                  id: admin.id,
                  email: admin.email,
                  firstName: admin.firstName,
                  lastName: admin.lastName,
                  role: admin.role,
                },
                userRole: 'admin',
                email: admin.email,
                prisma,
              });
            }
          }
        } catch (adminError: any) {
          // Admin session check failed - continue to Auth0 check
          // Don't log if it's just "no admin session" - that's expected for non-admin users
          // Only log actual errors, not expected "no session" cases
          if (adminError?.message && !adminError.message.includes('cookies') && !adminError.message.includes('session')) {
            console.log('[page-wrapper] Admin session check error:', adminError.message);
          }
        }
      }

      // Get email from session using unified auth interface
      let email: string | null = null;
      
      try {
        const authModule = await import('@/lib/auth');
        const session = await authModule.getSession();
        email = session?.user?.email || null;
      } catch (authError) {
        // Auth can fail - catch and continue
        // Continue without session - user is not authenticated
      }

      if (!email) {
        redirect(redirectTo);
      }

      // prisma is available from require above

      // Find user based on role requirement
      let user: any = null;
      let userRole: string | null = null;
      
      // Support both single role and array of roles
      const roleArray = Array.isArray(role) ? role : [role];

      if (roleArray.includes('landlord') || roleArray.includes('both')) {
        user = await prisma.landlord.findUnique({
          where: { email },
          select: { id: true, email: true, firstName: true, lastName: true, approvalStatus: true },
        });
        if (user) {
          userRole = 'landlord';
          // Check approval status
          if ((user as any).approvalStatus !== 'APPROVED') {
            redirect('/pending-approval');
          }
          // Check if landlord is managed by PMC
          const pmcRelationship = await prisma.pMCLandlord.findFirst({
            where: {
              landlordId: (user as any).id,
              status: 'active',
              OR: [
                { endedAt: null },
                { endedAt: { gt: new Date() } },
              ],
            },
            include: {
              pmc: {
                select: {
                  id: true,
                  companyName: true,
                },
              },
            },
          });
          if (pmcRelationship) {
            (user as any).isPMCManaged = true;
            (user as any).managingPMC = pmcRelationship.pmc;
          } else {
            (user as any).isPMCManaged = false;
            (user as any).managingPMC = null;
          }
        }
      }

      if (!user && (roleArray.includes('tenant') || roleArray.includes('both'))) {
        user = await prisma.tenant.findUnique({
          where: { email },
          select: { id: true, email: true, firstName: true, lastName: true, approvalStatus: true, hasAccess: true },
        });
        if (user) {
          userRole = 'tenant';
          // Check approval status
          if ((user as any).approvalStatus !== 'APPROVED') {
            redirect('/pending-approval');
          }
        }
      }

      if (!user && (roleArray.includes('pmc') || roleArray.includes('both'))) {
        // First check for regular PMC (PropertyManagementCompany)
        user = await prisma.propertyManagementCompany.findUnique({
          where: { email },
          select: { id: true, email: true, companyName: true, approvalStatus: true },
        });
        if (user) {
          userRole = 'pmc';
          // Check approval status
          if ((user as any).approvalStatus !== 'APPROVED') {
            redirect('/pending-approval');
          }
        } else {
          // Check for PMC Admin (Admin user with PMC_ADMIN RBAC role)
          const admin = await prisma.admin.findUnique({
            where: { email },
            select: { id: true, email: true, firstName: true, lastName: true, isActive: true, isLocked: true },
          });
          
          if (admin && admin.isActive && !admin.isLocked) {
            // Check if admin has PMC_ADMIN role
            const pmcAdminRole = await prisma.userRole.findFirst({
              where: {
                userId: admin.id,
                userType: 'admin',
                isActive: true,
                role: {
                  name: 'PMC_ADMIN',
                },
              },
            }).catch(() => null);
            
            if (pmcAdminRole) {
              // Get the PMC company info
              const pmcCompany = pmcAdminRole.pmcId ? await prisma.propertyManagementCompany.findUnique({
                where: { id: pmcAdminRole.pmcId },
                select: { id: true, companyName: true, email: true, approvalStatus: true }
              }).catch(() => null) : null;
              
              // Use admin as user, but mark as PMC role
              user = {
                id: admin.id,
                email: admin.email,
                firstName: admin.firstName,
                lastName: admin.lastName,
                companyName: pmcCompany?.companyName || 'PMC Admin',
                approvalStatus: pmcCompany?.approvalStatus || 'APPROVED',
                isPMCAdmin: true,
                pmcId: pmcAdminRole.pmcId,
              };
              userRole = 'pmc';
              // PMC Admin users are always approved (they're admins)
            }
          }
        }
      }

      // Check if user was found
      if (!user) {
        redirect(redirectIfNotFound);
      }

      // Check role requirement - support both single role and array of roles
      const allowedRoles = Array.isArray(role) ? role : [role];
      const isRoleAllowed = allowedRoles.includes('both') || 
                           (userRole && allowedRoles.includes(userRole as any)) ||
                           (userRole === 'pmc' && allowedRoles.includes('pmc')) ||
                           (userRole === 'landlord' && allowedRoles.includes('landlord')) ||
                           (userRole === 'tenant' && allowedRoles.includes('tenant'));
      
      if (!isRoleAllowed && role !== 'both') {
        redirect(redirectTo);
      }

      // For tenants, check hasAccess if required
      if (userRole === 'tenant' && requireAccess && user && !(user as any).hasAccess) {
        redirect(redirectTo);
      }

      // Call the page component with user context and params
      return pageComponent({
        user,
        userRole,
        email,
        prisma,
        params,
      });
    } catch (error: any) {
      // NEXT_REDIRECT is not a real error - it's how Next.js handles redirects
      if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
        throw error; // Re-throw redirects - don't log them as errors
      }
      
      console.error('[page-wrapper] Error in AuthenticatedPage:', error);
      console.error('[page-wrapper] Error stack:', error instanceof Error ? error.stack : 'No stack');
      throw error; // Re-throw to show proper error page
    }
  };
}

/**
 * Wrapper for landlord-only pages
 */
export function withLandlordAuth(pageComponent: (context: { user: any; userRole: string | null; email: string; prisma: any }) => Promise<JSX.Element>, options: PageWrapperOptions = {}) {
  return withAuth(pageComponent, { ...options, role: 'landlord' });
}

/**
 * Wrapper for tenant-only pages
 */
export function withTenantAuth(pageComponent: (context: { user: any; userRole: string | null; email: string; prisma: any }) => Promise<JSX.Element>, options: PageWrapperOptions = {}) {
  return withAuth(pageComponent, { ...options, role: 'tenant', requireAccess: true });
}

/**
 * Wrapper for PMC-only pages
 */
export function withPMCAuth(pageComponent: (context: { user: any; userRole: string | null; email: string; prisma: any }) => Promise<JSX.Element>, options: PageWrapperOptions = {}) {
  return withAuth(pageComponent, { ...options, role: 'pmc' });
}

