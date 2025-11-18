/**
 * Admin API Helper
 * 
 * Wrapper for admin/system endpoints that don't have v1 equivalents.
 * These are infrastructure/system endpoints that are not part of the business domain API.
 */

import { apiClient } from '@/lib/utils/api-client';

/**
 * Helper function to safely parse JSON response and handle errors
 */
async function parseResponse(response: Response | undefined, defaultError: string) {
  if (!response) {
    throw new Error('Failed to get response from API');
  }
  let data;
  try {
    data = await response.json();
  } catch (error: any) {
    throw new Error(`Failed to parse response: ${error.message || 'Invalid JSON'}`);
  }
  if (!response.ok) {
    throw new Error(data?.error || data?.message || defaultError);
  }
  return data;
}

/**
 * Admin API client for system/infrastructure endpoints
 */
export const adminApi = {
  /**
   * Get current admin user
   */
  async getCurrentUser() {
    const response = await apiClient('/api/admin/auth/me', {
      method: 'GET',
    });
    return parseResponse(response, 'Failed to get admin user');
  },

  /**
   * Admin login
   */
  async login(email: string, password: string) {
    const response = await apiClient('/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return parseResponse(response, 'Login failed');
  },

  /**
   * Admin logout
   */
  async logout() {
    const response = await apiClient('/api/admin/auth/logout', {
      method: 'POST',
    });
    return parseResponse(response, 'Logout failed');
  },

  /**
   * Get verifications stats
   */
  async getVerificationStats(query?: { verificationType?: string; status?: string }) {
    const queryString = query ? '?' + new URLSearchParams(query as any).toString() : '';
    const response = await apiClient(`/api/verifications/stats${queryString}`, {
      method: 'GET',
    });
    const data = await parseResponse(response, 'Failed to get verification stats');
    return data?.data || data?.stats || {};
  },

  /**
   * Get admin user (alternative endpoint)
   */
  async getAdminUser() {
    const response = await apiClient('/api/admin/me', {
      method: 'GET',
    });
    return parseResponse(response, 'Failed to get admin user');
  },

  /**
   * Get admin users list
   */
  async getUsers(query?: { role?: string; limit?: number; page?: number; search?: string; status?: string }) {
    // Filter out undefined values to avoid sending "undefined" as string
    const cleanQuery = query ? Object.fromEntries(
      Object.entries(query).filter(([_, value]) => value !== undefined && value !== null && value !== 'undefined')
    ) : {};
    const queryString = Object.keys(cleanQuery).length > 0 ? '?' + new URLSearchParams(cleanQuery as any).toString() : '';
    const response = await apiClient(`/api/admin/users${queryString}`, {
      method: 'GET',
    });
    return parseResponse(response, 'Failed to get users');
  },

  /**
   * Get admin invitations (legacy endpoint - use v1Api.invitations for v1)
   */
  async getInvitations(query?: { archive?: boolean }) {
    const queryString = query ? '?' + new URLSearchParams(query as any).toString() : '';
    const response = await apiClient(`/api/admin/invitations${queryString}`, {
      method: 'GET',
    });
    return parseResponse(response, 'Failed to get invitations');
  },

  /**
   * Create admin invitation (legacy endpoint - use v1Api.invitations for v1)
   */
  async createInvitation(data: any) {
    const response = await apiClient('/api/admin/invitations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return parseResponse(response, 'Failed to create invitation');
  },

  /**
   * Get RBAC roles
   */
  async getRBACRoles() {
    const response = await apiClient('/api/rbac/roles', {
      method: 'GET',
    });
    return parseResponse(response, 'Failed to get RBAC roles');
  },

  /**
   * Get admin settings
   */
  async getSettings() {
    const response = await apiClient('/api/admin/settings', {
      method: 'GET',
    });
    return parseResponse(response, 'Failed to get settings');
  },

  /**
   * Update admin settings
   */
  async updateSettings(data: any) {
    const response = await apiClient('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return parseResponse(response, 'Failed to update settings');
  },

  /**
   * Get audit logs
   */
  async getAuditLogs(query?: { type?: string; page?: number; limit?: number }) {
    const queryString = query ? '?' + new URLSearchParams(query as any).toString() : '';
    const response = await apiClient(`/api/admin/audit-logs${queryString}`, {
      method: 'GET',
    });
    return parseResponse(response, 'Failed to get audit logs');
  },

  /**
   * Get system health
   */
  async getSystemHealth() {
    const response = await apiClient('/api/admin/system/health', {
      method: 'GET',
    });
    return parseResponse(response, 'Failed to get system health');
  },

  /**
   * Get failed logins
   */
  async getFailedLogins() {
    const response = await apiClient('/api/admin/security/failed-logins', {
      method: 'GET',
    });
    return parseResponse(response, 'Failed to get failed logins');
  },

  /**
   * Get active sessions
   */
  async getSessions() {
    const response = await apiClient('/api/admin/security/sessions', {
      method: 'GET',
    });
    return parseResponse(response, 'Failed to get sessions');
  },

  /**
   * Revoke session
   */
  async revokeSession(sessionId: string) {
    const response = await apiClient(`/api/admin/security/sessions?id=${sessionId}&action=revoke`, {
      method: 'POST',
    });
    return parseResponse(response, 'Failed to revoke session');
  },

  /**
   * Get content
   */
  async getContent(query?: { id?: string }) {
    const queryString = query?.id ? `?id=${query.id}` : '';
    const response = await apiClient(`/api/admin/content${queryString}`, {
      method: 'GET',
    });
    return parseResponse(response, 'Failed to get content');
  },

  /**
   * Create/Update content
   */
  async saveContent(data: any, id?: string) {
    const url = id ? `/api/admin/content?id=${id}` : '/api/admin/content';
    const response = await apiClient(url, {
      method: id ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return parseResponse(response, 'Failed to save content');
  },

  /**
   * Delete content
   */
  async deleteContent(id: string) {
    const response = await apiClient(`/api/admin/content?id=${id}`, {
      method: 'DELETE',
    });
    return parseResponse(response, 'Failed to delete content');
  },

  /**
   * Get API keys
   */
  async getApiKeys(query?: { id?: string }) {
    const queryString = query?.id ? `?id=${query.id}` : '';
    const response = await apiClient(`/api/admin/api-keys${queryString}`, {
      method: 'GET',
    });
    return parseResponse(response, 'Failed to get API keys');
  },

  /**
   * Create/Update API key
   */
  async saveApiKey(data: any, id?: string) {
    const url = id ? `/api/admin/api-keys?id=${id}` : '/api/admin/api-keys';
    const response = await apiClient(url, {
      method: id ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return parseResponse(response, 'Failed to save API key');
  },

  /**
   * Delete API key
   */
  async deleteApiKey(id: string) {
    const response = await apiClient(`/api/admin/api-keys?id=${id}`, {
      method: 'DELETE',
    });
    return parseResponse(response, 'Failed to delete API key');
  },

  /**
   * Get notifications/announcements
   */
  async getAnnouncements(query?: { id?: string }) {
    const queryString = query?.id ? `?id=${query.id}` : '';
    const response = await apiClient(`/api/admin/notifications/announcements${queryString}`, {
      method: 'GET',
    });
    return parseResponse(response, 'Failed to get announcements');
  },

  /**
   * Create/Update announcement
   */
  async saveAnnouncement(data: any, id?: string) {
    const url = id ? `/api/admin/notifications/announcements?id=${id}` : '/api/admin/notifications/announcements';
    const response = await apiClient(url, {
      method: id ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return parseResponse(response, 'Failed to save announcement');
  },

  /**
   * Delete announcement
   */
  async deleteAnnouncement(id: string) {
    const response = await apiClient(`/api/admin/notifications/announcements?id=${id}`, {
      method: 'DELETE',
    });
    return parseResponse(response, 'Failed to delete announcement');
  },
};

export default adminApi;

