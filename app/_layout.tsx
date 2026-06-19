import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const useProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const inTabsGroup = segments[0] === "(tabs)";

    if (!isAuthenticated && inTabsGroup) {
      router.replace("/login");
    } else if (isAuthenticated && !inTabsGroup) {
      const isAuthPage = segments.includes("login") || segments.includes("signup") || segments.includes("welcome");
      if(isAuthPage) {
        router.replace("/(tabs)");
      }
    }
  }, [isAuthenticated, isLoading, segments]);
};

function RootLayoutNav() {
  useProtectedRoute();

  return (
    <Stack initialRouteName="splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="find-ride" />
      <Stack.Screen name="offer-ride" />
      <Stack.Screen name="booking-confirm" />
      <Stack.Screen name="active-ride" />
      <Stack.Screen name="group-ride" />
      <Stack.Screen name="create-group-ride" />

    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AuthProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </AuthProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}
