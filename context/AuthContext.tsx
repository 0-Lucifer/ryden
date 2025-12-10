// Auth Context - Global authentication state management
import AuthService, { LoginData, RegisterData, UserData } from '@/services/auth.service';
import UserService from '@/services/user.service';
import WebSocketService from '@/services/websocket.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  pendingVerification: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<UserData>) => Promise<void>;
  clearPendingVerification: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isAuth = await AuthService.isAuthenticated();
      console.log('[AuthContext] Checking auth status, isAuth:', isAuth);
      if (isAuth) {
        // Validate session with backend to ensure user still exists and token is valid
        const validatedUser = await AuthService.validateSession();
        
        if (validatedUser) {
          setUser(validatedUser);
          setIsAuthenticated(true);
          
          // Check if user is verified
          if (!validatedUser.isVerified) {
            console.log('[AuthContext] User not verified, setting pendingVerification');
            setPendingVerification(true);
          }
          
          console.log('[AuthContext] User validated with backend:', validatedUser.email);
          
          // Connect to WebSocket in background
          WebSocketService.connect().catch(err => {
            console.warn('[AuthContext] WebSocket connection failed:', err?.message || err);
          });
        } else {
          // Token exists but backend rejected it (or user deleted) - clear everything
          console.log('[AuthContext] Token invalid or user deleted, clearing auth');
          await AuthService.logout();
          setIsAuthenticated(false);
          setUser(null);
          setPendingVerification(false);
        }
      } else {
        console.log('[AuthContext] No auth token found');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('[AuthContext] Error checking auth status:', error);
      await AuthService.logout();
      setIsAuthenticated(false);
      setUser(null);
      setPendingVerification(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    try {
      setIsLoading(true);
      const response = await AuthService.login(data);
      
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // Connect to WebSocket in background (don't block on it)
        WebSocketService.connect().catch(err => {
          console.warn('[AuthContext] WebSocket connection failed after login:', err?.message || err);
        });
      }
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await AuthService.register(data);
      
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        setPendingVerification(true); // Set pending verification to prevent auto-redirect
        
        // Connect to WebSocket in background (don't block on it)
        WebSocketService.connect().catch(err => {
          console.warn('[AuthContext] WebSocket connection failed after register:', err?.message || err);
        });
      }
    } catch (error) {
      console.error('[AuthContext] Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('[AuthContext] Starting logout process');
      setIsLoading(true);
      await AuthService.logout();

      // Disconnect WebSocket
      WebSocketService.disconnect();

      console.log('[AuthContext] Clearing user state');
      setUser(null);
      setIsAuthenticated(false);
      console.log('[AuthContext] Logout completed successfully');
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<UserData>) => {
    try {
      // Call backend to update profile
      const updatedProfile = await UserService.updateProfile({
        firstName: userData.firstName,
        lastName: userData.lastName,
        university: userData.university,
        studentId: userData.studentId,
      });
      
      // Merge updated data with current user
      const updatedUser = { ...user, ...updatedProfile } as UserData;
      setUser(updatedUser);
      
      // Persist to AsyncStorage
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
      console.log('[AuthContext] User profile updated successfully');
    } catch (error) {
      console.error('[AuthContext] Update user failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        pendingVerification,
        login,
        register,
        logout,
        updateUser,
        clearPendingVerification: () => setPendingVerification(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
