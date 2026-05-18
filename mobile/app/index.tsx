/**
 * app/index.tsx — Splash / Landing
 * Checks wallet connection state and redirects accordingly.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useRootNavigationState } from 'expo-router';
import { useWalletStore } from '@/lib/wallet-store';
import { COLORS, FONTS } from '@/constants/theme';
import AppBackground from '@/components/AppBackground';

export default function IndexScreen() {
  const rootNavigationState = useRootNavigationState();
  const { isConnected, isLoading } = useWalletStore();

  useEffect(() => {
    if (!rootNavigationState?.key || isLoading) return;

    const timer = setTimeout(() => {
      if (isConnected) {
        router.replace('/(tabs)/escrow');
      } else {
        router.replace('/login');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isConnected, isLoading, rootNavigationState?.key]);

  return (
    <View style={styles.container}>
      <AppBackground />
      <View style={styles.content}>
        <Text style={styles.logo}>
          Work<Text style={styles.logoAccent}>Seal</Text>
        </Text>
        <ActivityIndicator color={COLORS.primary} size="small" style={{ marginTop: 32 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontFamily: FONTS.sans,
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.foreground,
    letterSpacing: -1,
  },
  logoAccent: {
    color: COLORS.primary,
  },
});
