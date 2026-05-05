import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useWalletStore } from '@/hooks/use-wallet-store';
import { useContracts } from '@/hooks/use-contracts';
import { useRouter } from 'expo-router';
import { getSuiBalance } from '@/lib/sui-client';
import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { prepareZkLoginSession, getGoogleAuthUrl, fetchSalt, deriveAddress } from '@/lib/zklogin';

WebBrowser.maybeCompleteAuthSession();

export default function DashboardScreen() {
  const router = useRouter();
  const { address, isConnected, setAddress, logout, network } = useWalletStore();
  const { contracts, isLoading } = useContracts();
  const [balance, setBalance] = useState('0.00');
  const [authLoading, setAuthLoading] = useState(false);

  // Setup Redirect URI for Expo
  // const redirectUri = AuthSession.makeRedirectUri();

  useEffect(() => {
    if (isConnected && address) {
      getSuiBalance(address, network).then((res) => {
        const total = Number(res.totalBalance) / 1_000_000_000;
        setBalance(total.toFixed(2));
      });
    }
  }, [isConnected, address, network]);

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    console.log('Starting Google Login flow...');
    try {
      // 1. Prepare session
      const session = await prepareZkLoginSession();
      console.log('Session prepared:', session);
      
      // 2. Setup Redirect URI
      // For local web, localhost:8081 is standard.
      const redirectUri = Linking.createURL('/');
      console.log('Redirect URI:', redirectUri);

      // 3. Open Auth URL
      const authUrl = getGoogleAuthUrl(session.nonce, redirectUri);
      console.log('Auth URL:', authUrl);

      // Alert for manual debugging in browser if needed
      // alert("Opening Google Login...");

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      console.log('Auth Result:', result);

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        // id_token is usually in the hash/fragment for ZkLogin
        const hash = url.hash.replace('#', '');
        const params = new URLSearchParams(hash);
        const idToken = params.get('id_token');

        if (idToken) {
          console.log('JWT Received!');
          const salt = await fetchSalt(idToken);
          const derivedAddr = deriveAddress(idToken, salt);
          setAddress(derivedAddr);
        } else {
          Alert.alert('Auth Error', 'ID Token not found in response.');
        }
      } else if (result.type === 'cancel') {
        console.log('User cancelled login.');
      }
    } catch (error: any) {
      console.error('Detailed Login Error:', error);
      Alert.alert('Login Failed', error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>WORKSEAL</ThemedText>
          <ThemedText style={styles.subtitle}>Decentralized Work & Escrow</ThemedText>
        </View>

        <TouchableOpacity 
          style={styles.postJobBtn} 
          onPress={() => router.push('/contracts/new')}
        >
          <ThemedText style={styles.postJobBtnText}>+ POST A JOB</ThemedText>
        </TouchableOpacity>

        {isConnected && (
          <View style={styles.balanceCard}>
            <ThemedText style={styles.balanceLabel}>AVAILABLE BALANCE</ThemedText>
            <View style={styles.balanceRow}>
              <ThemedText style={styles.balanceValue}>{balance}</ThemedText>
              <ThemedText style={styles.balanceUnit}>SUI</ThemedText>
            </View>
            <View style={styles.walletBadge}>
              <ThemedText style={styles.walletAddress}>
                {address?.slice(0, 10)}...{address?.slice(-8)}
              </ThemedText>
              <TouchableOpacity onPress={logout}>
                <ThemedText style={styles.logoutText}>EXIT</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!isConnected && (
          <TouchableOpacity 
            style={styles.connectBtn} 
            onPress={handleGoogleLogin}
            disabled={authLoading}
          >
            <ThemedText style={styles.connectBtnText}>
              {authLoading ? 'AUTHORIZING...' : 'CONTINUE WITH GOOGLE'}
            </ThemedText>
          </TouchableOpacity>
        )}
        
        <View style={styles.content}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <ThemedText style={styles.statLabel}>CONTRACTS</ThemedText>
              <ThemedText style={styles.statValue}>
                {isLoading ? '...' : contracts.length}
              </ThemedText>
            </View>
            <View style={styles.statCard}>
              <ThemedText style={styles.statLabel}>IN ESCROW</ThemedText>
              <ThemedText style={styles.statValue}>0.00</ThemedText>
            </View>
          </View>

          <View style={styles.recentSection}>
            <ThemedText type="defaultSemiBold" style={styles.recentTitle}>RECENT CONTRACTS</ThemedText>
            {isLoading ? (
              <ThemedText style={styles.emptyText}>Loading...</ThemedText>
            ) : contracts.length > 0 ? (
              contracts.slice(0, 5).map((contract) => (
                <TouchableOpacity 
                  key={contract.id} 
                  style={styles.recentItem}
                  onPress={() => router.push(`/contracts/${contract.id}`)}
                >
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.recentItemTitle} numberOfLines={1}>{contract.title}</ThemedText>
                    <ThemedText style={styles.recentItemAddress}>{contract.id.slice(0, 10)}...</ThemedText>
                  </View>
                  <View style={styles.statusBadge}>
                    <ThemedText style={styles.statusText}>
                      {contract.status === 0 ? 'OPEN' : contract.status === 1 ? 'ACTIVE' : 'COMPLETED'}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <ThemedText style={styles.emptyText}>No contracts found</ThemedText>
            )}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 64,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    letterSpacing: 2,
    fontWeight: '900',
  },
  subtitle: {
    opacity: 0.6,
    fontSize: 14,
    marginTop: 4,
  },
  connectBtn: {
    backgroundColor: '#4FC3F7',
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  postJobBtn: {
    borderWidth: 1,
    borderColor: '#4FC3F7',
    padding: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  postJobBtnText: {
    color: '#4FC3F7',
    fontWeight: '900',
    letterSpacing: 1,
    fontSize: 12,
  },
  connectBtnText: {
    color: '#050810',
    fontWeight: '900',
    letterSpacing: 1,
  },
  walletInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  addressText: {
    fontFamily: 'monospace',
    fontSize: 14,
    opacity: 0.8,
  },
  balanceCard: {
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: 'rgba(79, 195, 247, 0.2)',
    padding: 24,
    marginBottom: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  balanceLabel: {
    fontFamily: 'monospace',
    fontSize: 10,
    opacity: 0.5,
    letterSpacing: 2,
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 20,
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
  },
  balanceUnit: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4FC3F7',
  },
  walletBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  walletAddress: {
    fontFamily: 'monospace',
    fontSize: 11,
    opacity: 0.4,
  },
  logoutText: {
    fontSize: 10,
    color: '#F87171',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  content: {
    gap: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0d1117',
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  statLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    opacity: 0.5,
    letterSpacing: 1.5,
    color: '#4FC3F7',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  recentSection: {
    marginTop: 24,
    gap: 12,
  },
  recentTitle: {
    fontSize: 12,
    letterSpacing: 1.5,
    opacity: 0.5,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: -1,
  },
  recentItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F0F6FF',
  },
  recentItemAddress: {
    fontFamily: 'monospace',
    fontSize: 10,
    opacity: 0.3,
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: 'rgba(79, 195, 247, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(79, 195, 247, 0.15)',
  },
  statusText: {
    fontSize: 9,
    color: '#4FC3F7',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  emptyText: {
    opacity: 0.3,
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginTop: 32,
  },
});
