// User Service - Handles profile management, emergency contacts, stats
import { API_CONFIG } from '@/config/api.config';
import ApiService from './api.service';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  university?: string;
  studentId?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface UserStats {
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  totalSpent: number;
  totalEarned: number;
  rating: number;
}

export interface UserProfile {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: string;
  studentId?: string;
  university?: string;
  profileImageUrl?: string;
  isVerified: boolean;
  rating: number;
  totalRides: number;
}

class UserService {
  // Get current user's profile
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await ApiService.get<any>(`${API_CONFIG.SERVICES.USER}/profile`);
      return response.data || response;
    } catch (error) {
      console.error('[UserService] Get profile failed:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    try {
      const response = await ApiService.put<any>(`${API_CONFIG.SERVICES.USER}/profile`, data);
      return response.data || response;
    } catch (error) {
      console.error('[UserService] Update profile failed:', error);
      throw error;
    }
  }

  // Upload profile picture
  async uploadAvatar(file: any): Promise<{ success: boolean; imageUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      return await ApiService.upload(`${API_CONFIG.SERVICES.USER}/upload-avatar`, formData);
    } catch (error) {
      console.error('[UserService] Upload avatar failed:', error);
      throw error;
    }
  }

  // Get emergency contacts
  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    try {
      const response = await ApiService.get<any>(`${API_CONFIG.SERVICES.USER}/emergency-contacts`);
      return response.data || response || [];
    } catch (error) {
      console.error('[UserService] Get emergency contacts failed:', error);
      throw error;
    }
  }

  // Add emergency contact
  async addEmergencyContact(data: Omit<EmergencyContact, 'id'>): Promise<EmergencyContact> {
    try {
      const response = await ApiService.post<any>(`${API_CONFIG.SERVICES.USER}/emergency-contact`, data);
      return response.data || response;
    } catch (error) {
      console.error('[UserService] Add emergency contact failed:', error);
      throw error;
    }
  }

  // Delete emergency contact
  async deleteEmergencyContact(contactId: string): Promise<void> {
    try {
      await ApiService.delete(`${API_CONFIG.SERVICES.USER}/emergency-contact/${contactId}`);
    } catch (error) {
      console.error('[UserService] Delete emergency contact failed:', error);
      throw error;
    }
  }

  // Get user statistics
  async getStats(): Promise<UserStats> {
    try {
      const response = await ApiService.get<any>(`${API_CONFIG.SERVICES.USER}/stats`);
      return response.data || response;
    } catch (error) {
      console.error('[UserService] Get stats failed:', error);
      throw error;
    }
  }

  // Create driver profile (for riders wanting to become drivers)
  async createDriverProfile(vehicleInfo: {
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
  }): Promise<any> {
    try {
      const response = await ApiService.post<any>(`${API_CONFIG.SERVICES.USER}/driver-profile`, vehicleInfo);
      return response.data || response;
    } catch (error) {
      console.error('[UserService] Create driver profile failed:', error);
      throw error;
    }
  }
}

export default new UserService();
