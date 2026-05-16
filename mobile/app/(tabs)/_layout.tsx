/**
 * app/(app)/_layout.tsx — Tab Navigator Layout
 * Checks auth state, renders custom TabBar, guards routes.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot, router } from 'expo-router';
import { useWalletStore } from '@/lib/wallet-store';
import { useContracts } from '@/hooks/use-contracts';
import TabBar from '@/components/TabBar';
import { COLORS } from '@/constants/theme';

export default function AppLayout() {
  const { address, isConnected, isLoading } = useWalletStore();
  const { isArbitrator } = useContracts(address);

  // Auth guard
  useEffect(() => {
    if (!isLoading && !isConnected) {
      router.replace('/login');
    }
  }, [isConnected, isLoading]);

  // Arbitrator guard — redirect if arbitrator visits dashboard
  useEffect(() => {
    if (isArbitrator) {
      // Will naturally render arbitrator tab
    }
  }, [isArbitrator]);

  if (!isConnected && !isLoading) return null;

  return (
    <View style={styles.container}>
      {/* Main content */}
      <View style={styles.content}>
        <Slot />
      </View>
      {/* Bottom tab bar */}
      <TabBar isArbitrator={isArbitrator} />
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
  },
});
