// Auth Context - Global authentication state management
import AuthService, { LoginData, RegisterData, UserData } from '@/services/auth.service';
import WebSocketService from '@/services/websocket.service';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<UserData>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isAuth = await AuthService.isAuthenticated();
      if (isAuth) {
        const userData = await AuthService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
        
        // Connect to WebSocket for real-time updates
        await WebSocketService.connect();
      }
    } catch (error) {
      console.error('[AuthContext] Error checking auth status:', error);
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
        
        // Connect to WebSocket
        await WebSocketService.connect();
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
        
        // Connect to WebSocket
        await WebSocketService.connect();
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
      setIsLoading(true);
      await AuthService.logout();
      
      // Disconnect WebSocket
      WebSocketService.disconnect();
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: Partial<UserData>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
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
