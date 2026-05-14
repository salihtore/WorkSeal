/**
 * app/login.tsx — Wallet Connection Screen
 * Opens Slush Wallet via deep link for authentication.
 * Mirrors frontend connect/page.tsx.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  useAnimatedValue,
  ActivityIndicator,
} from 'react-native';
import { Shield, Zap, FileText, Lock, Wallet } from 'lucide-react-native';
import AppBackground from '@/components/AppBackground';
import { connectSlushWallet } from '@/lib/slush-wallet';
import { COLORS, FONTS, SPACING, FONT_SIZES } from '@/constants/theme';

const features = [
  {
    num: '01',
    title: 'Dijital Sözleşme',
    desc: 'İş tanımını, teslim tarihini ve ödeme miktarını blockchain\'e kaydet.',
    Icon: FileText,
  },
  {
    num: '02',
    title: 'Güvenli Escrow',
    desc: 'Ödeme iş tamamlanana kadar akıllı sözleşmede kilitli kalır.',
    Icon: Shield,
  },
  {
    num: '03',
    title: 'Şeffaf Süreç',
    desc: 'Tüm adımlar zincir üzerinde, herhangi bir aracı olmadan yürür.',
    Icon: Zap,
  },
  {
    num: '04',
    title: 'Anlık Ödeme',
    desc: 'Müşteri onayladığı anda ödeme freelancer\'a otomatik aktarılır.',
    Icon: Lock,
  },
];

export default function LoginScreen() {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await connectSlushWallet();
      // The app will receive the address via deep link callback
      // Slush Wallet redirects to workseal://wallet/connect?address=0x...
      // The _layout.tsx listener handles it and saves the address
    } catch (err: any) {
      console.error('Wallet connect error:', err);
    } finally {
      // Keep loading while waiting for Slush callback
      // Will be reset when deep link is received
      setTimeout(() => setIsConnecting(false), 10000);
    }
  };

  return (
    <View style={styles.container}>
      <AppBackground />
      <ScrollView
        style={styles.scroll}
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
            Sui Blockchain üzerinde güvenli sözleşmeler, otomatik escrow ve şeffaf iş yönetimi — hiçbir aracı olmadan.
          </Text>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={[styles.connectButton, isConnecting && styles.connectButtonLoading]}
          onPress={handleConnect}
          disabled={isConnecting}
          activeOpacity={0.85}
        >
          {isConnecting ? (
            <>
              <ActivityIndicator color={COLORS.primaryForeground} size="small" />
              <Text style={styles.connectText}>Slush Wallet Açılıyor...</Text>
            </>
          ) : (
            <>
              <Wallet size={18} color={COLORS.primaryForeground} />
              <Text style={styles.connectText}>Slush Wallet ile Bağlan</Text>
            </>
          )}
        </TouchableOpacity>

        {isConnecting && (
          <Text style={styles.connectHint}>
            Slush Wallet uygulamasında onayı verin.{'\n'}
            Ardından WorkSeal'e otomatik döneceksiniz.
          </Text>
        )}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Features */}
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

        {/* Stats */}
        <View style={styles.divider} />
        <View style={styles.statsRow}>
          {[
            { val: '0', label: 'Orta Yok', sub: 'Tamamen merkezi olmayan' },
            { val: '100%', label: 'Zincir Üzeri', sub: 'Tüm veriler blockchain\'de' },
            { val: '∞', label: 'Şeffaflık', sub: 'Herkese açık denetim' },
          ].map(({ val, label, sub }) => (
            <View key={label} style={styles.statItem}>
              <Text style={styles.statVal}>{val}</Text>
              <Text style={styles.statLabel}>{label}</Text>
              <Text style={styles.statSub}>{sub}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
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
    backgroundColor: COLORS.emerald,
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
  connectButton: {
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
  connectButtonLoading: {
    opacity: 0.8,
  },
  connectText: {
    fontFamily: FONTS.sans,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryForeground,
    letterSpacing: 0.3,
  },
  connectHint: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: 'rgba(79,195,247,0.6)',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 24,
    marginBottom: 8,
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
  statsRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 0,
  },
  statItem: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingVertical: 28,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  statVal: {
    fontFamily: FONTS.mono,
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.foreground,
    marginBottom: 4,
    textAlign: 'center',
  },
  statSub: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    lineHeight: 12,
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
