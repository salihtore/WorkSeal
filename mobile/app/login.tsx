/**
 * app/login.tsx — ZkLogin ile Giriş (Hook-based)
 *
 * NEDEN HOOK-BASED?
 * expo-auth-session, WebBrowser redirect'ini yakalamak için
 * hook bağlamına ihtiyaç duyar. İmperatif AuthRequest kullanımı
 * "dismiss" hatasına yol açar çünkü redirect capture edilemiyor.
 *
 * AKIŞ:
 * 1. Mount → prepareZkLoginSession() → nonce üret
 * 2. Google.useAuthRequest(nonce ile) → request hazır
 * 3. Buton → promptAsync()
 * 4. response.type === 'success' → completeZkLogin(jwt) → adres
 * 5. setAddress → index.tsx dashboard'a yönlendirir
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
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

// Konfigürasyon artık handleLogin içerisinde nonce ile birlikte dinamik yapılıyor.

// ─── Sabitler ────────────────────────────────────────────────────────────────

const features = [
  { num: '01', title: 'Dijital Sözleşme', desc: 'Blockchain\'e kayıtlı sözleşmeler.', Icon: FileText },
  { num: '02', title: 'Güvenli Escrow', desc: 'Ödeme iş tamamlanana kadar kilitli.', Icon: Shield },
  { num: '03', title: 'Şeffaf Süreç', desc: 'Tüm adımlar zincir üzerinde.', Icon: Zap },
  { num: '04', title: 'Anlık Ödeme', desc: 'Onayda otomatik transfer.', Icon: Lock },
];

// ─── Bileşen ─────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState<string>('');
  const preparedRef = useRef<ZkPreparedSession | null>(null);
  const { setAddress } = useWalletStore();

  const redirectUri = AuthSession.makeRedirectUri();

  // Auth Request Hook
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['openid', 'email', 'profile'],
      redirectUri,
      responseType: AuthSession.ResponseType.IdToken,
      extraParams: nonce ? { nonce } : {},
    },
    { authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth' }
  );

  // ── Mount: Epoch al, keypair + nonce üret ──────────────────────────────────
  useEffect(() => {
    prepareZkLoginSession()
      .then((prepared) => {
        preparedRef.current = prepared;
        setNonce(prepared.nonce);
        console.log('[Login] Nonce hazır');
      })
      .catch((e) => {
        console.error('[Login] Nonce hazırlama hatası:', e);
        setError('Ag hatasi: Sui Testnet e baglanilamadi.');
      });
  }, []);

  // ── AuthSession Response Dinleyici ─────────────────────────────────────────
  useEffect(() => {
    if (response?.type === 'success') {
      const { params } = response;
      const jwt = params.id_token;

      if (!jwt) {
        setError('Google id_token döndürmedi.');
        setIsLoading(false);
        return;
      }

      console.log('[Login] JWT alındı, ZkLogin Proof süreci başlıyor...');
      completeZkLogin(jwt, preparedRef.current!)
        .then(async (address) => {
          await setAddress(address);
        })
        .catch((err) => {
          console.error('[Login] ZkLogin Proof Hatası:', err);
          setError(err.message || 'ZK Proof alınamadı.');
          setIsLoading(false);
        });
    } else if (response?.type === 'error') {
      setError(response.error?.message || 'Giriş işlemi başarısız oldu.');
      setIsLoading(false);
    } else if (response?.type === 'dismiss') {
      setError('Giriş ekranı kapatıldı.');
      setIsLoading(false);
    }
  }, [response]);

  // ── Login Butonu Handler ───────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!nonce || !preparedRef.current || !request) {
      setError('Hazırlanıyor, lütfen bekleyin...');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    promptAsync();
  };

  // ─── UI ──────────────────────────────────────────────────────────────────

  const buttonReady = !!nonce && !!request && !isLoading;

  return (
    <View style={styles.container}>
      <AppBackground />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Logo */}
        <View style={styles.header}>
          <Text style={styles.logo}>Work<Text style={styles.logoAccent}>Seal</Text></Text>
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
            Sui Blockchain üzerinde güvenli sözleşmeler, otomatik escrow ve şeffaf iş yönetimi.
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
          <Text style={styles.hint}>ZK proof Enoki tarafından oluşturuluyor...</Text>
        )}

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <View style={styles.zkBadge}>
          <Text style={styles.zkBadgeText}>🔐 Sui ZkLogin + Enoki · Testnet</Text>
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
                <Icon size={20} color={COLORS.primary} style={{ marginTop: 8, marginBottom: 6 }} />
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

// ─── Stiller ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { paddingTop: 60, paddingBottom: 40 },
  header: { alignItems: 'center', paddingHorizontal: 24, marginBottom: 32 },
  logo: { fontFamily: FONTS.sans, fontSize: 32, fontWeight: '900', color: COLORS.foreground, letterSpacing: -1, marginBottom: 12 },
  logoAccent: { color: COLORS.primary },
  liveDot: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' },
  liveText: { fontFamily: FONTS.mono, fontSize: 10, color: 'rgba(79,195,247,0.6)', letterSpacing: 1.5, textTransform: 'uppercase' },
  hero: { alignItems: 'center', paddingHorizontal: 24, marginBottom: 40 },
  heroTitle: { fontFamily: FONTS.sans, fontSize: 40, fontWeight: '900', color: COLORS.foreground, letterSpacing: -1.5, lineHeight: 46, textAlign: 'center', marginBottom: 16 },
  heroTitleAccent: { color: 'rgba(240,246,255,0.35)', fontWeight: '300' },
  heroSub: { fontFamily: FONTS.sans, fontSize: 14, color: COLORS.mutedForeground, textAlign: 'center', lineHeight: 22, maxWidth: 340 },
  googleButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginHorizontal: 24, backgroundColor: COLORS.primary, height: 52,
    borderRadius: 0, marginBottom: 12,
  },
  buttonDisabled: { opacity: 0.5 },
  googleIcon: { fontFamily: FONTS.sans, fontSize: 18, fontWeight: '900', color: COLORS.primaryForeground },
  buttonText: { fontFamily: FONTS.sans, fontSize: 15, fontWeight: '700', color: COLORS.primaryForeground, letterSpacing: 0.3 },
  hint: { fontFamily: FONTS.mono, fontSize: 10, color: 'rgba(79,195,247,0.6)', textAlign: 'center', lineHeight: 16, paddingHorizontal: 24, marginBottom: 8 },
  errorText: { fontFamily: FONTS.mono, fontSize: 11, color: '#ff6b6b', textAlign: 'center', paddingHorizontal: 24, marginBottom: 8 },
  zkBadge: { alignItems: 'center', marginTop: 8, marginBottom: 4 },
  zkBadgeText: { fontFamily: FONTS.mono, fontSize: 10, color: 'rgba(79,195,247,0.4)', letterSpacing: 0.5 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 40 },
  featuresSection: { paddingHorizontal: 24 },
  sectionLabel: { fontFamily: FONTS.mono, fontSize: 10, color: 'rgba(79,195,247,0.6)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 },
  sectionTitle: { fontFamily: FONTS.sans, fontSize: 28, fontWeight: '900', color: COLORS.foreground, letterSpacing: -1, lineHeight: 34, marginBottom: 28 },
  sectionTitleMuted: { color: COLORS.mutedForeground, fontWeight: '300' },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0, borderWidth: 1, borderColor: COLORS.border },
  featureCard: { width: '50%', backgroundColor: COLORS.background, padding: 20, borderWidth: 0.5, borderColor: COLORS.border },
  featureNum: { fontFamily: FONTS.mono, fontSize: 10, color: 'rgba(79,195,247,0.4)', letterSpacing: 2 },
  featureTitle: { fontFamily: FONTS.sans, fontSize: 14, fontWeight: '700', color: COLORS.foreground, marginBottom: 6 },
  featureDesc: { fontFamily: FONTS.sans, fontSize: 11, color: COLORS.mutedForeground, lineHeight: 16 },
  footer: { alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 8 },
  footerText: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.mutedForeground },
});
