/**
 * Invoices screen — mirrors frontend invoices/page.tsx
 */

import React, { useState, useMemo } from 'react';
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
import { useWalletStore } from '@/lib/wallet-store';
import { useContracts } from '@/hooks/use-contracts';
import AppBackground from '@/components/AppBackground';
import Button from '@/components/ui/Button';
import { router } from 'expo-router';
import { Receipt, Search, Download, Copy, ArrowLeft } from 'lucide-react-native';
import { mistToSui, formatTimestamp } from '@/types';
import { COLORS, FONTS, SPACING } from '@/constants/theme';

export default function InvoicesScreen() {
  const { address } = useWalletStore();
  const { contracts, loading } = useContracts(address);
  const [search, setSearch] = useState('');

  const invoices = useMemo(() => {
    return contracts
      .flatMap((c) =>
        c.milestones
          .filter((m) => m.is_paid)
          .map((m, idx) => ({
            id: `WSL-${c.id.slice(0, 4)}-${idx + 1}`.toUpperCase(),
            contractId: c.id,
            contractTitle: `${c.title} - ${m.title}`,
            date: formatTimestamp(c.created_at),
            amount: `${mistToSui(m.amount)} SUI`,
            status: 'paid',
          }))
      )
      .filter(
        (inv) =>
          inv.id.includes(search.toUpperCase()) ||
          inv.contractTitle.toLowerCase().includes(search.toLowerCase())
      );
  }, [contracts, search]);

  const handleDownload = (id: string) => {
    Alert.alert('Fatura İndirme', `${id} faturası PDF olarak indiriliyor...`);
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
            <Text style={styles.backText}>Geri Dön</Text>
          </TouchableOpacity>
          <View style={{ marginTop: 16 }}>
            <Text style={styles.headerSubtitle}>ÖDEME KANITLARI</Text>
            <Text style={styles.title}>Faturalar</Text>
          </View>
        </View>

        <View style={styles.section}>
          {/* Subtitle & Search Bar */}
          <View style={styles.filterBar}>
            <Text style={styles.subtext}>
              Tamamlanmış ve on-chain mutabakatı sağlanmış akıllı sözleşmelerinize ait kriptografik ödeme kanıtları.
            </Text>

            <View style={styles.searchBox}>
              <Search size={14} color={COLORS.mutedForeground} style={styles.searchIcon} />
              <TextInput
                placeholder="Fatura No ile arama yapın..."
                placeholderTextColor={COLORS.mutedForeground}
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
            </View>
          </View>

          {/* Table */}
          {loading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator color={COLORS.primary} size="large" />
              <Text style={styles.loadingSub}>KAYITLAR YÜKLENİYOR</Text>
            </View>
          ) : invoices.length > 0 ? (
            <View style={styles.tableCard}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  <View style={styles.tableHead}>
                    <Text style={[styles.thText, { width: 110 }]}>FATURA NO</Text>
                    <Text style={[styles.thText, { width: 160 }]}>İLGİLİ SÖZLEŞME</Text>
                    <Text style={[styles.thText, { width: 100 }]}>TARİH</Text>
                    <Text style={[styles.thText, { width: 90, textAlign: 'right' }]}>TUTAR</Text>
                    <Text style={[styles.thText, { width: 80, textAlign: 'center' }]}>DURUM</Text>
                    <Text style={[styles.thText, { width: 90, textAlign: 'right' }]}>İŞLEM</Text>
                  </View>

                  {invoices.map((inv) => (
                    <View key={inv.id} style={styles.tableRow}>
                      <View style={[styles.tdIdBox, { width: 110 }]}>
                        <Receipt size={14} color={COLORS.mutedForeground} />
                        <Text style={styles.tdId}>{inv.id}</Text>
                        <TouchableOpacity onPress={() => Alert.alert('Kopyalandı', inv.id)}>
                          <Copy size={12} color={COLORS.mutedForeground} />
                        </TouchableOpacity>
                      </View>
                      <Text style={[styles.tdContract, { width: 160 }]} numberOfLines={1}>
                        {inv.contractTitle}
                      </Text>
                      <Text style={[styles.tdDate, { width: 100 }]}>{inv.date}</Text>
                      <Text style={[styles.tdAmount, { width: 90 }]}>{inv.amount}</Text>
                      <View style={[styles.tdStatusBox, { width: 80 }]}>
                        <View style={styles.badgePaid}>
                          <Text style={styles.badgePaidText}>ÖDENDİ</Text>
                        </View>
                      </View>
                      <View style={[styles.tdActionBox, { width: 90 }]}>
                        <TouchableOpacity
                          style={styles.downloadBtn}
                          onPress={() => handleDownload(inv.id)}
                        >
                          <Download size={12} color={COLORS.primary} />
                          <Text style={styles.downloadBtnText}>İndir</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>·</Text>
              <Text style={styles.emptyText}>Cüzdan adresinizle eşleşen onaylanmış bir ödeme makbuzu veya on-chain fatura kaydı bulunmuyor.</Text>
            </View>
          )}
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
    paddingHorizontal: SPACING['2xl'],
    paddingTop: 56,
    paddingBottom: SPACING['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  backText: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.foreground, fontWeight: '700' },
  headerSubtitle: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: COLORS.mutedForeground,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontFamily: FONTS.sans,
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.foreground,
    letterSpacing: -1,
  },
  section: { padding: SPACING['2xl'], gap: 24 },
  filterBar: { gap: 16 },
  subtext: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.mutedForeground, lineHeight: 16 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    height: 40,
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.foreground,
  },
  emptyContainer: { paddingVertical: 80, alignItems: 'center', gap: 12 },
  loadingSub: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.mutedForeground, letterSpacing: 2 },
  tableCard: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card },
  tableHead: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  thText: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.mutedForeground },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tdIdBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tdId: { fontFamily: FONTS.mono, fontSize: 12, color: COLORS.foreground, fontWeight: '700' },
  tdContract: { fontFamily: FONTS.sans, fontSize: 12, color: COLORS.mutedForeground },
  tdDate: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.mutedForeground },
  tdAmount: { fontFamily: FONTS.mono, fontSize: 12, fontWeight: '700', color: COLORS.foreground, textAlign: 'right' },
  tdStatusBox: { alignItems: 'center', justifyContent: 'center' },
  badgePaid: { backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', paddingHorizontal: 8, paddingVertical: 4 },
  badgePaidText: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.emerald, fontWeight: '700' },
  tdActionBox: { alignItems: 'flex-end', justifyContent: 'center' },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(79,195,247,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  downloadBtnText: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.primary, textTransform: 'uppercase' },
  emptyBox: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card, paddingVertical: 80, alignItems: 'center' },
  emptyIcon: { fontFamily: FONTS.sans, fontSize: 48, fontWeight: '900', color: COLORS.border, marginBottom: 12 },
  emptyText: { fontFamily: FONTS.mono, fontSize: 12, color: COLORS.mutedForeground },
});
