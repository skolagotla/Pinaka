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
   * Returns null if not authenticated (401) instead of throwing
   */
  async getCurrentUser() {
    try {
      const response = await apiClient('/api/admin/auth/me', {
        method: 'GET',
      });
      
      // Handle 401 (not authenticated) gracefully
      if (response && response.status === 401) {
        return { success: false, error: 'Not authenticated' };
      }
      
      return parseResponse(response, 'Failed to get admin user');
    } catch (error: any) {
      // If error message is "Not authenticated", return gracefully
      if (error.message === 'Not authenticated' || error.message?.includes('Not authenticated')) {
        return { success: false, error: 'Not authenticated' };
      }
      throw error;
    }
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

  /**
   * Get single user by ID
   */
  async getUserById(id: string, role?: string) {
    const queryString = role ? `?role=${role}` : '';
    const response = await apiClient(`/api/admin/users/${id}${queryString}`, {
      method: 'GET',
    });
    return parseResponse(response, 'Failed to get user');
  },

  /**
   * Get user RBAC roles
   */
  async getUserRoles(userId: string, userType: string) {
    const response = await apiClient(`/api/rbac/users/${userId}/roles?userType=${userType}`, {
      method: 'GET',
    });
    return parseResponse(response, 'Failed to get user roles');
  },

  /**
   * Assign role to user
   */
  async assignUserRole(userId: string, userType: string, roleId: string, scope?: any) {
    const response = await apiClient(`/api/rbac/users/${userId}/roles?userType=${userType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roleId, scope }),
    });
    return parseResponse(response, 'Failed to assign role');
  },

  /**
   * Initialize RBAC system
   */
  async initializeRBAC() {
    const response = await apiClient('/api/rbac/initialize', {
      method: 'POST',
    });
    return parseResponse(response, 'Failed to initialize RBAC');
  },

  /**
   * Get role permissions by role name
   */
  async getRolePermissionsByName(roleName: string) {
    const response = await apiClient(`/api/rbac/roles/by-name/${encodeURIComponent(roleName)}/permissions`, {
      method: 'GET',
    });
    return parseResponse(response, 'Failed to get role permissions');
  },

  /**
   * List verifications
   */
  async getVerifications(query?: { verificationType?: string; status?: string; requestedBy?: string }) {
    const queryString = query ? '?' + new URLSearchParams(query as any).toString() : '';
    const response = await apiClient(`/api/verifications${queryString}`, {
      method: 'GET',
    });
    return parseResponse(response, 'Failed to get verifications');
  },

  /**
   * Verify a verification request
   */
  async verifyVerification(id: string, verificationNotes?: string) {
    const response = await apiClient(`/api/verifications/${id}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ verificationNotes: verificationNotes || null }),
    });
    return parseResponse(response, 'Failed to verify');
  },

  /**
   * Reject a verification request
   */
  async rejectVerification(id: string, rejectionReason: string) {
    const response = await apiClient(`/api/verifications/${id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rejectionReason }),
    });
    return parseResponse(response, 'Failed to reject verification');
  },

  /**
   * Get current organization
   */
  async getOrganization() {
    const response = await apiClient('/api/organizations/me', {
      method: 'GET',
    });
    return parseResponse(response, 'Failed to get organization');
  },

  /**
   * Get organization usage stats
   */
  async getOrganizationUsage() {
    const response = await apiClient('/api/organizations/usage', {
      method: 'GET',
    });
    return parseResponse(response, 'Failed to get organization usage');
  },

  /**
   * @deprecated Use v1Api.landlords instead
   * Get landlords list
   */
  async getLandlords(query?: { search?: string; limit?: number; page?: number }) {
    console.warn('[adminApi.getLandlords] Deprecated: Use v1Api.landlords.list() instead');
    const { v1Api } = await import('@/lib/api/v1-client');
    return v1Api.landlords.list({
      page: query?.page || 1,
      limit: query?.limit || 50,
      search: query?.search,
    });
  },

  /**
   * @deprecated Use v1Api.landlords instead
   * Create landlord
   */
  async createLandlord(data: any) {
    console.warn('[adminApi.createLandlord] Deprecated: Use v1Api.landlords.create() instead');
    const { v1Api } = await import('@/lib/api/v1-client');
    return v1Api.landlords.create(data);
  },

  /**
   * @deprecated Use v1Api.landlords instead
   * Get single landlord by ID
   */
  async getLandlord(id: string) {
    console.warn('[adminApi.getLandlord] Deprecated: Use v1Api.landlords.getById() instead');
    const { v1Api } = await import('@/lib/api/v1-client');
    // Use the landlords API resource
    const response = await (v1Api as any).landlords.getById(id);
    return response;
  },

  /**
   * @deprecated Use v1Api.landlords instead
   * Update landlord
   */
  async updateLandlord(id: string, data: any) {
    console.warn('[adminApi.updateLandlord] Deprecated: Use v1Api.landlords.update() instead');
    const { v1Api } = await import('@/lib/api/v1-client');
    return v1Api.landlords.update(id, data);
  },

  /**
   * Get approvals list
   */
  async getApprovals(query?: { status?: string; page?: number; limit?: number }) {
    const queryString = query ? '?' + new URLSearchParams(query as any).toString() : '';
    const response = await apiClient(`/api/approvals${queryString}`, {
      method: 'GET',
    });
    return parseResponse(response, 'Failed to get approvals');
  },

  /**
   * Approve an approval request
   */
  async approveApproval(approvalId: string, notes?: string | null) {
    const response = await apiClient(`/api/approvals/${approvalId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes: notes || null }),
    });
    return parseResponse(response, 'Failed to approve request');
  },

  /**
   * Reject an approval request
   */
  async rejectApproval(approvalId: string, reason: string) {
    const response = await apiClient(`/api/approvals/${approvalId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });
    return parseResponse(response, 'Failed to reject request');
  },

  /**
   * Create approval request
   */
  async createApproval(data: any) {
    const response = await apiClient('/api/approvals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return parseResponse(response, 'Failed to create approval');
  },

  /**
   * Get activity logs
   */
  async getActivityLogs(query?: { type?: string; page?: number; limit?: number; userId?: string }) {
    const queryString = query ? '?' + new URLSearchParams(query as any).toString() : '';
    const response = await apiClient(`/api/activity-logs${queryString}`, {
      method: 'GET',
    });
    return parseResponse(response, 'Failed to get activity logs');
  },

  /**
   * @deprecated Use v1Api.vendors instead (contractors are vendors with type='contractor')
   * Get contractors (vendors)
   */
  async getContractors(query?: { search?: string; category?: string; isActive?: boolean }) {
    console.warn('[adminApi.getContractors] Deprecated: Use v1Api.vendors.list({ type: "contractor" }) instead');
    const { v1Api } = await import('@/lib/api/v1-client');
    return v1Api.vendors.list({
      page: 1,
      limit: 50,
      type: 'contractor',
      ...query,
    });
  },

  /**
   * @deprecated Use v1Api.vendors instead
   * Search contractors globally
   */
  async searchContractorsGlobal(searchTerm: string) {
    console.warn('[adminApi.searchContractorsGlobal] Deprecated: Use v1Api.vendors.list({ type: "contractor", search }) instead');
    const { v1Api } = await import('@/lib/api/v1-client');
    return v1Api.vendors.list({
      page: 1,
      limit: 50,
      type: 'contractor',
      search: searchTerm,
    });
  },

  /**
   * @deprecated Use v1Api.vendors specialized endpoint instead
   * Add contractor to landlord
   */
  async addContractorToLandlord(contractorId: string, landlordId: string) {
    console.warn('[adminApi.addContractorToLandlord] Deprecated: Use v1Api.specialized.addContractorToLandlord() instead');
    // This would need a specialized endpoint in v1Api
    throw new Error('Use v1Api.specialized.addContractorToLandlord() instead');
  },

  /**
   * @deprecated Use v1Api.vendors.delete() instead
   * Soft delete contractor
   */
  async softDeleteContractor(contractorId: string) {
    console.warn('[adminApi.softDeleteContractor] Deprecated: Use v1Api.vendors.delete() instead');
    const { v1Api } = await import('@/lib/api/v1-client');
    return v1Api.vendors.delete(contractorId);
  },

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: string) {
    const response = await apiClient(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    return parseResponse(response, 'Failed to update user role');
  },

  /**
   * Start impersonation
   */
  async startImpersonation(userId: string, userType: string) {
    const response = await apiClient('/api/admin/impersonate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userType }),
    });
    return parseResponse(response, 'Failed to start impersonation');
  },

  /**
   * Stop impersonation
   */
  async stopImpersonation() {
    const response = await apiClient('/api/admin/impersonate', {
      method: 'DELETE',
    });
    return parseResponse(response, 'Failed to stop impersonation');
  },
};

export default adminApi;

