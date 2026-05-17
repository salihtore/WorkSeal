import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ExternalLink, Shield, Wallet, KeyRound } from 'lucide-react-native';

import AppBackground from '@/components/AppBackground';
import { openConnectInSlush } from '@/lib/slush-links';
import { useWalletStore } from '@/lib/wallet-store';
import { COLORS, FONTS } from '@/constants/theme';

export default function LoginScreen() {
  const { address, isConnected, connectSlush, setAddress } = useWalletStore();
  const [slushAddress, setSlushAddress] = useState(address ?? '');
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    if (isConnected) {
      router.replace('/(tabs)/escrow');
    }
  }, [isConnected]);

  const handleOpenSlush = async () => {
    setIsOpening(true);
    try {
      await connectSlush();
      await openConnectInSlush();
      router.replace('/(tabs)/escrow');
    } catch (e: any) {
      Alert.alert('Slush acilamadi', e?.message || 'Slush Wallet baglantisi baslatilamadi.');
    } finally {
      setIsOpening(false);
    }
  };

  const handleSaveAddress = async () => {
    const normalized = slushAddress.trim();
    if (!/^0x[a-fA-F0-9]{64}$/.test(normalized)) {
      Alert.alert('Gecersiz adres', 'Lutfen Slush Wallet hesabina ait tam Sui adresini gir.');
      return;
    }

    await setAddress(normalized);
    router.replace('/(tabs)/escrow');
  };

  return (
    <View style={styles.container}>
      <AppBackground />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>
            Work<Text style={styles.logoAccent}>Seal</Text>
          </Text>
          <View style={styles.liveDot}>
            <View style={styles.dot} />
            <Text style={styles.liveText}>Sui Testnet · Slush Wallet</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            Slush kasanla{'\n'}
            <Text style={styles.heroTitleAccent}>islem imzala.</Text>
          </Text>
          <Text style={styles.heroSub}>
            WorkSeal mobile verileri native okur. Imza, gas ve fon hareketleri Slush icindeki
            WorkSeal web dApp uzerinden onaylanir.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, isOpening && styles.buttonDisabled]}
          onPress={handleOpenSlush}
          disabled={isOpening}
          activeOpacity={0.85}
        >
          <Wallet size={18} color={COLORS.primaryForeground} />
          <Text style={styles.primaryButtonText}>
            {isOpening ? 'Slush aciliyor...' : 'Slush Wallet ile Devam Et'}
          </Text>
          <ExternalLink size={16} color={COLORS.primaryForeground} />
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Shield size={16} color={COLORS.primary} />
          <Text style={styles.infoText}>
            WorkSeal private key, seed phrase veya Slush oturumu saklamaz. Sadece public adresini
            kullanarak sozlesmelerdeki rolunu filtreler.
          </Text>
        </View>

        <View style={styles.addressBox}>
          <View style={styles.addressHeader}>
            <KeyRound size={16} color={COLORS.primary} />
            <Text style={styles.addressTitle}>Slush adresini mobile'a bagla</Text>
          </View>
          <Text style={styles.addressHint}>
            Native ekranda sana ait sozlesme aksiyonlarini gostermek icin Slush public adresini
            kaydedebilirsin. Imza yine Slush onay ekraninda atilir.
          </Text>
          <TextInput
            style={styles.addressInput}
            value={slushAddress}
            onChangeText={setSlushAddress}
            placeholder="0x..."
            placeholderTextColor="rgba(240,246,255,0.35)"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.secondaryButton} onPress={handleSaveAddress}>
            <Text style={styles.secondaryButtonText}>Adresi Kaydet ve Devam Et</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24 },
  header: { alignItems: 'center', marginBottom: 36 },
  logo: {
    fontFamily: FONTS.sans,
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.foreground,
    marginBottom: 12,
  },
  logoAccent: { color: COLORS.primary },
  liveDot: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' },
  liveText: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: 'rgba(79,195,247,0.7)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  hero: { alignItems: 'center', marginBottom: 32 },
  heroTitle: {
    fontFamily: FONTS.sans,
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.foreground,
    lineHeight: 46,
    textAlign: 'center',
    marginBottom: 16,
  },
  heroTitleAccent: { color: 'rgba(240,246,255,0.38)', fontWeight: '300' },
  heroSub: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    lineHeight: 22,
  },
  primaryButton: {
    height: 54,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: {
    fontFamily: FONTS.sans,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryForeground,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    padding: 14,
    marginBottom: 22,
  },
  infoText: {
    flex: 1,
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.mutedForeground,
    lineHeight: 16,
  },
  addressBox: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    padding: 18,
    gap: 12,
  },
  addressHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addressTitle: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.foreground,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  addressHint: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: COLORS.mutedForeground,
    lineHeight: 18,
  },
  addressInput: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    color: COLORS.foreground,
    paddingHorizontal: 12,
    fontFamily: FONTS.mono,
    fontSize: 12,
  },
  secondaryButton: {
    height: 46,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
