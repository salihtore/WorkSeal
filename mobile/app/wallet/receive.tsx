/**
 * Slush Wallet Receive SUI / Live Dynamically Generated QR Code
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { router } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { useWalletStore } from '@/lib/wallet-store';
import AppBackground from '@/components/AppBackground';
import Button from '@/components/ui/Button';
import { ArrowLeft, Copy, Share2, Check } from 'lucide-react-native';
import { COLORS, FONTS, SPACING } from '@/constants/theme';

export default function WalletReceiveScreen() {
  const { address } = useWalletStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!address) return;
    Alert.alert('Cüzdan Adresi', 'Adres panoya kopyalandı:\n' + address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    if (!address) return;
    try {
      await Share.share({
        message: `Sui Testnet Cüzdan Adresim:\n${address}`,
        title: 'WorkSeal / Slush Wallet Cüzdan Adresi',
      });
    } catch (error: any) {
      Alert.alert('Paylaşım Hatası', error?.message);
    }
  };

  const qrValue = address || 'https://workseal.xyz/wallet';

  return (
    <View style={styles.container}>
      <AppBackground />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color={COLORS.foreground} />
          </TouchableOpacity>
          <Text style={styles.title}>SUI Al</Text>
          <View style={{ width: 20 }} />
        </View>

        <View style={styles.section}>
          {/* QR Kod Kartı */}
          <View style={styles.qrCard}>
            <View style={styles.qrHeader}>
              <Text style={styles.qrTitle}>CANLI SUI TESTNET QR KODU</Text>
              <Text style={styles.qrSub}>Sadece SUI Testnet varlıkları gönderin.</Text>
            </View>

            <View style={styles.qrBoxOuter}>
              <View style={styles.qrBoxInner}>
                <QRCode
                  value={qrValue}
                  size={200}
                  color={COLORS.primary}
                  backgroundColor={COLORS.card}
                />
                <View style={styles.qrCenterLogo}>
                  <Text style={styles.qrLogoText}>SUI</Text>
                </View>
              </View>
            </View>

            <View style={styles.addressBox}>
              <Text style={styles.addressLabel}>CÜZDAN ADRESİ</Text>
              <Text style={styles.addressValue} selectable>
                {address || 'Cüzdan Bağlı Değil'}
              </Text>
            </View>

            <View style={styles.buttonsRow}>
              <Button
                onPress={handleCopy}
                variant="outline"
                style={styles.btnHalf as any}
              >
                {copied ? (
                  <>
                    <Check size={16} color={COLORS.emerald} />
                    <Text style={[styles.btnText, { color: COLORS.emerald }]}>Kopyalandı</Text>
                  </>
                ) : (
                  <>
                    <Copy size={16} color={COLORS.foreground} />
                    <Text style={styles.btnText}>Kopyala</Text>
                  </>
                )}
              </Button>

              <Button onPress={handleShare} style={styles.btnHalf as any}>
                <Share2 size={16} color={COLORS.background} />
                <Text style={styles.btnTextPrimary}>Paylaş</Text>
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING['2xl'],
    paddingTop: 56,
    paddingBottom: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  title: { fontFamily: FONTS.sans, fontSize: 20, fontWeight: '700', color: COLORS.foreground },
  section: { padding: SPACING['2xl'], alignItems: 'center' },
  qrCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING['2xl'],
    alignItems: 'center',
    gap: 28,
  },
  qrHeader: { alignItems: 'center', gap: 6 },
  qrTitle: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.primary, letterSpacing: 2, fontWeight: '700' },
  qrSub: { fontFamily: FONTS.sans, fontSize: 12, color: COLORS.mutedForeground },
  qrBoxOuter: {
    padding: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qrBoxInner: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  qrCenterLogo: {
    position: 'absolute',
    width: 48,
    height: 48,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrLogoText: { fontFamily: FONTS.mono, fontSize: 14, fontWeight: '900', color: COLORS.primary },
  addressBox: { width: '100%', alignItems: 'center', gap: 8, paddingHorizontal: 10 },
  addressLabel: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.mutedForeground, letterSpacing: 2 },
  addressValue: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.foreground, textAlign: 'center', lineHeight: 18 },
  buttonsRow: { flexDirection: 'row', gap: 12, width: '100%', marginTop: 8 },
  btnHalf: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnText: { fontFamily: FONTS.sans, fontSize: 13, fontWeight: '700', color: COLORS.foreground },
  btnTextPrimary: { fontFamily: FONTS.sans, fontSize: 13, fontWeight: '700', color: COLORS.background },
});
