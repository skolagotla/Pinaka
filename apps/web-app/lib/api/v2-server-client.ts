/**
 * Server-Side V2 API Client
 * 
 * For use in server-side contexts (services, background jobs, etc.)
 * Uses environment variables for authentication and base URL.
 */

const API_BASE_URL = process.env.API_V2_BASE_URL || process.env.NEXT_PUBLIC_API_V2_BASE_URL || 'http://localhost:8000/api/v2';

export interface ApiError {
  detail: string;
  status?: number;
}

class ServerApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    // For server-side, token can come from env or service account
    this.token = process.env.API_SERVICE_TOKEN || null;
  }

  setToken(token: string | null) {
    this.token = token;
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

  // Generic CRUD methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Entity-specific methods
  async list<T>(entity: string, params?: Record<string, any>): Promise<T[]> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.get<T[]>(`/${entity}${queryString}`);
  }

  async getById<T>(entity: string, id: string): Promise<T> {
    return this.get<T>(`/${entity}/${id}`);
  }

  async create<T>(entity: string, data: any): Promise<T> {
    return this.post<T>(`/${entity}`, data);
  }

  async update<T>(entity: string, id: string, data: any): Promise<T> {
    return this.patch<T>(`/${entity}/${id}`, data);
  }

  async remove(entity: string, id: string): Promise<void> {
    return this.delete<void>(`/${entity}/${id}`);
  }
}

// Export singleton instance
export const serverV2Api = new ServerApiClient();

