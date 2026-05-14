/**
 * Root Layout — app/_layout.tsx
 *
 * 1. Polyfills (must be first imports)
 * 2. Wallet store initialization
 * 3. Deep link listener (Slush Wallet callbacks)
 * 4. Navigation stack setup
 */

// ===== POLYFILLS (order matters!) =====
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useWalletStore } from '@/lib/wallet-store';
import {
  isConnectCallback,
  isSignCallback,
  parseConnectCallback,
  parseSignCallback,
} from '@/lib/slush-wallet';
import { COLORS } from '@/constants/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
    },
  },
});

function RootLayoutInner() {
  const { setAddress, loadFromStorage } = useWalletStore();

  // Load persisted session on app start
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Handle deep links from Slush Wallet
  useEffect(() => {
    const handleUrl = ({ url }: { url: string }) => {
      if (!url) return;

      if (isConnectCallback(url)) {
        // Slush Wallet returned address after connect
        const address = parseConnectCallback(url);
        if (address) {
          setAddress(address);
        }
      } else if (isSignCallback(url)) {
        // Slush Wallet completed transaction signing
        const result = parseSignCallback(url);
        if (result.success) {
          console.log('[WorkSeal] TX signed, digest:', result.digest);
          // Screens listen to app focus to refetch data
        } else {
          console.error('[WorkSeal] TX signing failed:', result.error);
        }
      }
    };

    // Handle URL that opened the app (cold start)
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    // Handle URL while app is foregrounded
    const subscription = Linking.addEventListener('url', handleUrl);
    return () => subscription.remove();
  }, [setAddress]);

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
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
