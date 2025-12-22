/**
 * API Service for HAIDA Backend
 * Handles all HTTP requests to the FastAPI backend
 */

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://haida-one.vercel.app';

// Token management
const TOKEN_KEY = 'haida_auth_token';
const USER_KEY = 'haida_user';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
  role?: 'admin' | 'qa_engineer' | 'developer' | 'viewer';
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login_at?: string;
}

export interface ApiError {
  detail: string;
  status?: number;
}

// Storage helpers
export const storage = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  getUser: (): User | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  setUser: (user: User): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  removeUser: (): void => {
    localStorage.removeItem(USER_KEY);
  },

  clear: (): void => {
    storage.removeToken();
    storage.removeUser();
  }
};

// HTTP Client
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = storage.getToken();
    const method = options.method || 'GET';
    const startTime = performance.now();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const duration = performance.now() - startTime;

      // Track API call (import monitoring if needed)
      if (typeof window !== 'undefined' && (window as any).haidaMonitoring) {
        (window as any).haidaMonitoring.trackApiCall(endpoint, method, response.status, duration);
      }

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
        return {} as T;
      }

      const data = await response.json();

      if (!response.ok) {
        throw {
          detail: data.detail || data.message || 'Request failed',
          status: response.status,
        } as ApiError;
      }

      return data;
    } catch (error: any) {
      const duration = performance.now() - startTime;

      // Track failed API call
      if (typeof window !== 'undefined' && (window as any).haidaMonitoring) {
        (window as any).haidaMonitoring.trackApiCall(endpoint, method, error.status || 0, duration);
      }

      // Re-throw ApiError
      if (error.detail) {
        throw error;
      }

      // Network or parsing errors
      throw {
        detail: error.message || 'Network error occurred',
        status: 0,
      } as ApiError;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Create API client instance
const apiClient = new ApiClient(API_BASE_URL);

// Auth API
export const authApi = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/auth/login', credentials);

    // Store token and user
    if (response.access_token) {
      storage.setToken(response.access_token);
    }
    if (response.user) {
      storage.setUser(response.user as User);
    }

    return response;
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/auth/register', data);

    // Store token and user
    if (response.access_token) {
      storage.setToken(response.access_token);
    }
    if (response.user) {
      storage.setUser(response.user as User);
    }

    return response;
  },

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/auth/refresh');

    if (response.access_token) {
      storage.setToken(response.access_token);
    }

    return response;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // Always clear local storage, even if API call fails
      storage.clear();
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!storage.getToken();
  },

  /**
   * Get stored user
   */
  getStoredUser(): User | null {
    return storage.getUser();
  }
};

// Health check API
export const healthApi = {
  /**
   * Check API health
   */
  async check(): Promise<{ status: string; service: string; version: string }> {
    return apiClient.get('/health');
  }
};

// Export the client for custom requests
export { apiClient };
export default authApi;
