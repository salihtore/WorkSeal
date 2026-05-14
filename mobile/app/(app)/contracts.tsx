/**
 * Contracts screen — mirrors frontend contracts/page.tsx
 * My contracts list with tab filter + search
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Search, Plus } from 'lucide-react-native';
import { useWalletStore } from '@/lib/wallet-store';
import { useContracts } from '@/hooks/useContracts';
import ContractCard from '@/components/ContractCard';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AppBackground from '@/components/AppBackground';
import { ContractStatus } from '@/types';
import { COLORS, FONTS, SPACING } from '@/constants/theme';

const TABS = ['Tümü', 'Aktif', 'Onay Bekleyen', 'Tamamlananlar'];

export default function ContractsScreen() {
  const { address } = useWalletStore();
  const { contracts, loading, fetchAllContracts } = useContracts(address);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Tümü');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllContracts();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    const searched = contracts.filter(
      (c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase())
    );
    switch (activeTab) {
      case 'Aktif': return searched.filter((c) => c.status === ContractStatus.Active);
      case 'Onay Bekleyen': return searched.filter((c) => c.status === ContractStatus.Created);
      case 'Tamamlananlar': return searched.filter((c) => c.status === ContractStatus.Completed);
      default: return searched;
    }
  }, [contracts, search, activeTab]);

  return (
    <View style={styles.container}>
      <AppBackground />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>SÖZLEŞME YÖNETİMİ</Text>
            <Text style={styles.title}>Sözleşmelerim</Text>
          </View>
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => router.push('/contract/new')}
          >
            <Plus size={14} color={COLORS.primaryForeground} />
            <Text style={styles.newBtnText}>Yeni</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tabsRow}>
              {TABS.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.searchBar}>
            <Search size={13} color={COLORS.mutedForeground} />
            <TextInput
              style={styles.searchInput}
              placeholder="ID veya Başlık ile ara..."
              placeholderTextColor={COLORS.mutedForeground}
              value={search}
              onChangeText={setSearch}
              selectionColor={COLORS.primary}
            />
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <LoadingSpinner label="VERİLER YÜKLENİYOR" />
        ) : filtered.length === 0 ? (
          <EmptyState
            description="Sözleşme bulunamadı."
            actionLabel="İlk Sözleşmeni Oluştur"
            onAction={() => router.push('/contract/new')}
          />
        ) : (
          filtered.map((c) => (
            <ContractCard key={c.id} contract={c} currentAddress={address ?? undefined} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
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
  headerLabel: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: COLORS.mutedForeground,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontFamily: FONTS.sans,
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.foreground,
    letterSpacing: -1,
    lineHeight: 36,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    height: 36,
  },
  newBtnText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryForeground,
  },
  filterBar: {
    paddingVertical: SPACING.base,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING['2xl'],
    gap: 0,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: SPACING['2xl'],
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabBtnText: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.mutedForeground,
  },
  tabBtnTextActive: {
    color: COLORS.primaryForeground,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 40,
    marginHorizontal: SPACING['2xl'],
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.foreground,
  },
});
