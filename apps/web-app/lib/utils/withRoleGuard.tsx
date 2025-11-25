/**
 * Route Guard HOC for role-based access control
 * Ensures only authorized roles can access protected routes
 */
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { Spinner, Alert } from 'flowbite-react';
import { HiLockClosed } from 'react-icons/hi';

export type AllowedRole = 
  | 'super_admin' 
  | 'pmc_admin' 
  | 'pm' 
  | 'landlord' 
  | 'tenant' 
  | 'vendor';

export interface RoleGuardOptions {
  allowedRoles: AllowedRole[];
  redirectTo?: string;
  requireOrganization?: boolean;
}

/**
 * HOC to protect routes with role-based access control
 */
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: RoleGuardOptions
) {
  return function RoleGuardedComponent(props: P) {
    const router = useRouter();
    const { user, loading, hasRole, isSuperAdmin } = useV2Auth();
    const { allowedRoles, redirectTo = '/login', requireOrganization = false } = options;

    useEffect(() => {
      if (loading) return;

      // Not authenticated
      if (!user) {
        router.push(redirectTo);
        return;
      }

      // Check if user has any of the allowed roles
      const hasAllowedRole = allowedRoles.some(role => hasRole(role));

      if (!hasAllowedRole) {
        // Super admin can access everything
        if (!isSuperAdmin()) {
          router.push('/unauthorized');
          return;
        }
      }

      // Check organization requirement (for non-super-admin roles)
      if (requireOrganization && !isSuperAdmin()) {
        if (!user.user.organization_id) {
          router.push('/complete-registration');
          return;
        }
      }
    }, [user, loading, hasRole, isSuperAdmin, router, allowedRoles, redirectTo, requireOrganization]);

    // Show loading while checking auth
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <Spinner size="xl" />
        </div>
      );
    }

    // Not authenticated
    if (!user) {
      return null; // Will redirect
    }

    // Check role access
    const hasAllowedRole = allowedRoles.some(role => hasRole(role)) || isSuperAdmin();

    if (!hasAllowedRole) {
      return (
        <div className="flex justify-center items-center min-h-screen p-6">
          <Alert color="failure" icon={HiLockClosed}>
            <div>
              <h3 className="font-bold">Access Denied</h3>
              <p>You don't have permission to access this page.</p>
              <p className="text-sm mt-2">
                Required roles: {allowedRoles.join(', ')}
              </p>
            </div>
          </Alert>
        </div>
      );
    }

    // Check organization requirement
    if (requireOrganization && !isSuperAdmin() && !user.user.organization_id) {
      return (
        <div className="flex justify-center items-center min-h-screen p-6">
          <Alert color="warning">
            <div>
              <h3 className="font-bold">Organization Required</h3>
              <p>Please complete your registration to access this page.</p>
            </div>
          </Alert>
        </div>
      );
    }

    // User has access
    return <Component {...props} />;
  };
}

/**
 * Hook version for conditional rendering
 */
export function useRoleGuard(allowedRoles: AllowedRole[]): {
  hasAccess: boolean;
  loading: boolean;
} {
  const { user, loading, hasRole, isSuperAdmin } = useV2Auth();

  if (loading || !user) {
    return { hasAccess: false, loading: true };
  }

  const hasAllowedRole = allowedRoles.some(role => hasRole(role)) || isSuperAdmin();

  return {
    hasAccess: hasAllowedRole,
    loading: false,
  };
}

