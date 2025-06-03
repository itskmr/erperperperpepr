import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';

// Types for better error handling
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  meta?: {
    schoolId?: number;
    userRole?: string;
    appliedFilters?: Record<string, unknown>;
  };
}

// Get the API base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with authentication
const authApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  timeout: 10000 // 10 second timeout
});

// Request interceptor to add authentication token
authApi.interceptors.request.use(
  (config) => {
    // Get token from localStorage (check both possible storage keys)
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Log the request for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, token ? 'with auth' : 'without auth');
    
    return config;
  },
  (error) => {
    console.error('Request configuration error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
authApi.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    if (error.response) {
      const status = error.response.status;
      
      // Handle authentication errors
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('role');
        localStorage.removeItem('userRole');
        
        // Redirect to login page
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/auth')) {
          console.warn('Authentication failed, redirecting to login');
          window.location.href = '/auth';
        }
        
        return Promise.reject({
          message: 'Authentication failed. Please log in again.',
          status: 401,
          code: 'AUTH_FAILED'
        } as ApiError);
      }
      
      // Handle forbidden errors
      if (status === 403) {
        return Promise.reject({
          message: 'You do not have permission to access this resource.',
          status: 403,
          code: 'FORBIDDEN'
        } as ApiError);
      }
      
      // Handle not found errors
      if (status === 404) {
        return Promise.reject({
          message: 'Resource not found.',
          status: 404,
          code: 'NOT_FOUND'
        } as ApiError);
      }
      
      // Handle server errors
      if (status >= 500) {
        return Promise.reject({
          message: 'Server error. Please try again later.',
          status: status,
          code: 'SERVER_ERROR'
        } as ApiError);
      }
      
      // Extract error message from response
      const responseData = error.response.data as { error?: string; message?: string } | undefined;
      const errorMessage = responseData?.error || 
                          responseData?.message || 
                          error.message || 
                          'An error occurred';
      
      return Promise.reject({
        message: errorMessage,
        status: status,
        code: 'API_ERROR'
      } as ApiError);
    }
    
    // Handle network errors
    if (error.request) {
      console.error('Network error - no response received:', error.request);
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
        code: 'NETWORK_ERROR'
      } as ApiError);
    }
    
    // Handle other errors
    console.error('Error setting up request:', error.message);
    return Promise.reject({
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR'
    } as ApiError);
  }
);

// Helper functions for common API operations
export const apiGet = async <T = unknown>(url: string): Promise<T> => {
  const response = await authApi.get<ApiResponse<T>>(url);
  return response.data.data !== undefined ? response.data.data : response.data as T;
};

// Function to get full response including meta/pagination data
export const apiGetWithMeta = async <T = unknown>(url: string): Promise<ApiResponse<T>> => {
  const response = await authApi.get<ApiResponse<T>>(url);
  return response.data;
};

export const apiPost = async <T = unknown>(url: string, data?: unknown): Promise<T> => {
  const response = await authApi.post<ApiResponse<T>>(url, data);
  return response.data.data !== undefined ? response.data.data : response.data as T;
};

export const apiPut = async <T = unknown>(url: string, data?: unknown): Promise<T> => {
  const response = await authApi.put<ApiResponse<T>>(url, data);
  return response.data.data !== undefined ? response.data.data : response.data as T;
};

export const apiDelete = async <T = unknown>(url: string): Promise<T> => {
  const response = await authApi.delete<ApiResponse<T>>(url);
  return response.data.data !== undefined ? response.data.data : response.data as T;
};

// Function to handle FormData uploads with authentication
export const apiPostFormData = async <T = unknown>(url: string, formData: FormData): Promise<T> => {
  // Create a special config for FormData that doesn't set Content-Type
  // (let the browser set it with the boundary for multipart/form-data)
  const response = await authApi.post<ApiResponse<T>>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data.data !== undefined ? response.data.data : response.data as T;
};

// Function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  
  if (!token) {
    return false;
  }
  
  try {
    // Basic token validation - check if it's not expired
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return false;
    }
    
    const payload = JSON.parse(atob(tokenParts[1]));
    const isExpired = payload.exp && payload.exp * 1000 < Date.now();
    
    if (isExpired) {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('Token validation failed:', error);
    return false;
  }
};

// Function to get user role from token
export const getUserRole = (): string | null => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  
  if (!token) {
    return null;
  }
  
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return null;
    }
    
    const payload = JSON.parse(atob(tokenParts[1]));
    return payload.role || null;
  } catch (error) {
    console.warn('Failed to extract role from token:', error);
    return null;
  }
};

// Function to get school ID from token
export const getSchoolId = (): number | null => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  
  if (!token) {
    return null;
  }
  
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return null;
    }
    
    const payload = JSON.parse(atob(tokenParts[1]));
    return payload.schoolId || null;
  } catch (error) {
    console.warn('Failed to extract school ID from token:', error);
    return null;
  }
};

// Export the authenticated axios instance for direct use if needed
export default authApi; 