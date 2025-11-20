// Authentication Service - Handles login, registration, OTP verification
import { API_CONFIG } from '@/config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from './api.service';

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  studentId?: string;
  university: string;
  role: 'rider' | 'driver';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface OTPVerification {
  phone: string;
  otp: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: UserData;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
  message: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  studentId?: string;
  university: string;
  role: 'rider' | 'driver' | 'both';
  isVerified: boolean;
  rating: number;
  totalRides: number;
  profilePicture?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
}

class AuthService {
  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await ApiService.post<AuthResponse>(
        `${API_CONFIG.SERVICES.AUTH}/register`,
        data
      );
      
      if (response.success && response.data.tokens) {
        await this.saveAuthData(response.data);
      }
      
      return response;
    } catch (error) {
      console.error('[AuthService] Registration failed:', error);
      throw error;
    }
  }

  // Login with email/phone and password
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await ApiService.post<AuthResponse>(
        `${API_CONFIG.SERVICES.AUTH}/login`,
        data
      );
      
      if (response.success && response.data.tokens) {
        await this.saveAuthData(response.data);
      }
      
      return response;
    } catch (error) {
      console.error('[AuthService] Login failed:', error);
      throw error;
    }
  }

  // Send OTP for phone verification
  async sendOTP(phone: string): Promise<{ success: boolean; message: string }> {
    try {
      return await ApiService.post(`${API_CONFIG.SERVICES.AUTH}/send-otp`, { phone });
    } catch (error) {
      console.error('[AuthService] Send OTP failed:', error);
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP(data: OTPVerification): Promise<{ success: boolean; message: string }> {
    try {
      return await ApiService.post(`${API_CONFIG.SERVICES.AUTH}/verify-otp`, data);
    } catch (error) {
      console.error('[AuthService] Verify OTP failed:', error);
      throw error;
    }
  }

  // Social login (Google, Facebook)
  async socialLogin(provider: 'google' | 'facebook', token: string): Promise<AuthResponse> {
    try {
      const response = await ApiService.post<AuthResponse>(
        `${API_CONFIG.SERVICES.AUTH}/social-login`,
        { provider, token }
      );
      
      if (response.success && response.data.tokens) {
        await this.saveAuthData(response.data);
      }
      
      return response;
    } catch (error) {
      console.error('[AuthService] Social login failed:', error);
      throw error;
    }
  }

  // Refresh access token
  async refreshToken(): Promise<{ accessToken: string }> {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token available');

      const response = await ApiService.post<{ accessToken: string }>(
        `${API_CONFIG.SERVICES.AUTH}/refresh-token`,
        { refreshToken }
      );
      
      await ApiService.setAuthToken(response.accessToken);
      return response;
    } catch (error) {
      console.error('[AuthService] Token refresh failed:', error);
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await ApiService.post(`${API_CONFIG.SERVICES.AUTH}/logout`, {});
    } catch (error) {
      console.error('[AuthService] Logout request failed:', error);
    } finally {
      await this.clearAuthData();
    }
  }

  // Save authentication data to AsyncStorage
  private async saveAuthData(data: AuthResponse['data']): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        ['auth_token', data.tokens.accessToken],
        ['refresh_token', data.tokens.refreshToken],
        ['user_data', JSON.stringify(data.user)],
      ]);
      await ApiService.setAuthToken(data.tokens.accessToken);
    } catch (error) {
      console.error('[AuthService] Failed to save auth data:', error);
      throw error;
    }
  }

  // Clear authentication data
  private async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user_data']);
      await ApiService.clearAuthToken();
    } catch (error) {
      console.error('[AuthService] Failed to clear auth data:', error);
    }
  }

  // Get current user data from storage
  async getCurrentUser(): Promise<UserData | null> {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('[AuthService] Failed to get current user:', error);
      return null;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      return !!token;
    } catch (error) {
      return false;
    }
  }

  // Upload student ID document for verification
  async uploadStudentID(file: any): Promise<{ success: boolean; message: string }> {
    try {
      const formData = new FormData();
      formData.append('document', file);
      
      return await ApiService.upload(
        `${API_CONFIG.SERVICES.AUTH}/verify-student-id`,
        formData
      );
    } catch (error) {
      console.error('[AuthService] Student ID upload failed:', error);
      throw error;
    }
  }
}

export default new AuthService();
