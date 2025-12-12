import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import { User } from '@/mocks/users';

// Define a simple notification type
export interface Notification {
  id: string;
  message: string;
  read: boolean;
}

interface AppState {
  isLoading: boolean;
  isOnboarded: boolean;
  isAuthenticated: boolean;
  currentUser: User | null;
  isDriverMode: boolean;
  notifications: Notification[]; // Add notifications
}

interface AppContextType extends AppState {
  setOnboarded: (value: boolean) => void;
  login: (user: User) => void;
  logout: () => void;
  toggleDriverMode: () => void;
  updateUser: (user: User) => void;
}

const STORAGE_KEYS = {
  ONBOARDED: '@ryden_onboarded',
  USER: '@ryden_user',
  DRIVER_MODE: '@ryden_driver_mode',
};

export const [AppProvider, useApp] = createContextHook<AppContextType>(() => {
  const [appState, setAppState] = useState<AppState>({
    isLoading: true,
    isOnboarded: false,
    isAuthenticated: false,
    currentUser: null,
    isDriverMode: false,
    notifications: [], // Initialize as an empty array
  });

  useEffect(() => {
    loadInitialState();
  }, []);

  const loadInitialState = async () => {
    try {
      // For development: reset onboarding status on each app start
      await AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDED);

      const [onboarded, userStr, driverMode] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDED),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.DRIVER_MODE),
      ]);

      // Mock some notifications for testing
      const mockNotifications: Notification[] = [
        { id: '1', message: 'Your ride is arriving in 5 minutes.', read: false },
        { id: '2', message: 'You have a new 20% discount coupon!', read: false },
        { id: '3', message: 'Welcome to Ryden! Complete your profile to get started.', read: true },
      ];

      setAppState({
        isLoading: false,
        isOnboarded: onboarded === 'true',
        isAuthenticated: !!userStr,
        currentUser: userStr ? JSON.parse(userStr) : null,
        isDriverMode: driverMode === 'true',
        notifications: mockNotifications, // Set mock notifications
      });
    } catch (error) {
      console.error('Failed to load app state:', error);
      setAppState((prev) => ({ ...prev, isLoading: false, notifications: [] })); // ensure notifications is an array on error
    }
  };

  const setOnboarded = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, value.toString());
      setAppState((prev) => ({ ...prev, isOnboarded: value }));
    } catch (error) {
      console.error('Failed to set onboarded:', error);
    }
  };

  const login = async (user: User) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      setAppState((prev) => ({
        ...prev,
        isAuthenticated: true,
        currentUser: user,
      }));
    } catch (error) {
      console.error('Failed to login:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.USER, STORAGE_KEYS.DRIVER_MODE]);
      setAppState((prev) => ({
        ...prev,
        isAuthenticated: false,
        currentUser: null,
        isDriverMode: false,
      }));
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const toggleDriverMode = async () => {
    try {
      const newMode = !appState.isDriverMode;
      await AsyncStorage.setItem(STORAGE_KEYS.DRIVER_MODE, newMode.toString());
      setAppState((prev) => ({ ...prev, isDriverMode: newMode }));
    } catch (error) {
      console.error('Failed to toggle driver mode:', error);
    }
  };

  const updateUser = async (user: User) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      setAppState((prev) => ({ ...prev, currentUser: user }));
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  return {
    ...appState,
    setOnboarded,
    login,
    logout,
    toggleDriverMode,
    updateUser,
  };
});
