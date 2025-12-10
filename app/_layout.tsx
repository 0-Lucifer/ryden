import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { RideProvider } from '@/context/RideContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export const unstable_settings = {
  initialRouteName: 'welcome',
};

function RootLayoutNav() {
  const { isAuthenticated, isLoading, pendingVerification } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (isLoading) {
      console.log('[Layout] Still loading auth state, waiting...');
      return;
    }

    console.log('[Layout] Auth check complete. isAuthenticated:', isAuthenticated, 'pendingVerification:', pendingVerification, 'Current route:', segments?.[0]);

    const protectedRoutes = ['(tabs)', 'find-ride', 'offer-ride'];
    const publicRoutes = ['welcome', 'login', 'signup'];

    const delayedRedirect = (path: string) => {
      setTimeout(() => {
        router.replace(path);
      }, 500);
    };

    const isOnLogin = segments[0] === 'login' || router.pathname === '/login';
    // Extra guard: If already on login, do nothing to preserve state
    if (isOnLogin) {
      return;
    }
    if (!isAuthenticated && protectedRoutes.includes(segments[0])) {
      // Redirect to login if trying to access protected routes and not authenticated
      console.log('[Layout] Not authenticated but in protected route, redirecting to login');
      delayedRedirect('/login');
    } else if (!isAuthenticated && !segments[0]) {
      // On initial load with no auth, go to login
      console.log('[Layout] Initial load, no auth, going to login');
      delayedRedirect('/login');
    } else if (isAuthenticated && !pendingVerification && publicRoutes.includes(segments[0])) {
      // Redirect to home if already authenticated (but not if pending verification)
      console.log('[Layout] Authenticated, redirecting to home');
      delayedRedirect('/(tabs)');
    } else if (isAuthenticated && pendingVerification && segments[0] !== 'signup') {
      // If pending verification and not on signup page, redirecting to signup to show verification modal
      console.log('[Layout] Authenticated but pending verification, redirecting to signup');
      delayedRedirect('/signup');
    }
  }, [isAuthenticated, segments, isLoading, pendingVerification]);

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      </ThemeProvider>
    );
  }

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
