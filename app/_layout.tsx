import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { RideProvider } from '@/context/RideContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect } from 'react';

export const unstable_settings = {
  initialRouteName: 'welcome',
};

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(tabs)' || segments[0] === 'find-ride' || segments[0] === 'offer-ride';

    if (!isAuthenticated && inAuthGroup) {
      // Redirect to login if trying to access protected routes
      router.replace('/welcome');
    } else if (isAuthenticated && (segments[0] === 'welcome' || segments[0] === 'login' || segments[0] === 'signup')) {
      // Redirect to home if already authenticated
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isLoading]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="find-ride" options={{ title: 'Find a Ride' }} />
        <Stack.Screen name="offer-ride" options={{ title: 'Offer a Ride' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RideProvider>
        <RootLayoutNav />
      </RideProvider>
    </AuthProvider>
  );
}
