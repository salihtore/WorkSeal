import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking
} from 'react-native';
import { useWalletStore } from '@/hooks/use-wallet-store';
import { useContracts } from '@/hooks/use-contracts';
import { getSuiBalance } from '@/lib/sui-client';
import { useState, useEffect } from 'react';

const NETWORK_LABELS = {
  mainnet: 'MAINNET',
  testnet: 'TESTNET',
  devnet: 'DEVNET',
} as const;

const NETWORKS = ['mainnet', 'testnet', 'devnet'] as const;

export default function ProfileScreen() {
  const { address, isConnected, network, setNetwork, setAddress, logout } = useWalletStore();
  const { contracts } = useContracts();
  const [balance, setBalance] = useState<string>('0.00');

  useEffect(() => {
    if (isConnected && address) {
      getSuiBalance(address, network)
        .then(res => {
          const sui = Number(res.totalBalance) / 1_000_000_000;
          setBalance(sui.toFixed(2));
        })
        .catch(err => console.error('Error fetching balance:', err));
    }
  }, [address, isConnected, network]);

  const handleMockConnect = () => {
    setAddress('0x76543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba98');
  };

  const openExplorer = () => {
    if (!address) return;
    const base = network === 'mainnet'
      ? 'https://suiscan.xyz/mainnet/account/'
      : `https://suiscan.xyz/${network}/account/`;
    Linking.openURL(base + address);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>PROFILE</Text>
        <Text style={styles.title}>Wallet{'\n'}<Text style={styles.titleDim}>Identity</Text></Text>
      </View>

      {/* Wallet Card */}
      <View style={styles.walletCard}>
        <View style={styles.walletCardInner}>
          <View style={styles.shieldBadge}>
            <Text style={styles.shieldIcon}>◈</Text>
          </View>
          <Text style={styles.walletLabel}>SUI ADDRESS</Text>
          {isConnected && address ? (
            <>
              <Text style={styles.address}>{address.slice(0, 12)}</Text>
              <Text style={styles.address}>{address.slice(12, 26)}</Text>
              <Text style={styles.address}>{address.slice(-10)}</Text>
              <TouchableOpacity style={styles.explorerBtn} onPress={openExplorer}>
                <Text style={styles.explorerBtnText}>VIEW ON SUISCAN →</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.notConnected}>NOT CONNECTED</Text>
              <TouchableOpacity style={styles.connectBtn} onPress={handleMockConnect}>
                <Text style={styles.connectBtnText}>CONNECT WALLET</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Stats */}
      {isConnected && (
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{contracts.length}</Text>
            <Text style={styles.statLabel}>CONTRACTS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>DISPUTES</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{balance}</Text>
            <Text style={styles.statLabel}>SUI BALANCE</Text>
          </View>
        </View>
      )}

      {/* Network Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>NETWORK</Text>
        <View style={styles.networkRow}>
          {NETWORKS.map(n => (
            <TouchableOpacity
              key={n}
              onPress={() => setNetwork(n)}
              style={[styles.networkBtn, network === n && styles.networkBtnActive]}
            >
              <Text style={[styles.networkBtnText, network === n && styles.networkBtnTextActive]}>
                {NETWORK_LABELS[n]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>VERSION</Text>
            <Text style={styles.infoVal}>1.0.0</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>NETWORK</Text>
            <Text style={[styles.infoVal, { color: '#4FC3F7' }]}>{NETWORK_LABELS[network]}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>CHAIN</Text>
            <Text style={styles.infoVal}>SUI BLOCKCHAIN</Text>
          </View>
        </View>
      </View>

      {/* Disconnect */}
      {isConnected && (
        <TouchableOpacity style={styles.disconnectBtn} onPress={logout}>
          <Text style={styles.disconnectText}>DISCONNECT WALLET</Text>
        </TouchableOpacity>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050810' },
  content: { paddingBottom: 100 },
  header: {
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 24, paddingTop: 64, paddingBottom: 24,
  },
  headerLabel: {
    fontFamily: 'monospace', fontSize: 10, letterSpacing: 2,
    color: 'rgba(79,195,247,0.7)', marginBottom: 12,
  },
  title: { fontSize: 40, fontWeight: '900', color: '#F0F6FF', lineHeight: 44 },
  titleDim: { color: 'rgba(240,246,255,0.3)' },

  walletCard: {
    marginHorizontal: 24, marginTop: 24,
    borderWidth: 1, borderColor: 'rgba(79,195,247,0.3)',
    backgroundColor: 'rgba(79,195,247,0.04)',
  },
  walletCardInner: { padding: 24, alignItems: 'center' },
  shieldBadge: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(79,195,247,0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  shieldIcon: { fontSize: 24, color: '#4FC3F7' },
  walletLabel: {
    fontFamily: 'monospace', fontSize: 9, letterSpacing: 2,
    color: 'rgba(255,255,255,0.4)', marginBottom: 12,
  },
  address: {
    fontFamily: 'monospace', fontSize: 13,
    color: '#F0F6FF', letterSpacing: 1,
  },
  notConnected: {
    fontFamily: 'monospace', fontSize: 12, letterSpacing: 2,
    color: 'rgba(255,255,255,0.3)', marginBottom: 20,
  },
  connectBtn: {
    backgroundColor: '#4FC3F7', paddingHorizontal: 32, paddingVertical: 12, marginTop: 20,
  },
  connectBtnText: { color: '#050810', fontFamily: 'monospace', fontWeight: '900', fontSize: 12, letterSpacing: 1 },
  explorerBtn: {
    borderWidth: 1, borderColor: 'rgba(79,195,247,0.3)',
    paddingHorizontal: 20, paddingVertical: 8, marginTop: 16,
  },
  explorerBtnText: { fontFamily: 'monospace', fontSize: 10, color: '#4FC3F7', letterSpacing: 1 },

  statsGrid: {
    flexDirection: 'row', marginHorizontal: 24, marginTop: 16, gap: 1,
  },
  statCard: {
    flex: 1, backgroundColor: '#0d1117',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    padding: 16, alignItems: 'center',
  },
  statValue: { fontSize: 24, fontWeight: '900', color: '#F0F6FF', fontFamily: 'monospace' },
  statLabel: { fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: 1, marginTop: 4, fontFamily: 'monospace' },

  section: { marginHorizontal: 24, marginTop: 24 },
  sectionLabel: {
    fontFamily: 'monospace', fontSize: 9, letterSpacing: 2,
    color: 'rgba(255,255,255,0.4)', marginBottom: 12,
  },
  networkRow: { flexDirection: 'row', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  networkBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.08)' },
  networkBtnActive: { backgroundColor: '#4FC3F7' },
  networkBtnText: { fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 1 },
  networkBtnTextActive: { color: '#050810', fontWeight: '900' },

  infoCard: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', backgroundColor: '#0d1117' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  infoDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  infoKey: { fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 1 },
  infoVal: { fontFamily: 'monospace', fontSize: 10, color: '#F0F6FF', letterSpacing: 1 },

  disconnectBtn: {
    marginHorizontal: 24, marginTop: 24,
    borderWidth: 1, borderColor: 'rgba(248,113,113,0.4)',
    padding: 14, alignItems: 'center',
  },
  disconnectText: { fontFamily: 'monospace', fontSize: 11, color: '#F87171', letterSpacing: 1 },
});
