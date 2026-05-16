import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { Shield, Zap, FileText, Lock } from 'lucide-react-native';

import AppBackground from '@/components/AppBackground';

import {
  GOOGLE_CLIENT_ID,
  prepareZkLoginSession,
  completeZkLogin,
  type ZkPreparedSession,
} from '@/lib/zklogin';
import { useWalletStore } from '@/lib/wallet-store';
import { COLORS, FONTS } from '@/constants/theme';

WebBrowser.maybeCompleteAuthSession();

const features = [
  { num: '01', title: 'Dijital Sözleşme', desc: 'Blockchain\'e kayıtlı sözleşmeler.', Icon: FileText },
  { num: '02', title: 'Güvenli Escrow', desc: 'Ödeme iş tamamlanana kadar kilitli.', Icon: Shield },
  { num: '03', title: 'Şeffaf Süreç', desc: 'Tüm adımlar zincir üzerinde.', Icon: Zap },
  { num: '04', title: 'Anlık Ödeme', desc: 'Onayda otomatik transfer.', Icon: Lock },
];

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState<string>('');
  const preparedRef = useRef<ZkPreparedSession | null>(null);
  const { setAddress, isConnected } = useWalletStore();

  useEffect(() => {
    if (isConnected) {
      router.replace('/(tabs)/escrow');
    }
  }, [isConnected]);

  useEffect(() => {
    if (preparedRef.current) return;
    prepareZkLoginSession()
      .then((prepared) => {
        preparedRef.current = prepared;
        setNonce(prepared.nonce);
        console.log('[Login] Nonce hazır (Raw):', prepared.nonce);
      })
      .catch((e) => {
        console.error('[Login] Nonce hazırlama hatası:', e);
        setError('Ağ hatası: Sui Testnet\'e bağlanılamadı.');
      });
  }, []);

  const handleLogin = async () => {
    if (!nonce || !preparedRef.current) {
      setError('Hazırlanıyor, lütfen bekleyin...');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const returnUrl = Linking.createURL('auth');
      const redirectUri = `https://redirectmeto.com/${returnUrl}`;
      console.log('\n[Google Console -> Web Client -> Yönlendirme URI\'sine EKLENECEK LİNK]:\n', redirectUri, '\n');

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&response_type=id_token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20email%20profile&nonce=${nonce}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, returnUrl);

      if (result.type === 'success' && result.url) {
        const urlParts = result.url.split('#');
        if (urlParts.length > 1) {
          const fragment = urlParts[1];
          const match = fragment.match(/id_token=([^&]+)/);
          const jwt = match ? match[1] : null;

          if (jwt) {
            console.log('[Login] JWT alındı, ZkLogin Proof süreci başlıyor...');
            const address = await completeZkLogin(jwt, preparedRef.current);
            await setAddress(address);
            router.replace('/(tabs)/escrow');
          } else {
            setError('Google URL içinde id_token dönmedi.');
          }
        } else {
          setError('Google URL parçalanamadı (Fragment bulunamadı).');
        }
      } else {
        setError(result.type === 'cancel' ? 'Giriş ekranı kapatıldı.' : 'Giriş işlemi başarısız.');
      }
    } catch (e: any) {
      console.error('[Login] Manuel OAuth Hatası:', e);
      setError(e.message || 'Bilinmeyen bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const buttonReady = !!nonce && !isLoading;

  return (
    <View style={styles.container}>
      <ScrollView
        style={[styles.scroll, { zIndex: 10 }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.header}>
          <Text style={styles.logo}>
            Work<Text style={styles.logoAccent}>Seal</Text>
          </Text>
          <View style={styles.liveDot}>
            <View style={styles.dot} />
            <Text style={styles.liveText}>Sui Testnet · Canlı</Text>
          </View>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            Freelance işlerini{'\n'}
            <Text style={styles.heroTitleAccent}>zincire kilitle.</Text>
          </Text>
          <Text style={styles.heroSub}>
            Sui Blockchain üzerinde güvenli sözleşmeler,
            otomatik escrow ve şeffaf iş yönetimi.
          </Text>
        </View>

        {/* Google Giriş Butonu */}
        <TouchableOpacity
          style={[styles.googleButton, !buttonReady && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={!buttonReady}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <>
              <ActivityIndicator color={COLORS.primaryForeground} size="small" />
              <Text style={styles.buttonText}>ZK Proof oluşturuluyor...</Text>
            </>
          ) : !nonce ? (
            <>
              <ActivityIndicator color={COLORS.primaryForeground} size="small" />
              <Text style={styles.buttonText}>Hazırlanıyor...</Text>
            </>
          ) : (
            <>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.buttonText}>Google ile Giriş Yap</Text>
            </>
          )}
        </TouchableOpacity>

        {isLoading && (
          <Text style={styles.hint}>
            ZK proof Mysten Prover tarafından oluşturuluyor...
          </Text>
        )}

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <View style={styles.zkBadge}>
          <Text style={styles.zkBadgeText}>
            ZkLogin · Native Google Sign-In · Testnet
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Özellikler */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionLabel}>NASIL ÇALIŞIR</Text>
          <Text style={styles.sectionTitle}>
            Dört adımda{'\n'}
            <Text style={styles.sectionTitleMuted}>güvenli freelance.</Text>
          </Text>
          <View style={styles.featuresGrid}>
            {features.map(({ num, title, desc, Icon }) => (
              <View key={num} style={styles.featureCard}>
                <Text style={styles.featureNum}>{num}</Text>
                <Icon
                  size={20}
                  color={COLORS.primary}
                  style={{ marginTop: 8, marginBottom: 6 }}
                />
                <Text style={styles.featureTitle}>{title}</Text>
                <Text style={styles.featureDesc}>{desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 WorkSeal · Sui Testnet</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  logo: {
    fontFamily: FONTS.sans,
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.foreground,
    letterSpacing: -1,
    marginBottom: 12,
  },
  logoAccent: {
    color: COLORS.primary,
  },
  liveDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  liveText: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: 'rgba(79,195,247,0.6)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  heroTitle: {
    fontFamily: FONTS.sans,
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.foreground,
    letterSpacing: -1.5,
    lineHeight: 46,
    textAlign: 'center',
    marginBottom: 16,
  },
  heroTitleAccent: {
    color: 'rgba(240,246,255,0.35)',
    fontWeight: '300',
  },
  heroSub: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 340,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 24,
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 0,
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  googleIcon: {
    fontFamily: FONTS.sans,
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primaryForeground,
  },
  buttonText: {
    fontFamily: FONTS.sans,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryForeground,
    letterSpacing: 0.3,
  },
  hint: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: 'rgba(79,195,247,0.6)',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  errorText: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: '#ff6b6b',
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  zkBadge: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  zkBadgeText: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: 'rgba(79,195,247,0.4)',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 40,
  },
  featuresSection: {
    paddingHorizontal: 24,
  },
  sectionLabel: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: 'rgba(79,195,247,0.6)',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: FONTS.sans,
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.foreground,
    letterSpacing: -1,
    lineHeight: 34,
    marginBottom: 28,
  },
  sectionTitleMuted: {
    color: COLORS.mutedForeground,
    fontWeight: '300',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featureCard: {
    width: '50%',
    backgroundColor: COLORS.background,
    padding: 20,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  featureNum: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: 'rgba(79,195,247,0.4)',
    letterSpacing: 2,
  },
  featureTitle: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.foreground,
    marginBottom: 6,
  },
  featureDesc: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    color: COLORS.mutedForeground,
    lineHeight: 16,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 8,
  },
  footerText: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.mutedForeground,
  },
});