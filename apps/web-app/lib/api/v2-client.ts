/**
 * FastAPI v2 Backend API Client
 * Handles authentication and API calls to the FastAPI backend
 * 
 * ⚠️ DEPRECATED: This file is being replaced by v2-client-new.ts which uses the typed client.
 * New code should use v2-client-new.ts or import directly from @pinaka/api-client
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_V2_BASE_URL || 'http://localhost:8000/api/v2';

export interface ApiError {
  detail: string;
  status?: number;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('v2_access_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('v2_access_token', token);
      } else {
        localStorage.removeItem('v2_access_token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries = 2
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const error: ApiError = {
          detail: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };

        try {
          const errorData = await response.json();
          if (errorData.detail) {
            error.detail = errorData.detail;
          }
        } catch (e) {
          // Ignore JSON parse errors
        }

        // Retry on network errors (5xx) or rate limiting (429), not client errors (4xx)
        if (retries > 0 && (response.status >= 500 || response.status === 429)) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries))); // Exponential backoff
          return this.request<T>(endpoint, options, retries - 1);
        }

        throw error;
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null as T;
      }

      return response.json();
    } catch (error: any) {
      // Retry on network errors (not HTTP errors)
      if (retries > 0 && error.name === 'TypeError' && error.message.includes('fetch')) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries))); // Exponential backoff
        return this.request<T>(endpoint, options, retries - 1);
      }
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request<{ access_token: string; token_type: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    this.setToken(response.access_token);
    return response;
  }

  async logout() {
    this.setToken(null);
  }

  async getCurrentUser() {
    return this.request<{
      user: {
        id: string;
        email: string;
        full_name: string | null;
        phone: string | null;
        status: string;
        organization_id: string | null;
        onboarding_completed: boolean;
        onboarding_step: number;
        onboarding_data: Record<string, any> | null;
        created_at: string;
        updated_at: string;
      };
      roles: Array<{
        id: string;
        name: string;
        description: string | null;
      }>;
      organization_id: string | null;
    }>('/auth/me');
  }

  // Onboarding endpoints
  async getOnboardingStatus() {
    return this.request<{
      onboarding_completed: boolean;
      onboarding_step: number;
      onboarding_data: Record<string, any>;
    }>('/onboarding/status');
  }

  async updateOnboardingStatus(data: {
    step?: number;
    completed?: boolean;
    data?: Record<string, any>;
  }) {
    return this.request<{
      onboarding_completed: boolean;
      onboarding_step: number;
      onboarding_data: Record<string, any>;
    }>('/onboarding/status', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async completeOnboarding() {
    return this.request<{
      onboarding_completed: boolean;
      onboarding_step: number;
      message: string;
    }>('/onboarding/complete', {
      method: 'POST',
    });
  }

  // Organization endpoints
  async listOrganizations() {
    return this.request<Array<{
      id: string;
      name: string;
      type: string;
      timezone: string | null;
      country: string | null;
      created_at: string;
    }>>('/organizations');
  }

  async getOrganization(orgId: string) {
    return this.request<{
      id: string;
      name: string;
      type: string;
      timezone: string | null;
      country: string | null;
      created_at: string;
    }>(`/organizations/${orgId}`);
  }

  // Property endpoints
  async listProperties(organizationId?: string) {
    const params = new URLSearchParams();
    if (organizationId) {
      params.append('organization_id', organizationId);
    }
    const query = params.toString();
    return this.request<Array<{
      id: string;
      organization_id: string;
      landlord_id: string | null;
      name: string | null;
      address_line1: string;
      address_line2: string | null;
      city: string | null;
      state: string | null;
      postal_code: string | null;
      country: string | null;
      status: string;
      created_at: string;
    }>>(`/properties${query ? `?${query}` : ''}`);
  }

  async getProperty(propertyId: string) {
    return this.request<{
      id: string;
      organization_id: string;
      landlord_id: string | null;
      name: string | null;
      address_line1: string;
      address_line2: string | null;
      city: string | null;
      state: string | null;
      postal_code: string | null;
      country: string | null;
      status: string;
      created_at: string;
    }>(`/properties/${propertyId}`);
  }

  async updateProperty(propertyId: string, data: {
    name?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    status?: string;
  }) {
    return this.request<{
      id: string;
      organization_id: string;
      landlord_id: string | null;
      name: string | null;
      address_line1: string;
      address_line2: string | null;
      city: string | null;
      state: string | null;
      postal_code: string | null;
      country: string | null;
      status: string;
      created_at: string;
    }>(`/properties/${propertyId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProperty(propertyId: string) {
    return this.request<void>(`/properties/${propertyId}`, {
      method: 'DELETE',
    });
  }

  async createProperty(data: {
    organization_id: string;
    landlord_id?: string;
    name?: string;
    address_line1: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    status?: string;
  }) {
    return this.request<{
      id: string;
      organization_id: string;
      landlord_id: string | null;
      name: string | null;
      address_line1: string;
      address_line2: string | null;
      city: string | null;
      state: string | null;
      postal_code: string | null;
      country: string | null;
      status: string;
      created_at: string;
    }>('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Work Order endpoints
  async listWorkOrders(filters?: {
    organization_id?: string;
    property_id?: string;
    status?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.organization_id) {
      params.append('organization_id', filters.organization_id);
    }
    if (filters?.property_id) {
      params.append('property_id', filters.property_id);
    }
    if (filters?.status) {
      params.append('status_filter', filters.status);
    }
    const query = params.toString();
    return this.request<Array<{
      id: string;
      organization_id: string;
      property_id: string;
      unit_id: string | null;
      tenant_id: string | null;
      created_by_user_id: string;
      title: string;
      description: string | null;
      status: string;
      priority: string;
      created_at: string;
      updated_at: string;
      completed_at: string | null;
      comments?: Array<{
        id: string;
        work_order_id: string;
        author_user_id: string;
        body: string;
        created_at: string;
        author?: {
          id: string;
          email: string;
          full_name: string | null;
        };
      }>;
      attachments?: Array<{
        id: string;
        organization_id: string;
        entity_type: string;
        entity_id: string;
        storage_key: string;
        file_name: string;
        mime_type: string | null;
        file_size_bytes: number | null;
        created_at: string;
      }>;
    }>>(`/work-orders${query ? `?${query}` : ''}`);
  }

  async getWorkOrder(workOrderId: string) {
    return this.request<{
      id: string;
      organization_id: string;
      property_id: string;
      unit_id: string | null;
      tenant_id: string | null;
      created_by_user_id: string;
      title: string;
      description: string | null;
      status: string;
      priority: string;
      created_at: string;
      updated_at: string;
      completed_at: string | null;
      comments?: Array<{
        id: string;
        work_order_id: string;
        author_user_id: string;
        body: string;
        created_at: string;
        author?: {
          id: string;
          email: string;
          full_name: string | null;
        };
      }>;
      attachments?: Array<{
        id: string;
        organization_id: string;
        entity_type: string;
        entity_id: string;
        storage_key: string;
        file_name: string;
        mime_type: string | null;
        file_size_bytes: number | null;
        created_at: string;
      }>;
    }>(`/work-orders/${workOrderId}`);
  }

  async createWorkOrder(data: {
    organization_id: string;
    property_id: string;
    unit_id?: string;
    tenant_id?: string;
    title: string;
    description?: string;
    status?: string;
    priority?: string;
  }) {
    return this.request<{
      id: string;
      organization_id: string;
      property_id: string;
      unit_id: string | null;
      tenant_id: string | null;
      created_by_user_id: string;
      title: string;
      description: string | null;
      status: string;
      priority: string;
      created_at: string;
      updated_at: string;
      completed_at: string | null;
    }>('/work-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWorkOrder(workOrderId: string, data: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    completed_at?: string | null;
  }) {
    return this.request<{
      id: string;
      organization_id: string;
      property_id: string;
      unit_id: string | null;
      tenant_id: string | null;
      created_by_user_id: string;
      title: string;
      description: string | null;
      status: string;
      priority: string;
      created_at: string;
      updated_at: string;
      completed_at: string | null;
    }>(`/work-orders/${workOrderId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async addWorkOrderComment(workOrderId: string, body: string) {
    return this.request<{
      id: string;
      work_order_id: string;
      author_user_id: string;
      body: string;
      created_at: string;
    }>(`/work-orders/${workOrderId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
  }

  async approveWorkOrder(workOrderId: string, data?: {
    approved_amount?: number;
    notes?: string;
  }) {
    return this.request<any>(`/work-orders/${workOrderId}/approve`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async assignVendorToWorkOrder(workOrderId: string, vendorId: string) {
    return this.request<any>(`/work-orders/${workOrderId}/assign-vendor`, {
      method: 'POST',
      body: JSON.stringify({ vendor_id: vendorId }),
    });
  }

  async markWorkOrderViewed(workOrderId: string, role: 'landlord' | 'tenant') {
    return this.request<{ success: boolean; message: string }>(`/work-orders/${workOrderId}/mark-viewed`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  }

  async downloadWorkOrderPDF(workOrderId: string): Promise<Blob> {
    const url = `${API_BASE_URL}/work-orders/${workOrderId}/download-pdf`;
    const headers: HeadersInit = {};
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }

    return response.blob();
  }

  // Attachment endpoints
  async listAttachments(entityType: string, entityId: string) {
    return this.request<Array<{
      id: string;
      organization_id: string;
      entity_type: string;
      entity_id: string;
      storage_key: string;
      file_name: string;
      mime_type: string | null;
      file_size_bytes: number | null;
      created_at: string;
    }>>(`/attachments?entity_type=${entityType}&entity_id=${entityId}`);
  }

  async uploadAttachment(
    entityType: string,
    entityId: string,
    file: File
  ) {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE_URL}/attachments?entity_type=${entityType}&entity_id=${entityId}`;
    const headers: HeadersInit = {};
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const error: ApiError = {
        detail: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          error.detail = errorData.detail;
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
      throw error;
    }

    return response.json();
  }

  async downloadAttachment(attachmentId: string) {
    const url = `${API_BASE_URL}/attachments/${attachmentId}/download`;
    const headers: HeadersInit = {};
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to download attachment: ${response.statusText}`);
    }

    return response.blob();
  }

  // Landlord endpoints
  async listLandlords(organizationId?: string) {
    const params = new URLSearchParams();
    if (organizationId) params.append('organization_id', organizationId);
    return this.request<Array<any>>(`/landlords${params.toString() ? `?${params}` : ''}`);
  }

  async getLandlord(landlordId: string) {
    return this.request<any>(`/landlords/${landlordId}`);
  }

  async createLandlord(data: any) {
    return this.request<any>('/landlords', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateLandlord(landlordId: string, data: any) {
    return this.request<any>(`/landlords/${landlordId}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  // Tenant endpoints
  async listTenants(organizationId?: string) {
    const params = new URLSearchParams();
    if (organizationId) params.append('organization_id', organizationId);
    return this.request<Array<any>>(`/tenants${params.toString() ? `?${params}` : ''}`);
  }

  async getTenant(tenantId: string) {
    return this.request<any>(`/tenants/${tenantId}`);
  }

  async createTenant(data: any) {
    return this.request<any>('/tenants', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateTenant(tenantId: string, data: any) {
    return this.request<any>(`/tenants/${tenantId}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async approveTenant(tenantId: string) {
    return this.request<any>(`/tenants/${tenantId}/approve`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  async rejectTenant(tenantId: string, reason?: string) {
    return this.request<any>(`/tenants/${tenantId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getTenantRentData(tenantId: string) {
    return this.request<{
      lease: {
        id: string;
        rent_amount: number;
        start_date: string;
        end_date: string | null;
      };
      property: {
        id: string;
        name: string;
        address_line1: string;
      } | null;
      unit: {
        id: string;
        name: string;
      } | null;
      rent_payments: Array<any>;
    }>(`/tenants/${tenantId}/rent-data`);
  }

  async getTenantsWithOutstandingBalance() {
    return this.request<{
      success: boolean;
      tenants: Array<any>;
    }>('/tenants/with-outstanding-balance');
  }

  // Lease endpoints
  async listLeases(filters?: { organization_id?: string; unit_id?: string; tenant_id?: string; landlord_id?: string }) {
    const params = new URLSearchParams();
    if (filters?.organization_id) params.append('organization_id', filters.organization_id);
    if (filters?.unit_id) params.append('unit_id', filters.unit_id);
    if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
    if (filters?.landlord_id) params.append('landlord_id', filters.landlord_id);
    return this.request<Array<any>>(`/leases${params.toString() ? `?${params}` : ''}`);
  }

  async getLease(leaseId: string) {
    return this.request<any>(`/leases/${leaseId}`);
  }

  async createLease(data: any) {
    return this.request<any>('/leases', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateLease(leaseId: string, data: any) {
    return this.request<any>(`/leases/${leaseId}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async renewLease(leaseId: string, data: {
    decision: 'renew' | 'month-to-month' | 'terminate';
    new_lease_end?: string;
    new_rent_amount?: number;
  }) {
    return this.request<any>(`/leases/${leaseId}/renew`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async terminateLease(leaseId: string, data: {
    termination_date: string;
    reason?: string;
    actual_loss?: number;
  }) {
    return this.request<any>(`/leases/${leaseId}/terminate`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteLease(leaseId: string) {
    return this.request<void>(`/leases/${leaseId}`, { method: 'DELETE' });
  }

  // Unit endpoints
  async listUnits(propertyId?: string) {
    const params = new URLSearchParams();
    if (propertyId) params.append('property_id', propertyId);
    return this.request<Array<any>>(`/units${params.toString() ? `?${params}` : ''}`);
  }

  async getUnit(unitId: string) {
    return this.request<any>(`/units/${unitId}`);
  }

  async createUnit(data: any) {
    return this.request<any>('/units', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateUnit(unitId: string, data: any) {
    return this.request<any>(`/units/${unitId}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deleteUnit(unitId: string) {
    return this.request<void>(`/units/${unitId}`, {
      method: 'DELETE',
    });
  }

  // Notification endpoints
  async listNotifications(isRead?: boolean) {
    const params = new URLSearchParams();
    if (isRead !== undefined) params.append('is_read', String(isRead));
    return this.request<Array<any>>(`/notifications${params.toString() ? `?${params}` : ''}`);
  }

  async markNotificationRead(notificationId: string) {
    return this.request<any>(`/notifications/${notificationId}/read`, { method: 'PATCH' });
  }

  async markAllNotificationsRead() {
    return this.request<void>('/notifications/mark-all-read', { method: 'POST' });
  }

  // User endpoints
  async listUsers(organizationId?: string) {
    const params = new URLSearchParams();
    if (organizationId) params.append('organization_id', organizationId);
    return this.request<Array<any>>(`/users${params.toString() ? `?${params}` : ''}`);
  }

  async getUser(userId: string) {
    return this.request<any>(`/users/${userId}`);
  }

  async assignRole(userId: string, roleName: string, organizationId?: string) {
    return this.request<any>(`/users/${userId}/roles`, {
      method: 'POST',
      body: JSON.stringify({
        role_name: roleName,
        organization_id: organizationId,
      }),
    });
  }

  // Vendor endpoints
  async listVendors(organizationId?: string, search?: string, status?: string) {
    const params = new URLSearchParams();
    if (organizationId) params.append('organization_id', organizationId);
    if (search) params.append('search', search);
    if (status) params.append('status_filter', status);
    return this.request<Array<any>>(`/vendors${params.toString() ? `?${params}` : ''}`);
  }

  async getVendor(vendorId: string) {
    return this.request<any>(`/vendors/${vendorId}`);
  }

  async createVendor(data: {
    organization_id: string;
    user_id?: string;
    company_name: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    service_categories?: string[];
    status?: string;
  }) {
    return this.request<any>('/vendors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVendor(vendorId: string, data: {
    company_name?: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    service_categories?: string[];
    status?: string;
  }) {
    return this.request<any>(`/vendors/${vendorId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteVendor(vendorId: string) {
    return this.request<void>(`/vendors/${vendorId}`, {
      method: 'DELETE',
    });
  }

  // Search endpoint
  async search(query: string, type?: string, limit?: number) {
    const params = new URLSearchParams();
    params.append('q', query);
    if (type) params.append('type', type);
    if (limit) params.append('limit', String(limit));
    return this.request<{
      success: boolean;
      query: string;
      results: {
        properties?: Array<any>;
        tenants?: Array<any>;
        landlords?: Array<any>;
        leases?: Array<any>;
        work_orders?: Array<any>;
      };
    }>(`/search?${params}`);
  }

  // Task endpoints
  async listTasks(organizationId?: string, propertyId?: string, statusFilter?: string) {
    const params = new URLSearchParams();
    if (organizationId) params.append('organization_id', organizationId);
    if (propertyId) params.append('property_id', propertyId);
    if (statusFilter) params.append('status_filter', statusFilter);
    return this.request<Array<any>>(`/tasks${params.toString() ? `?${params}` : ''}`);
  }

  async getTask(taskId: string) {
    return this.request<any>(`/tasks/${taskId}`);
  }

  async createTask(data: {
    organization_id: string;
    title: string;
    description?: string;
    category?: string;
    due_date: string;
    priority?: string;
    property_id?: string;
  }) {
    return this.request<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(taskId: string, data: {
    title?: string;
    description?: string;
    category?: string;
    due_date?: string;
    priority?: string;
    is_completed?: boolean;
    property_id?: string;
  }) {
    return this.request<any>(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(taskId: string) {
    return this.request<void>(`/tasks/${taskId}`, { method: 'DELETE' });
  }

  // Conversation endpoints
  async listConversations(organizationId?: string, entityType?: string, entityId?: string) {
    const params = new URLSearchParams();
    if (organizationId) params.append('organization_id', organizationId);
    if (entityType) params.append('entity_type', entityType);
    if (entityId) params.append('entity_id', entityId);
    return this.request<Array<any>>(`/conversations${params.toString() ? `?${params}` : ''}`);
  }

  async getConversation(conversationId: string) {
    return this.request<any>(`/conversations/${conversationId}`);
  }

  async createConversation(data: {
    organization_id: string;
    subject?: string;
    entity_type?: string;
    entity_id?: string;
    participant_user_ids?: string[];
  }) {
    return this.request<any>('/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateConversation(conversationId: string, data: {
    subject?: string;
    status?: string;
  }) {
    return this.request<any>(`/conversations/${conversationId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async listMessages(conversationId: string) {
    return this.request<Array<any>>(`/conversations/${conversationId}/messages`);
  }

  async createMessage(conversationId: string, data: { body: string }) {
    return this.request<any>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Invitation endpoints
  async listInvitations(organizationId?: string, statusFilter?: string) {
    const params = new URLSearchParams();
    if (organizationId) params.append('organization_id', organizationId);
    if (statusFilter) params.append('status_filter', statusFilter);
    return this.request<Array<any>>(`/invitations${params.toString() ? `?${params}` : ''}`);
  }

  async getInvitation(invitationId: string) {
    return this.request<any>(`/invitations/${invitationId}`);
  }

  async createInvitation(data: {
    organization_id: string;
    email: string;
    role_name: string;
    expires_in_days?: number;
  }) {
    return this.request<any>('/invitations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInvitation(invitationId: string, data: { status?: string }) {
    return this.request<any>(`/invitations/${invitationId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async acceptInvitation(token: string) {
    return this.request<any>(`/invitations/accept/${token}`, {
      method: 'POST',
    });
  }

  // Form endpoints
  async listForms(organizationId?: string, formType?: string, entityType?: string, entityId?: string) {
    const params = new URLSearchParams();
    if (organizationId) params.append('organization_id', organizationId);
    if (formType) params.append('form_type', formType);
    if (entityType) params.append('entity_type', entityType);
    if (entityId) params.append('entity_id', entityId);
    return this.request<Array<any>>(`/forms${params.toString() ? `?${params}` : ''}`);
  }

  async getForm(formId: string) {
    return this.request<any>(`/forms/${formId}`);
  }

  async createForm(data: {
    organization_id: string;
    form_type: string;
    entity_type?: string;
    entity_id?: string;
    template_data?: any;
  }) {
    return this.request<any>('/forms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateForm(formId: string, data: {
    template_data?: any;
    status?: string;
  }) {
    return this.request<any>(`/forms/${formId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async createFormSignature(formId: string, data: { signature_data?: string }) {
    return this.request<any>(`/forms/${formId}/signatures`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Rent Payment endpoints
  async listRentPayments(organizationId?: string, leaseId?: string, tenantId?: string, statusFilter?: string) {
    const params = new URLSearchParams();
    if (organizationId) params.append('organization_id', organizationId);
    if (leaseId) params.append('lease_id', leaseId);
    if (tenantId) params.append('tenant_id', tenantId);
    if (statusFilter) params.append('status_filter', statusFilter);
    return this.request<Array<any>>(`/rent-payments${params.toString() ? `?${params}` : ''}`);
  }

  async createRentPayment(data: {
    organization_id: string;
    lease_id: string;
    tenant_id: string;
    amount: number;
    payment_date: string;
    payment_method?: string;
    reference_number?: string;
    notes?: string;
  }) {
    return this.request<any>('/rent-payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRentPayment(paymentId: string, data: {
    amount?: number;
    payment_date?: string;
    payment_method?: string;
    status?: string;
    reference_number?: string;
    notes?: string;
  }) {
    return this.request<any>(`/rent-payments/${paymentId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Expense endpoints
  async listExpenses(organizationId?: string, propertyId?: string, category?: string, statusFilter?: string) {
    const params = new URLSearchParams();
    if (organizationId) params.append('organization_id', organizationId);
    if (propertyId) params.append('property_id', propertyId);
    if (category) params.append('category', category);
    if (statusFilter) params.append('status_filter', statusFilter);
    return this.request<Array<any>>(`/expenses${params.toString() ? `?${params}` : ''}`);
  }

  async createExpense(data: {
    organization_id: string;
    category: string;
    amount: number;
    expense_date: string;
    description?: string;
    property_id?: string;
    work_order_id?: string;
    vendor_id?: string;
    receipt_attachment_id?: string;
  }) {
    return this.request<any>('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExpense(expenseId: string, data: {
    category?: string;
    amount?: number;
    expense_date?: string;
    description?: string;
    receipt_attachment_id?: string;
    status?: string;
  }) {
    return this.request<any>(`/expenses/${expenseId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Inspection endpoints
  async listInspections(organizationId?: string, propertyId?: string, statusFilter?: string) {
    const params = new URLSearchParams();
    if (organizationId) params.append('organization_id', organizationId);
    if (propertyId) params.append('property_id', propertyId);
    if (statusFilter) params.append('status_filter', statusFilter);
    return this.request<Array<any>>(`/inspections${params.toString() ? `?${params}` : ''}`);
  }

  async createInspection(data: {
    organization_id: string;
    property_id: string;
    inspection_type: string;
    scheduled_date: string;
    unit_id?: string;
    lease_id?: string;
    notes?: string;
    checklist_data?: any;
  }) {
    return this.request<any>('/inspections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInspection(inspectionId: string, data: {
    inspection_type?: string;
    scheduled_date?: string;
    completed_date?: string;
    status?: string;
    notes?: string;
    checklist_data?: any;
  }) {
    return this.request<any>(`/inspections/${inspectionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // RBAC endpoints
  async checkPermission(resource: string, action: string, category?: string, scope?: any) {
    return this.request<{ has_permission: boolean; reason?: string }>('/rbac/permissions/check', {
      method: 'POST',
      body: JSON.stringify({ resource, action, category, scope }),
    });
  }

  async getUserScopes() {
    return this.request<{ scopes: Array<{ portfolio_id?: string; property_id?: string; unit_id?: string; organization_id?: string }>; roles: string[] }>('/rbac/scopes');
  }

  async checkResourceAccess(resourceId: string, resourceType: string) {
    return this.request<{ has_access: boolean; reason?: string }>(`/rbac/access/${resourceId}?resource_type=${resourceType}`);
  }

  async listRoles() {
    return this.request<Array<{ id: string; name: string; description?: string }>>('/rbac/roles');
  }

  async getUserRoles(userId: string) {
    return this.request<Array<{ id: string; role_id: string; role_name: string; organization_id?: string; created_at?: string }>>(`/rbac/users/${userId}/roles`);
  }
}

// Export singleton instance
export const v2Api = new ApiClient(API_BASE_URL);

