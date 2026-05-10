import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import { Buffer } from "buffer";
global.Buffer = Buffer;

import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useWalletStore } from "../hooks/use-wallet-store";
import { ActivityIndicator, View } from "react-native";
import { COLORS } from "../constants/colors";
import * as Linking from "expo-linking";
import { StatusBar } from "expo-status-bar";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <StatusBar style="light" />
    </QueryClientProvider>
  );
}

function AppContent() {
  const { isConnected, initSession, login } = useWalletStore();
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  // Initialize session
  useEffect(() => {
    initSession().then(() => setIsReady(true));
  }, []);

  // Deep link listener
  useEffect(() => {
    const subscription = Linking.addEventListener("url", (event) => {
      const { path, queryParams } = Linking.parse(event.url);
      if (queryParams?.status === "success" && queryParams?.address) {
        login(queryParams.address as string);
        router.replace("/(tabs)");
      }
    });

    return () => subscription.remove();
  }, []);

  // Auth Guard
  useEffect(() => {
    if (!isReady) return;

    const inTabsGroup = segments[0] === "(tabs)";

    if (isConnected && !inTabsGroup) {
      router.replace("/(tabs)");
    } else if (!isConnected && inTabsGroup) {
      router.replace("/login");
    }
  }, [isConnected, isReady, segments]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="login" options={{ gestureEnabled: false }} />
      <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      <Stack.Screen 
        name="contracts/new" 
        options={{ 
          presentation: "modal", 
          headerShown: true, 
          headerTitle: "Yeni Sözleşme",
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.foreground
        }} 
      />
      <Stack.Screen 
        name="contracts/[id]" 
        options={{ 
          headerShown: true, 
          headerTitle: "Sözleşme Detayı",
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.foreground,
          headerBackTitle: "Geri"
        }} 
      />
    </Stack>
  );
}
