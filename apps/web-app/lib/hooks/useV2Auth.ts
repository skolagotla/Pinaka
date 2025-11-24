/**
 * React hook for v2 FastAPI authentication
 */
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { v2Api } from '../../../../lib/api/v2-client';

export interface V2User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  status: string;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface V2Role {
  id: string;
  name: string;
  description: string | null;
}

export interface V2CurrentUser {
  user: V2User;
  roles: V2Role[];
  organization_id: string | null;
}

export function useV2Auth() {
  const [user, setUser] = useState<V2CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const token = v2Api.getToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const currentUser = await v2Api.getCurrentUser();
      setUser(currentUser);
      setError(null);
    } catch (err: any) {
      // Token invalid or expired
      v2Api.setToken(null);
      setUser(null);
      setError(err.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await v2Api.login(email, password);
      await checkAuth();
      return true;
    } catch (err: any) {
      setError(err.detail || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [checkAuth]);

  const logout = useCallback(() => {
    v2Api.logout();
    setUser(null);
    router.push('/login');
  }, [router]);

  const hasRole = useCallback((roleName: string): boolean => {
    if (!user) return false;
    return user.roles.some(role => role.name === roleName);
  }, [user]);

  const isSuperAdmin = useCallback((): boolean => {
    return hasRole('super_admin');
  }, [hasRole]);

  return {
    user,
    loading,
    error,
    login,
    logout,
    checkAuth,
    hasRole,
    isSuperAdmin,
  };
}

