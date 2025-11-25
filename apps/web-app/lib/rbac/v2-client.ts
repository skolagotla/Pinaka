/**
 * Unified RBAC Client for Frontend
 * 
 * Provides client-side RBAC utilities that match backend permission checks.
 * Uses FastAPI v2 RBAC endpoints for permission validation.
 */

import { v2Api } from '@/lib/api/v2-client';

export interface PermissionCheck {
  resource: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'MANAGE';
  category?: string;
  scope?: Record<string, any>;
}

export interface PermissionResult {
  has_permission: boolean;
  reason?: string;
}

export interface UserScope {
  resource_type: string;
  resource_id: string;
  access_level: 'READ' | 'WRITE' | 'MANAGE';
}

export interface UserScopes {
  scopes: UserScope[];
  roles: string[];
}

/**
 * Check if current user has a specific permission
 */
export async function checkPermission(
  permission: PermissionCheck
): Promise<PermissionResult> {
  try {
    const token = v2Api.getToken();
    const baseUrl = process.env.NEXT_PUBLIC_API_V2_BASE_URL || 'http://localhost:8000/api/v2';
    const url = `${baseUrl}/rbac/permissions/check`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(permission),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[RBAC] Permission check failed:', error);
    return { has_permission: false, reason: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get user scopes and roles
 */
export async function getUserScopes(): Promise<UserScopes> {
  try {
    const token = v2Api.getToken();
    const baseUrl = process.env.NEXT_PUBLIC_API_V2_BASE_URL || 'http://localhost:8000/api/v2';
    const url = `${baseUrl}/rbac/scopes`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[RBAC] Get scopes failed:', error);
    return { scopes: [], roles: [] };
  }
}

/**
 * Check if user can access a specific resource
 */
export async function checkResourceAccess(
  resourceId: string,
  resourceType: string
): Promise<{ has_access: boolean; reason?: string }> {
  try {
    const token = v2Api.getToken();
    const baseUrl = process.env.NEXT_PUBLIC_API_V2_BASE_URL || 'http://localhost:8000/api/v2';
    const url = `${baseUrl}/rbac/access/${resourceId}?resource_type=${resourceType}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[RBAC] Resource access check failed:', error);
    return { has_access: false, reason: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * React hook for permission checking
 */
import { useState, useEffect } from 'react';

export function usePermission(permission: PermissionCheck) {
  const [result, setResult] = useState<PermissionResult>({ has_permission: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    checkPermission(permission).then((res) => {
      if (mounted) {
        setResult(res);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [permission.resource, permission.action, permission.category]);

  return { ...result, loading };
}

/**
 * React hook for user scopes
 */
export function useUserScopes() {
  const [scopes, setScopes] = useState<UserScopes>({ scopes: [], roles: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    getUserScopes().then((res) => {
      if (mounted) {
        setScopes(res);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return { ...scopes, loading };
}

