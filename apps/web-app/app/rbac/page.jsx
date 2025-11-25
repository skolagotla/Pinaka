/**
 * RBAC Settings Page (Shared for Admin and PMC)
 * Role-Based Access Control management interface
 * 
 * Features:
 * - Permission Matrix Editor
 * - Role Management
 * - User Role Assignment
 * - Scope Management
 * - RBAC Audit Logs
 */

"use client";

// Re-export the admin RBAC page component
// This allows both admin and PMC users to access RBAC settings
/**
 * RBAC Page - Redirects to platform RBAC for super_admin
 */
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { Spinner } from 'flowbite-react';

export default function RBACPage() {
  const router = useRouter();
  const { user, loading, hasRole } = useV2Auth();

  useEffect(() => {
    if (!loading) {
      if (hasRole('super_admin')) {
        router.replace('/platform/rbac');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, loading, hasRole, router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Spinner size="xl" />
    </div>
  );
}


