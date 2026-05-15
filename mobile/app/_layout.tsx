/**
 * Root Layout — app/_layout.tsx
 * Polyfill'ler index.js entry point'te çalıştırılıyor.
 */

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useWalletStore } from '@/lib/wallet-store';
import { restoreZkLoginSession } from '@/lib/zklogin';
import { COLORS } from '@/constants/theme';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 30_000 } },
});

function RootLayoutInner() {
  const { loadFromStorage, setAddress } = useWalletStore();

  useEffect(() => {
    (async () => {
      try {
        await loadFromStorage();
        const address = await restoreZkLoginSession();
        if (address) {
          await setAddress(address);
        }
      } catch (e) {
        console.warn('[Layout] Session restore başarısız:', e);
        // Hata olursa isLoading:false yaparak login'e yönlendir
        useWalletStore.setState({ isLoading: false });
      }
    })();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor={COLORS.background} />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="contract/[id]" />
        <Stack.Screen name="contract/new" />
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
