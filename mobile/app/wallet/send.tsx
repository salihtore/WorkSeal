/**
 * Slush Wallet Send SUI screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useWalletStore } from '@/lib/wallet-store';
import AppBackground from '@/components/AppBackground';
import Button from '@/components/ui/Button';
import { ArrowLeft, Send, Wallet, AlertTriangle } from 'lucide-react-native';
import { COLORS, FONTS, SPACING } from '@/constants/theme';

export default function WalletSendScreen() {
  const { address, balance, transferSui } = useWalletStore();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMax = () => {
    // Gaz için küçük bir miktar (0.01) bırak
    const curr = Number(balance.replace(',', '.'));
    const maxVal = Math.max(0, curr - 0.01).toFixed(2);
    setAmount(maxVal);
  };

  const handleSend = async () => {
    if (!recipient || recipient.length < 10) {
      Alert.alert('Hata', 'Lütfen geçerli bir Sui cüzdan adresi girin.');
      return;
    }
    if (!amount || Number(amount.replace(',', '.')) <= 0) {
      Alert.alert('Hata', 'Lütfen gönderilecek miktarı girin.');
      return;
    }

    setLoading(true);
    const success = await transferSui(recipient, amount);
    setLoading(false);

    if (success) {
      router.back();
    }
  };

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
          <Text style={styles.title}>SUI Gönder</Text>
          <View style={{ width: 20 }} />
        </View>

        <View style={styles.section}>
          {/* Bakiye Özeti */}
          <View style={styles.balancePill}>
            <Wallet size={16} color={COLORS.primary} />
            <Text style={styles.balancePillText}>
              Kullanılabilir: <Text style={styles.balanceHighlight}>{balance} SUI</Text>
            </Text>
          </View>

          {/* Form Kartı */}
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ALICI CÜZDAN ADRESİ</Text>
              <TextInput
                style={styles.input}
                placeholder="0x..."
                placeholderTextColor={COLORS.mutedForeground}
                value={recipient}
                onChangeText={setRecipient}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.amountHeader}>
                <Text style={styles.label}>GÖNDERİLECEK TUTAR</Text>
                <TouchableOpacity onPress={handleMax}>
                  <Text style={styles.maxText}>MAX</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.amountInputBox}>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.mutedForeground}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
                <Text style={styles.unitText}>SUI</Text>
              </View>
            </View>

            <View style={styles.feeBox}>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Ağ Ücreti (Gas)</Text>
                <Text style={styles.feeValue}>0.003 SUI</Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Ağ</Text>
                <Text style={styles.feeValueNet}>Sui Testnet</Text>
              </View>
            </View>

            <Button
              onPress={handleSend}
              disabled={loading}
              style={{ marginTop: 12 }}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.background} />
              ) : (
                <>
                  <Send size={16} color={COLORS.background} />
                  <Text style={styles.sendBtnText}>İşlemi İmzala & İlet</Text>
                </>
              )}
            </Button>
          </View>

          {/* Uyarı Kutusu */}
          <View style={styles.warnBox}>
            <AlertTriangle size={20} color={COLORS.primary} />
            <Text style={styles.warnText}>
              Sui Testnet üzerinde yapılan transferler geri alınamaz. Lütfen alıcı adresini iki kez kontrol edin.
            </Text>
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
  section: { padding: SPACING['2xl'], gap: 20 },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
  },
  balancePillText: { fontFamily: FONTS.mono, fontSize: 12, color: COLORS.mutedForeground },
  balanceHighlight: { color: COLORS.primary, fontWeight: '700' },
  card: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, padding: SPACING['2xl'], gap: 24 },
  inputGroup: { gap: 8 },
  label: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.mutedForeground, letterSpacing: 1.5 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    height: 48,
    fontFamily: FONTS.mono,
    fontSize: 13,
    color: COLORS.foreground,
  },
  amountHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  maxText: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.primary, fontWeight: '700' },
  amountInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    height: 56,
  },
  amountInput: { flex: 1, fontFamily: FONTS.sans, fontSize: 24, fontWeight: '700', color: COLORS.foreground },
  unitText: { fontFamily: FONTS.mono, fontSize: 16, fontWeight: '700', color: COLORS.primary, marginLeft: 12 },
  feeBox: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: 'rgba(255,255,255,0.02)', padding: 16, gap: 8 },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feeLabel: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.mutedForeground },
  feeValue: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.foreground, fontWeight: '700' },
  feeValueNet: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.emerald, fontWeight: '700' },
  sendBtnText: { fontFamily: FONTS.sans, fontSize: 14, fontWeight: '700', color: COLORS.background },
  warnBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(79,195,247,0.3)',
    backgroundColor: 'rgba(79,195,247,0.05)',
    padding: 16,
  },
  warnText: { flex: 1, fontFamily: FONTS.mono, fontSize: 11, color: COLORS.foreground, lineHeight: 16 },
});
