/**
 * useRequireRole Hook
 * 
 * Reusable hook for role-based route protection
 */

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '@/lib/types/roles';
import { requireRole as checkRole } from '@/lib/utils/role-helpers';

type User = {
  id: string;
  email: string;
  role?: Role | string;
  [key: string]: any;
};

interface UseRequireRoleOptions {
  allowedRoles: Role[];
  redirectTo?: string;
  redirectMessage?: string;
  fetchUser?: () => Promise<User | null>;
}

export function useRequireRole(options: UseRequireRoleOptions) {
  const { allowedRoles, redirectTo = '/admin/login', redirectMessage, fetchUser } = options;
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      let userData: User | null = null;

      // Use custom fetch function if provided, otherwise use default
      if (fetchUser) {
        userData = await fetchUser();
      } else {
        // Default: fetch from admin API
        const response = await fetch('/api/admin/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Not authenticated');
        }

        const data = await response.json();
        if (data.success && data.user) {
          userData = data.user;
        } else {
          throw new Error('Not authenticated');
        }
      }

      if (!userData) {
        throw new Error('Not authenticated');
      }

      setUser(userData);

      // Normalize legacy roles to new role system
      const roleMapping: Record<string, Role> = {
        'admin': 'super_admin',
        'SUPER_ADMIN': 'super_admin',
        'pmc': 'pmc_admin',
      };

      const normalizedRole = roleMapping[userData.role as string] || userData.role;
      
      // Check if user has required role
      const hasRequiredRole = checkRole({ ...userData, role: normalizedRole }, allowedRoles);
      
      if (!hasRequiredRole) {
        const message = redirectMessage || 
          `Access denied: This area requires one of the following roles: ${allowedRoles.join(', ')}`;
        setError(message);
        setHasAccess(false);
        setLoading(false);
        
        // Redirect after brief delay
        setTimeout(() => {
          router.push(`${redirectTo}?error=${encodeURIComponent(message)}`);
        }, 2000);
        return;
      }

      setHasAccess(true);
    } catch (err) {
      console.error('[useRequireRole] Auth check failed:', err);
      setError('Authentication required');
      setHasAccess(false);
      
      setTimeout(() => {
        router.push(redirectTo);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    hasAccess,
  };
}

