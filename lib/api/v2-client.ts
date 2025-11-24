/**
 * FastAPI v2 Backend API Client
 * Handles authentication and API calls to the FastAPI backend
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
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

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

      throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
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
}

// Export singleton instance
export const v2Api = new ApiClient(API_BASE_URL);

