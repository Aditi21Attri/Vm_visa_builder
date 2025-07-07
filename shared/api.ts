/**
 * API Client Configuration
 * Centralized API handling for frontend-backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * API Response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * Request configuration interface
 */
export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
}

/**
 * Default request headers
 */
const defaultHeaders = {
  'Content-Type': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
};

/**
 * Add query parameters to URL
 */
const addQueryParams = (url: string, params?: Record<string, string>): string => {
  if (!params) return url;
  
  const searchParams = new URLSearchParams(params);
  return `${url}?${searchParams.toString()}`;
};

/**
 * Main API client class
 */
class ApiClient {
  private baseUrl: string;
  private authToken?: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string) {
    this.authToken = token;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken() {
    this.authToken = undefined;
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): Record<string, string> {
    if (this.authToken) {
      return {
        'Authorization': `Bearer ${this.authToken}`,
      };
    }
    return {};
  }

  /**
   * Make HTTP request
   */
  private async makeRequest<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      params
    } = config;

    const url = addQueryParams(`${this.baseUrl}${endpoint}`, params);
    
    const requestHeaders = {
      ...defaultHeaders,
      ...this.getAuthHeaders(),
      ...headers,
    };

    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
      credentials: 'include',
    };

    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        // Remove Content-Type header for FormData (let browser set it)
        delete requestHeaders['Content-Type'];
        requestConfig.body = body;
      } else {
        requestConfig.body = JSON.stringify(body);
      }
    }

    try {
      const response = await fetch(url, requestConfig);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.message || 'Request failed',
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError(
          'Network error. Please check your connection.',
          0
        );
      }

      throw new ApiError(
        'An unexpected error occurred',
        500,
        error
      );
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET', params });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'PUT', body });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'PATCH', body });
  }

  /**
   * Upload file
   */
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.makeRequest<T>(endpoint, { method: 'POST', body: formData });
  }
}

// Create and export API client instance
export const apiClient = new ApiClient();

// Export API client class for custom instances
export { ApiClient };

// Convenience functions for common operations
export const api = {
  // Authentication
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiClient.post('/auth/login', credentials),
    register: (userData: { email: string; password: string; name: string; role: string }) =>
      apiClient.post('/auth/register', userData),
    logout: () => apiClient.post('/auth/logout'),
    getProfile: () => apiClient.get('/auth/profile'),
  },

  // Users
  users: {
    getAll: () => apiClient.get('/users'),
    getById: (id: string) => apiClient.get(`/users/${id}`),
    update: (id: string, data: any) => apiClient.put(`/users/${id}`, data),
    delete: (id: string) => apiClient.delete(`/users/${id}`),
  },

  // Agents
  agents: {
    getAll: () => apiClient.get('/agents'),
    getById: (id: string) => apiClient.get(`/agents/${id}`),
    create: (data: any) => apiClient.post('/agents', data),
    update: (id: string, data: any) => apiClient.put(`/agents/${id}`, data),
    delete: (id: string) => apiClient.delete(`/agents/${id}`),
  },

  // Visa Requests
  visaRequests: {
    getAll: () => apiClient.get('/visa-requests'),
    getById: (id: string) => apiClient.get(`/visa-requests/${id}`),
    create: (data: any) => apiClient.post('/visa-requests', data),
    update: (id: string, data: any) => apiClient.put(`/visa-requests/${id}`, data),
    delete: (id: string) => apiClient.delete(`/visa-requests/${id}`),
  },

  // Applications
  applications: {
    getAll: () => apiClient.get('/applications'),
    getById: (id: string) => apiClient.get(`/applications/${id}`),
    create: (data: any) => apiClient.post('/applications', data),
    update: (id: string, data: any) => apiClient.put(`/applications/${id}`, data),
    delete: (id: string) => apiClient.delete(`/applications/${id}`),
  },

  // Documents
  documents: {
    getAll: () => apiClient.get('/documents'),
    getById: (id: string) => apiClient.get(`/documents/${id}`),
    upload: (file: File, metadata?: any) => apiClient.uploadFile('/documents/upload', file, metadata),
    delete: (id: string) => apiClient.delete(`/documents/${id}`),
  },

  // Health check
  health: () => apiClient.get('/health'),
  test: () => apiClient.get('/test'),
};

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export default api;
