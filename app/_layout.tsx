import "react-native-gesture-handler";
import "../global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, usePathname, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useSessionStore } from "../store/useSessionStore";

/** Mantém o splash nativo (app.json) até o JS estar pronto; não afeta o “Downloading…” do Expo Go. */
void SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

function AuthNavigationGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { isHydrated, accessToken } = useSessionStore((s) => ({
    isHydrated: s.isHydrated,
    accessToken: s.accessToken,
  }));

  useEffect(() => {
    if (!isHydrated) return;

    const inAuthGroup = pathname.startsWith("/(auth)");
    if (!accessToken && !inAuthGroup) {
      router.replace("/(auth)/login");
      return;
    }
    if (accessToken && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [accessToken, isHydrated, pathname, router]);

  return null;
}

function SessionBootstrap() {
  const hydrateFromSecureStore = useSessionStore(
    (s) => s.hydrateFromSecureStore,
  );
  useEffect(() => {
    void (async () => {
      try {
        await hydrateFromSecureStore();
      } finally {
        await SplashScreen.hideAsync().catch(() => {});
      }
    })();
  }, [hydrateFromSecureStore]);
  return null;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <SessionBootstrap />
          <AuthNavigationGuard />
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "fade",
              animationDuration: 220,
            }}
          />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
