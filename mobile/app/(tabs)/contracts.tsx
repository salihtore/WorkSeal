/**
 * Operations Hub: Contracts & Disputes
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
} from 'react-native';
import { router } from 'expo-router';
import { useWalletStore } from '@/lib/wallet-store';
import { useContracts } from '@/hooks/use-contracts';
import AppBackground from '@/components/AppBackground';
import Button from '@/components/ui/Button';
import {
  ArrowRight,
  Search,
  Plus,
  AlertTriangle,
  Clock,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react-native';
import { mistToSui, getStatusLabel, getStatusColor, formatTimestamp } from '@/types';
import { COLORS, FONTS, SPACING } from '@/constants/theme';

const CONTRACT_TABS = ['Tümü', 'Aktif', 'Onay Bekleyen', 'Tamamlananlar'];

export default function OperationsContractsScreen() {
  const { address } = useWalletStore();
  const { contracts, loading } = useContracts(address);
  const [activeSection, setActiveSection] = useState<'contracts' | 'disputes'>('contracts');
  const [search, setSearch] = useState('');
  const [contractSubTab, setContractSubTab] = useState('Tümü');

  const myContracts = useMemo(() => {
    if (!address) return [];
    return contracts.filter(
      (c) => c.client === address || c.freelancer === address
    );
  }, [contracts, address]);

  const searchedContracts = useMemo(() => {
    return myContracts.filter(
      (c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [myContracts, search]);

  const filteredContracts = useMemo(() => {
    switch (contractSubTab) {
      case 'Aktif':
        return searchedContracts.filter((c) => c.status === 1);
      case 'Onay Bekleyen':
        return searchedContracts.filter((c) => c.status === 0);
      case 'Tamamlananlar':
        return searchedContracts.filter((c) => c.status === 2);
      default:
        return searchedContracts;
    }
  }, [searchedContracts, contractSubTab]);

  // Anlaşmazlık verileri
  const myDisputes = useMemo(() => {
    return myContracts.filter((c) => c.status === 3);
  }, [myContracts]);

  const hasDisputes = myDisputes.length > 0;

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
          <View>
            <Text style={styles.headerSubtitle}>OPERASYON YÖNETİMİ</Text>
            <Text style={styles.title}>İşlerim</Text>
          </View>
          <Button
            onPress={() => router.push('/contracts/new' as any)}
            size="sm"
            style={styles.newBtn as any}
          >
            <Plus size={16} color={COLORS.background} />
            <Text style={styles.newBtnText}>Yeni Sözleşme</Text>
          </Button>
        </View>

        {/* ── ÜST KATEGORİ SEKMELERİ (SÖZLEŞMELER | SORUNLAR) ── */}
        <View style={styles.mainTabsContainer}>
          <TouchableOpacity
            style={[styles.mainTabBtn, activeSection === 'contracts' && styles.mainTabActive]}
            onPress={() => setActiveSection('contracts')}
          >
            <Text style={[styles.mainTabLabel, activeSection === 'contracts' && styles.mainTabLabelActive]}>
              Sözleşmeler ({myContracts.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainTabBtn, activeSection === 'disputes' && styles.mainTabActive]}
            onPress={() => setActiveSection('disputes')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.mainTabLabel, activeSection === 'disputes' && styles.mainTabLabelActive]}>
                Sorunlar ({myDisputes.length})
              </Text>
              {hasDisputes && <View style={styles.disputeDot} />}
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          {/* ── BÖLÜM 1: SÖZLEŞMELERİM ── */}
          {activeSection === 'contracts' && (
            <View style={{ gap: 20 }}>
              {/* Filter Bar */}
              <View style={styles.filterBar}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
                  <View style={styles.tabsBox}>
                    {CONTRACT_TABS.map((tab) => {
                      const isActive = contractSubTab === tab;
                      return (
                        <TouchableOpacity
                          key={tab}
                          style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                          onPress={() => setContractSubTab(tab)}
                        >
                          <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                            {tab}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>

                <View style={styles.searchBox}>
                  <Search size={14} color={COLORS.mutedForeground} style={styles.searchIcon} />
                  <TextInput
                    placeholder="ID veya Başlık ile ara..."
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
                  <Text style={styles.loadingSub}>VERİLER YÜKLENİYOR</Text>
                </View>
              ) : filteredContracts.length > 0 ? (
                <View style={styles.tableCard}>
                  {filteredContracts.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={styles.tableRow}
                      onPress={() => router.push(`/contracts/${c.id}` as any)}
                    >
                      <View style={styles.rowLeft}>
                        <Text style={styles.rowTitle} numberOfLines={1}>
                          {c.title}
                        </Text>
                        <View style={styles.rowSub}>
                          <Text style={styles.rowId}>{c.id.slice(0, 18)}...</Text>
                          <Text style={styles.rowDot}>·</Text>
                          <Text style={styles.rowRole}>
                            {c.client === address ? 'Benim İlanım' : `Müşteri: ${c.client.slice(0, 6)}...`}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.rowRight}>
                        <Text style={styles.rowAmount}>{mistToSui(c.total_budget)} SUI</Text>
                        <View style={[styles.badge, { borderColor: getStatusColor(c.status).border }]}>
                          <Text style={[styles.badgeText, { color: getStatusColor(c.status).text }]}>
                            {getStatusLabel(c.status)}
                          </Text>
                        </View>
                        <ArrowRight size={14} color={COLORS.mutedForeground} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyIcon}>·</Text>
                  <Text style={styles.emptyText}>Bu kategoride henüz oluşturduğunuz veya dahil olduğunuz bir sözleşme kaydı bulunmuyor.</Text>
                  <Button onPress={() => router.push('/contracts/new' as any)} size="sm">
                    İlk Akıllı Sözleşmenizi Başlatın
                  </Button>
                </View>
              )}
            </View>
          )}

          {/* ── BÖLÜM 2: ANLAŞMAZLIK MERKEZİ (SORUNLAR) ── */}
          {activeSection === 'disputes' && (
            <View style={{ gap: 20 }}>
              {loading ? (
                <View style={styles.emptyContainer}>
                  <ActivityIndicator color={COLORS.destructive} size="large" />
                  <Text style={styles.loadingSub}>KAYITLAR İNCELENİYOR</Text>
                </View>
              ) : !hasDisputes ? (
                <View style={styles.allGoodBox}>
                  <View style={styles.checkIconBox}>
                    <CheckCircle2 size={32} color={COLORS.emerald} />
                  </View>
                  <Text style={styles.allGoodTitle}>Sistem Kusursuz Çalışıyor!</Text>
                  <Text style={styles.allGoodDesc}>
                    Tüm sözleşmeleriniz mutabakat içinde ilerliyor, hakem incelemesine tabi aktif bir uyuşmazlık bulunmuyor.
                  </Text>
                </View>
              ) : (
                <View style={styles.disputesCard}>
                  {myDisputes.map((contract) => {
                    const latestDispute =
                      contract.dispute_history?.[contract.dispute_history.length - 1];
                    return (
                      <TouchableOpacity
                        key={contract.id}
                        style={styles.disputeRow}
                        onPress={() => router.push(`/contracts/${contract.id}` as any)}
                      >
                        <View style={styles.disputeLeft}>
                          <View style={styles.iconBox}>
                            <AlertTriangle size={24} color={COLORS.destructive} />
                          </View>
                          <View style={styles.disputeInfo}>
                            <View style={styles.rowTop}>
                              <Text style={styles.disputeTitle} numberOfLines={1}>
                                {contract.title}
                              </Text>
                              <View style={styles.badgeDispute}>
                                <Text style={styles.badgeDisputeText}>İNCELEMEDE</Text>
                              </View>
                            </View>
                            <View style={styles.rowMeta}>
                              <Text style={styles.metaText}>ID: {contract.id.slice(0, 10)}...</Text>
                              <Text style={styles.metaDot}>·</Text>
                              <Clock size={10} color={COLORS.mutedForeground} />
                              <Text style={styles.metaText}>
                                {formatTimestamp(latestDispute?.timestamp || contract.created_at)}
                              </Text>
                            </View>
                            {latestDispute && (
                              <View style={styles.reasonBox}>
                                <Text style={styles.reasonText}>{latestDispute.reason}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                        <View style={styles.disputeRight}>
                          <Text style={styles.detailText}>Detaylar</Text>
                          <ChevronRight size={14} color={COLORS.mutedForeground} />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
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
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING['2xl'],
    paddingTop: 56,
    paddingBottom: SPACING['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
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
  newBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 0,
  },
  newBtnText: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.background,
  },
  mainTabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING['2xl'],
  },
  mainTabBtn: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: 16,
  },
  mainTabActive: { borderBottomColor: COLORS.primary },
  mainTabLabel: { fontFamily: FONTS.sans, fontSize: 15, color: COLORS.mutedForeground, fontWeight: '500' },
  mainTabLabelActive: { color: COLORS.primary, fontWeight: '700' },
  disputeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.destructive },
  section: { padding: SPACING['2xl'] },
  filterBar: { gap: 16 },
  tabsScroll: { flexGrow: 0 },
  tabsBox: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  tabBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRightWidth: 1, borderRightColor: COLORS.border },
  tabBtnActive: { backgroundColor: COLORS.primary },
  tabText: { fontFamily: FONTS.sans, fontSize: 13, color: COLORS.mutedForeground },
  tabTextActive: { color: COLORS.background, fontWeight: '700' },
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
  searchInput: { flex: 1, fontFamily: FONTS.mono, fontSize: 12, color: COLORS.foreground },
  emptyContainer: { paddingVertical: 80, alignItems: 'center', gap: 12 },
  loadingSub: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.mutedForeground, letterSpacing: 2 },
  tableCard: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowLeft: { flex: 1, marginRight: 16 },
  rowTitle: { fontFamily: FONTS.sans, fontSize: 15, fontWeight: '700', color: COLORS.foreground, marginBottom: 6 },
  rowSub: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowId: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.mutedForeground },
  rowDot: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.mutedForeground },
  rowRole: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.mutedForeground },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowAmount: { fontFamily: FONTS.mono, fontSize: 13, fontWeight: '700', color: COLORS.primary },
  badge: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontFamily: FONTS.mono, fontSize: 9, fontWeight: '700' },
  emptyBox: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card, paddingVertical: 80, alignItems: 'center' },
  emptyIcon: { fontFamily: FONTS.sans, fontSize: 48, fontWeight: '900', color: COLORS.border, marginBottom: 12 },
  emptyText: { fontFamily: FONTS.mono, fontSize: 12, color: COLORS.mutedForeground, marginBottom: 20 },
  allGoodBox: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card, paddingVertical: 80, alignItems: 'center', paddingHorizontal: 20 },
  checkIconBox: { width: 64, height: 64, backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  allGoodTitle: { fontFamily: FONTS.sans, fontSize: 24, fontWeight: '700', color: COLORS.foreground, marginBottom: 8 },
  allGoodDesc: { fontFamily: FONTS.mono, fontSize: 12, color: COLORS.mutedForeground, textAlign: 'center' },
  disputesCard: { borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', backgroundColor: COLORS.card },
  disputeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.xl, borderBottomWidth: 1, borderBottomColor: 'rgba(239,68,68,0.2)' },
  disputeLeft: { flexDirection: 'row', alignItems: 'flex-start', flex: 1, gap: 16 },
  iconBox: { width: 48, height: 48, backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', alignItems: 'center', justifyContent: 'center' },
  disputeInfo: { flex: 1 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  disputeTitle: { fontFamily: FONTS.sans, fontSize: 16, fontWeight: '700', color: COLORS.foreground, flex: 1 },
  badgeDispute: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', paddingHorizontal: 8, paddingVertical: 3 },
  badgeDisputeText: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.destructive, fontWeight: '700' },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.mutedForeground },
  metaDot: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.mutedForeground },
  reasonBox: { marginTop: 12, padding: 12, backgroundColor: 'rgba(239,68,68,0.05)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', borderLeftWidth: 3, borderLeftColor: COLORS.destructive },
  reasonText: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.foreground, lineHeight: 16 },
  disputeRight: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 16 },
  detailText: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.mutedForeground, fontWeight: '700' },
});
