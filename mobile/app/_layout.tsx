import 'fast-text-encoding';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useWalletStore } from '@/lib/wallet-store';
import { testSuiConnection } from '@/lib/sui-client';
import { COLORS } from '@/constants/theme';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 30_000 } },
});

function RootLayoutInner() {
  const { loadFromStorage } = useWalletStore();

  useEffect(() => {
    loadFromStorage()
      .catch((e) => {
        console.warn('[Layout] Wallet state restore failed:', e);
        useWalletStore.setState({ address: null, isConnected: false });
      })
      .finally(() => {
        useWalletStore.setState({ isLoading: false });
      });

    testSuiConnection().then((ok) => {
      if (!ok) {
        console.error('[Layout] Sui RPC is not reachable.');
      }
    });
  }, [loadFromStorage]);

  return (
    <>
      <StatusBar style="light" backgroundColor={COLORS.background} />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 48,
          left: 16,
          zIndex: 9999,
          backgroundColor: '#ff4d6d',
          paddingHorizontal: 10,
          paddingVertical: 6,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '800' }}>DEBUG ROOT RENDERED</Text>
      </View>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="contracts/[id]" />
        <Stack.Screen name="contracts/new" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutInner />
    </QueryClientProvider>
  );
}
