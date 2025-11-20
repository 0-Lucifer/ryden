// API Service - Centralized HTTP client with interceptors
import { API_CONFIG, getAuthHeaders } from '@/config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

class ApiService {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.API_GATEWAY,
      timeout: API_CONFIG.TIMEOUT,
      headers: getAuthHeaders(),
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token to all requests
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        if (!this.authToken) {
          this.authToken = await AsyncStorage.getItem('auth_token');
        }
        
        if (this.authToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[API] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors globally
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[API] Response ${response.status} from ${response.config.url}`);
        return response;
      },
      async (error: AxiosError) => {
        if (error.response) {
          const status = error.response.status;
          
          // Handle 401 Unauthorized - Token expired
          if (status === 401) {
            await this.handleUnauthorized();
          }
          
          // Handle 403 Forbidden
          if (status === 403) {
            console.error('[API] Forbidden access');
          }
          
          // Handle 500+ Server errors
          if (status >= 500) {
            console.error('[API] Server error:', error.response.data);
          }
        } else if (error.request) {
          console.error('[API] Network error - No response received');
        }
        
        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  private async handleUnauthorized() {
    console.log('[API] Token expired, clearing auth data');
    this.authToken = null;
    await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user_data']);
    // Navigate to login (you can emit an event here)
  }

  private normalizeError(error: AxiosError): any {
    if (error.response) {
      return {
        status: error.response.status,
        message: (error.response.data as any)?.message || 'Server error',
        data: error.response.data,
      };
    } else if (error.request) {
      return {
        status: 'NETWORK_ERROR',
        message: 'Network connection failed. Please check your internet.',
      };
    } else {
      return {
        status: 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred',
      };
    }
  }

  // Set auth token
  async setAuthToken(token: string) {
    this.authToken = token;
    await AsyncStorage.setItem('auth_token', token);
  }

  // Clear auth token
  async clearAuthToken() {
    this.authToken = null;
    await AsyncStorage.removeItem('auth_token');
  }

  // HTTP Methods
  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // File upload with progress
  async upload<T>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<T> {
    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: API_CONFIG.UPLOAD_TIMEOUT,
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  }
}

export default new ApiService();
