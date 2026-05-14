/**
 * app/index.tsx — Splash / Landing
 * Checks wallet connection state and redirects accordingly.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useWalletStore } from '@/lib/wallet-store';
import { COLORS, FONTS } from '@/constants/theme';
import AppBackground from '@/components/AppBackground';

export default function IndexScreen() {
  const { isConnected, isLoading } = useWalletStore();

  useEffect(() => {
    if (isLoading) return;
    if (isConnected) {
      router.replace('/(app)/dashboard');
    } else {
      router.replace('/login');
    }
  }, [isConnected, isLoading]);

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
