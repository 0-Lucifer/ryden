// Authentication Service - Handles login, registration, OTP verification
import { API_CONFIG } from '@/config/api.config';
import { firebaseAuth } from '@/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from './api.service';

export interface RegisterData {
  email: string;
  password: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: 'rider' | 'driver';
  university?: string;
  studentId: string;
  referralCode?: string;
}

export interface LoginData {
  email: string;
  // password is optional because Firebase sign-in may use `firebaseToken` instead
  password?: string;
  // Firebase ID token (optional) - when present, backend will verify Firebase and skip bcrypt
  firebaseToken?: string;
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
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  studentId?: string;
  university?: string;
  role: 'rider' | 'driver' | 'both';
  isVerified: boolean;
  rating?: number;
  totalRides?: number;
  profilePicture?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
}

export interface AvailabilityCheck {
  success: boolean;
  available: boolean;
  errors?: {
    email?: string;
    phone?: string;
  };
}

class AuthService {
  // Validate current session with backend
  async validateSession(): Promise<UserData | null> {
    try {
      const response = await ApiService.get<any>(`${API_CONFIG.SERVICES.AUTH}/me`);
      // Backend returns { success: true, data: { id, ... } }
      const userData = response?.data || response;
      if (userData && userData.id) {
        // Update local storage with fresh user data
        await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        return userData;
      }
      return null;
    } catch (error) {
      console.error('[AuthService] Session validation failed:', error);
      return null;
    }
  }

  // Check if email/phone is available
  async checkAvailability(email?: string, phone?: string): Promise<AvailabilityCheck> {
    try {
      const response = await ApiService.post<AvailabilityCheck>(
        `${API_CONFIG.SERVICES.AUTH}/check-availability`,
        { email, phone }
      );
      return response;
    } catch (error: any) {
      // 409 means conflict (already exists) - extract the data from the error
      if (error?.status === 409 && error?.data) {
        // The backend response is inside error.data
        return {
          success: false,
          available: false,
          errors: error.data.errors
        };
      }
      throw error;
    }
  }

  // Register new user - create using Firebase, then notify backend
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log('[AuthService] Registering via Firebase with data:', { ...data, password: '***' });

      // Create user in Firebase
      const userCredential = await firebaseAuth.createUser(data.email, data.password);

      // Get Firebase ID token
      const firebaseToken = await userCredential.user.getIdToken();

      // Send firebaseToken and additional profile data to backend
      const payload: any = {
        firebaseToken,
        phone: data.phone,
        firstName: data.firstName,
        lastName: data.lastName,
        studentId: data.studentId,
      };
      if (data.university) payload.university = data.university;
      if (data.referralCode) payload.referralCode = data.referralCode;

      const response = await ApiService.post<any>(`${API_CONFIG.SERVICES.AUTH}/firebase/register`, payload);

      if (response.success && response.data.accessToken) {
        const normalizedResponse = {
          ...response,
          data: {
            user: response.data.user,
            tokens: {
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken
            }
          }
        };
        await this.saveAuthData(normalizedResponse.data);
        return normalizedResponse;
      }
      return response;
    } catch (error) {
      console.error('[AuthService] Registration failed:', error);
      throw error;
    }
  }

  // Verify Email OTP
  async verifyEmailOTP(email: string, otp: string): Promise<AuthResponse> {
    try {
      const response = await ApiService.post<any>(
        `${API_CONFIG.SERVICES.AUTH}/verify-email-otp`,
        { email, otp }
      );
      
      if (response.success && response.data.accessToken) {
        const normalizedResponse = {
          ...response,
          data: {
            user: response.data.user,
            tokens: {
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken
            }
          }
        };
        await this.saveAuthData(normalizedResponse.data);
        return normalizedResponse;
      }
      
      return response;
    } catch (error) {
      console.error('[AuthService] Email verification failed:', error);
      throw error;
    }
  }

  // Login with email and password - use Firebase first then send token to backend
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      let firebaseToken = data.firebaseToken;

      if (!firebaseToken) {
        if (!data.email || !data.password) throw new Error('Email and password required');

        // Sign in via Firebase SDK
        const userCredential = await firebaseAuth.signIn(data.email, data.password);
        firebaseToken = await userCredential.user.getIdToken();
      }

      // Send token only to backend
      const response = await ApiService.post<any>(
        `${API_CONFIG.SERVICES.AUTH}/firebase/login`,
        { firebaseToken }
      );

      if (response.success && response.data.accessToken) {
        const normalizedResponse = {
          ...response,
          data: {
            user: response.data.user,
            tokens: {
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken
            }
          }
        };
        await this.saveAuthData(normalizedResponse.data);
        return normalizedResponse;
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
      // Clear invalid tokens on refresh failure
      await this.clearAuthData();
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      console.log('[AuthService] Logging out with refreshToken:', refreshToken ? 'present' : 'null');

      if (refreshToken) {
        // Make direct request without auth header since logout is public
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.SERVICES.AUTH}/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        console.log('[AuthService] Logout response status:', response.status);
        if (!response.ok) {
          console.warn('[AuthService] Logout request failed with status:', response.status);
        }
      } else {
        console.log('[AuthService] No refresh token found, skipping server logout');
      }
    } catch (error) {
      console.error('[AuthService] Logout request failed:', error);
    } finally {
      console.log('[AuthService] Clearing local auth data');
      // Sign out from Firebase as well
      try {
        await firebaseAuth.signOut();
      } catch (err) {
        console.warn('[AuthService] Failed to sign out from Firebase:', err);
      }
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

  // Public method to force clear all auth data (for debugging/recovery)
  async forceClearAuthData(): Promise<void> {
    console.log('[AuthService] Forcing clear of all auth data');
    await this.clearAuthData();
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
      if (!token) return false;
      
      // Try to decode the token to check if it's expired
      try {
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        
        // Decode the payload (second part)
        const payload = JSON.parse(atob(parts[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        // If token is expired, clear it and return false
        if (payload.exp && payload.exp < currentTime) {
          console.log('[AuthService] Token is expired, clearing auth data');
          await this.clearAuthData();
          return false;
        }
        
        return true;
      } catch (decodeError) {
        console.warn('[AuthService] Failed to decode token:', decodeError);
        // If we can't decode it, it's probably invalid
        await this.clearAuthData();
        return false;
      }
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

  // Send password reset email
  async sendPasswordResetEmail(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Use Firebase to send password reset email instead of backend
      await firebaseAuth.sendPasswordResetEmail(email);
      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      console.error('[AuthService] Send password reset email failed:', error);
      throw error;
    }
  }

  // Verify password reset code
  async verifyPasswordResetCode(email: string, code: string): Promise<{ success: boolean; message: string }> {
    // Deprecated: password reset flows are handled by Firebase. Verify codes are not used.
    throw new Error('verifyPasswordResetCode is no longer supported. Use Firebase password reset flow.');
  }

  // Reset password with code
  async resetPassword(email: string, code: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    // Deprecated: password reset flows are handled by Firebase. This endpoint is unsupported.
    throw new Error('resetPassword is no longer supported. Use Firebase password reset flow.');
  }

  // Firebase Auth: Register with Firebase token
  async firebaseRegister(data: {
    firebaseToken: string;
    phone: string;
    firstName: string;
    lastName: string;
    studentId: string;
    university?: string;
    referralCode?: string;
  }): Promise<AuthResponse> {
    try {
      console.log('[AuthService] Firebase registering...');
      const response = await ApiService.post<any>(
        `${API_CONFIG.SERVICES.AUTH}/firebase/register`,
        data
      );
      
      console.log('[AuthService] Firebase registration response:', response);
      
      if (response.success && response.data.accessToken) {
        const normalizedResponse = {
          ...response,
          data: {
            user: response.data.user,
            tokens: {
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken
            }
          }
        };
        await this.saveAuthData(normalizedResponse.data);
        console.log('[AuthService] Firebase registration successful, tokens saved');
        return normalizedResponse;
      }
      
      return response;
    } catch (error) {
      console.error('[AuthService] Firebase registration failed:', error);
      throw error;
    }
  }

  // Firebase Auth: Login with Firebase token
  async firebaseLogin(firebaseToken: string): Promise<AuthResponse> {
    try {
      console.log('[AuthService] Firebase login...');
      const response = await ApiService.post<any>(
        `${API_CONFIG.SERVICES.AUTH}/firebase/login`,
        { firebaseToken }
      );
      
      if (response.success && response.data.accessToken) {
        const normalizedResponse = {
          ...response,
          data: {
            user: response.data.user,
            tokens: {
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken
            }
          }
        };
        await this.saveAuthData(normalizedResponse.data);
        console.log('[AuthService] Firebase login successful');
        return normalizedResponse;
      }
      
      return response;
    } catch (error) {
      console.error('[AuthService] Firebase login failed:', error);
      throw error;
    }
  }

  // Firebase Auth: Check email verification status
  async checkFirebaseVerification(firebaseToken: string): Promise<{ success: boolean; email: string; emailVerified: boolean }> {
    try {
      return await ApiService.post(`${API_CONFIG.SERVICES.AUTH}/firebase/check-verification`, { firebaseToken });
    } catch (error) {
      console.error('[AuthService] Check Firebase verification failed:', error);
      throw error;
    }
  }
}

export default new AuthService();
