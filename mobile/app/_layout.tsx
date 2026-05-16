/**
 * Root Layout — app/_layout.tsx
 * Polyfill'ler index.js entry point'te çalıştırılıyor.
 */

import 'fast-text-encoding';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useWalletStore } from '@/lib/wallet-store';
import { restoreZkLoginSession } from '@/lib/zklogin';
import { testSuiConnection } from '@/lib/sui-client';
import { COLORS } from '@/constants/theme';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 30_000 } },
});

function RootLayoutInner() {
  const { loadFromStorage, setAddress, disconnect } = useWalletStore();

  useEffect(() => {
    (async () => {
      const ok = await testSuiConnection();
      if (!ok) {
        console.error('[Layout] Sui RPC erişilemiyor!');
      }

      try {
        await loadFromStorage();
        const address = await restoreZkLoginSession();
        if (address) {
          await setAddress(address);
        } else {
          await disconnect();
        }
      } catch (e) {
        console.warn('[Layout] Session restore başarısız:', e);
        await disconnect();
      } finally {
        useWalletStore.setState({ isLoading: false });
        await SplashScreen.hideAsync().catch(() => {});
      }
    })();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor={COLORS.background} />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="contracts/[id]" />
        <Stack.Screen name="contracts/new" />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutInner />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
});
