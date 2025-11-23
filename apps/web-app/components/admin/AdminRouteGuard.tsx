/**
 * Admin Route Guard Component
 * 
 * Protects routes based on allowed roles
 */

"use client";

import { ReactNode } from 'react';
import { Spinner, Alert } from 'flowbite-react';
import { HiShieldCheck, HiLockClosed } from 'react-icons/hi';
import { Role } from '@/lib/types/roles';
import { useRequireRole } from '@/lib/hooks/useRequireRole';

interface AdminRouteGuardProps {
  children: ReactNode;
  allowedRoles: Role[];
  redirectTo?: string;
  redirectMessage?: string;
  fallback?: ReactNode;
}

export default function AdminRouteGuard({ 
  children, 
  allowedRoles,
  redirectTo = '/admin/login',
  redirectMessage,
  fallback 
}: AdminRouteGuardProps) {
  const { user, loading, error, hasAccess } = useRequireRole({
    allowedRoles,
    redirectTo,
    redirectMessage,
  });

  if (loading) {
    return fallback || (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Spinner size="xl" className="mx-auto mb-4" />
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen p-6">
        <Alert color="failure" icon={HiLockClosed} className="max-w-md">
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">Access Denied</h3>
            <p>{error}</p>
            <p className="text-sm text-gray-600 mt-2">
              Redirecting...
            </p>
          </div>
        </Alert>
      </div>
    );
  }

  if (!hasAccess || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen p-6">
        <Alert color="failure" icon={HiShieldCheck} className="max-w-md">
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">Insufficient Permissions</h3>
            <p>This area requires one of the following roles: {allowedRoles.join(', ')}</p>
            <p className="text-sm text-gray-600 mt-2">
              Your current role does not have access to this section.
            </p>
          </div>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
